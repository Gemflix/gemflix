package api

import (
	"encoding/json"
	"math"
	"net/http"
	"time"

	"proyecto-go/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

func (s *Server) handleRedeemPromo(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r.Context())

	var req struct {
		Code string `json:"code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	// 1. Get Promo Code
	promo, err := s.db.GetPromoCodeByCode(r.Context(), req.Code)
	if err != nil {
		http.Error(w, "Invalid promo code", http.StatusNotFound)
		return
	}

	if !promo.IsActive {
		http.Error(w, "Promo code is inactive", http.StatusBadRequest)
		return
	}

	if promo.ValidFrom.Valid && time.Now().Before(promo.ValidFrom.Time) {
		http.Error(w, "Promo code is not yet valid", http.StatusBadRequest)
		return
	}
	if promo.ValidUntil.Valid && time.Now().After(promo.ValidUntil.Time) {
		http.Error(w, "Promo code has expired", http.StatusBadRequest)
		return
	}
	if promo.MaxUses.Valid && promo.Uses >= promo.MaxUses.Int32 {
		http.Error(w, "Promo code usage limit reached", http.StatusBadRequest)
		return
	}

	// 2. Check if user already redeemed it
	_, err = s.db.CheckPromoRedemption(r.Context(), db.CheckPromoRedemptionParams{
		UserID:      userID,
		PromoCodeID: promo.ID,
	})
	if err == nil {
		http.Error(w, "You have already redeemed this code", http.StatusConflict)
		return
	}

	// 3. Process the reward atomically
	tx, err := s.dbPool.Begin(r.Context())
	if err != nil {
		http.Error(w, "Internal server error starting transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())
	
	qtx := s.db.WithTx(tx)

	// Record redemption
	_, err = qtx.RecordPromoRedemption(r.Context(), db.RecordPromoRedemptionParams{
		UserID:      userID,
		PromoCodeID: promo.ID,
	})
	if err != nil {
		http.Error(w, "Failed to record redemption", http.StatusInternalServerError)
		return
	}

	// Increment uses
	err = qtx.IncrementPromoUses(r.Context(), promo.ID)
	if err != nil {
		http.Error(w, "Failed to increment usage", http.StatusInternalServerError)
		return
	}

	// Extract float value from Numeric (approximate is fine for these types)
	valFloat, _ := promo.Value.Float64Value()

	var message string
	
	if promo.Type == "fixed" {
		// Add tokens to wallet (value * 100 for cents/tokens logic if assuming 1:100, but let's assume direct token count for app currency)
		amount := int64(math.Round(valFloat.Float64))

		wallet, err := qtx.GetWalletByUserID(r.Context(), userID)
		if err != nil {
			wallet, err = qtx.CreateWallet(r.Context(), userID)
		}
		
		_, err = qtx.UpdateWalletBalance(r.Context(), db.UpdateWalletBalanceParams{
			ID:     wallet.ID,
			Amount: amount,
		})
		if err != nil {
			http.Error(w, "Failed to add tokens", http.StatusInternalServerError)
			return
		}

		qtx.CreateWalletTransaction(r.Context(), db.CreateWalletTransactionParams{
			WalletID: wallet.ID,
			Amount:   amount,
			Type:     "promo_code",
			Description: pgtype.Text{String: "Redeemed promo: " + promo.Code, Valid: true},
		})

		message = "Successfully redeemed " + req.Code + " for tokens"

	} else if promo.Type == "free_days" {
		// Create a mock "Promo" subscription plan for the free days
		days := int(math.Round(valFloat.Float64))
		startsAt := time.Now()
		endsAt := startsAt.AddDate(0, 0, days)

		_, err = qtx.CreateSubscription(r.Context(), db.CreateSubscriptionParams{
			UserID:           userID,
			PlanID:           pgtype.Int8{}, // null plan id means custom/promo
			Status:           "active",
			StartsAt:         pgtype.Timestamptz{Time: startsAt, Valid: true},
			RenewsAt:         pgtype.Timestamptz{Time: endsAt, Valid: true},
			EndsAt:           pgtype.Timestamptz{Time: endsAt, Valid: true},
			PlanKeySnapshot:  pgtype.Text{String: "PROMO_FREE", Valid: true},
			PlanNameSnapshot: pgtype.Text{String: "Promo VIP", Valid: true},
			CurrencyPaid:     pgtype.Text{String: "USD", Valid: true},
			PricePaidCents:   pgtype.Int8{Int64: 0, Valid: true},
		})
		if err != nil {
			http.Error(w, "Failed to create free days subscription", http.StatusInternalServerError)
			return
		}
		message = "Successfully redeemed " + req.Code + " for free VIP days"
	} else if promo.Type == "percentage" {
		// A percentage code can just be recorded in redemptions, and the user can use it later during checkout.
		// Checkout logic will query `promo_redemptions` to see if they own a valid % discount.
		message = "Successfully redeemed " + req.Code + " discount. It will be applied at your next purchase."
	}

	if err = tx.Commit(r.Context()); err != nil {
		http.Error(w, "Transaction failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": message})
}
