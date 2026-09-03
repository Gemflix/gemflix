package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"proyecto-go/db/sqlc"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// handlePurchaseSubscription handles buying a plan using the user's wallet balance
func (s *Server) handlePurchaseSubscription(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r.Context())
	
	priceIDStr := chi.URLParam(r, "priceId")
	priceID, err := strconv.ParseInt(priceIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid price ID", http.StatusBadRequest)
		return
	}

	// 1. Validate Price and Plan
	planPrice, err := s.db.GetPlanPrice(r.Context(), priceID)
	if err != nil {
		http.Error(w, "Plan price not found", http.StatusNotFound)
		return
	}

	plan, err := s.db.GetPlan(r.Context(), planPrice.PlanID)
	if err != nil {
		http.Error(w, "Plan not found", http.StatusNotFound)
		return
	}
	
	if !plan.IsActive {
		http.Error(w, "Plan is not available for purchase", http.StatusBadRequest)
		return
	}

	// 2. Validate Wallet Balance
	wallet, err := s.db.GetWalletByUserID(r.Context(), userID)
	if err != nil {
		http.Error(w, "Wallet not found. Please deposit funds first.", http.StatusBadRequest)
		return
	}

	if wallet.Balance < planPrice.PriceCents {
		http.Error(w, "Insufficient wallet balance", http.StatusPaymentRequired)
		return
	}

	// 3. Start ACID Transaction
	tx, err := s.dbPool.Begin(r.Context())
	if err != nil {
		http.Error(w, "Internal server error starting transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())
	
	qtx := s.db.WithTx(tx)

	// Deduct balance
	wallet, err = qtx.UpdateWalletBalance(r.Context(), db.UpdateWalletBalanceParams{
		ID:     wallet.ID,
		Amount: -planPrice.PriceCents,
	})
	if err != nil {
		http.Error(w, "Failed to deduct balance", http.StatusInternalServerError)
		return
	}

	// Log transaction
	_, err = qtx.CreateWalletTransaction(r.Context(), db.CreateWalletTransactionParams{
		WalletID: wallet.ID,
		Amount:   -planPrice.PriceCents,
		Type:     "purchase_subscription",
		Description: pgtype.Text{String: "Purchase subscription: " + plan.Name, Valid: true},
	})
	if err != nil {
		http.Error(w, "Failed to log transaction", http.StatusInternalServerError)
		return
	}

	// Calculate ends_at
	startsAt := time.Now()
	var endsAt time.Time
	
	if planPrice.Interval == "monthly" {
		endsAt = startsAt.AddDate(0, 1, 0)
	} else if planPrice.Interval == "yearly" {
		endsAt = startsAt.AddDate(1, 0, 0)
	} else if planPrice.Interval == "lifetime" {
		endsAt = startsAt.AddDate(100, 0, 0) // Arbitrary far future
	} else {
		endsAt = startsAt.AddDate(0, 1, 0) // Default monthly
	}

	// Create subscription
	sub, err := qtx.CreateSubscription(r.Context(), db.CreateSubscriptionParams{
		UserID:           userID,
		PlanID:           pgtype.Int8{Int64: plan.ID, Valid: true},
		Status:           "active",
		StartsAt:         pgtype.Timestamptz{Time: startsAt, Valid: true},
		RenewsAt:         pgtype.Timestamptz{Time: endsAt, Valid: true},
		EndsAt:           pgtype.Timestamptz{Time: endsAt, Valid: true},
		PlanKeySnapshot:  pgtype.Text{String: plan.Key, Valid: true},
		PlanNameSnapshot: pgtype.Text{String: plan.Name, Valid: true},
		CurrencyPaid:     pgtype.Text{String: planPrice.Currency, Valid: true},
		PricePaidCents:   pgtype.Int8{Int64: planPrice.PriceCents, Valid: true},
	})
	if err != nil {
		http.Error(w, "Failed to create subscription", http.StatusInternalServerError)
		return
	}

	// 4. Commit transaction
	if err = tx.Commit(r.Context()); err != nil {
		http.Error(w, "Failed to complete purchase", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(sub)
}
