package api

import (
	"encoding/json"
	"net/http"
	"proyecto-go/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

// handleGetWalletBalance returns the current user's wallet and balance
func (s *Server) handleGetWalletBalance(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r.Context())

	wallet, err := s.db.GetWalletByUserID(r.Context(), userID)
	if err != nil {
		// If wallet doesn't exist, create it (lazy init)
		wallet, err = s.db.CreateWallet(r.Context(), userID)
		if err != nil {
			http.Error(w, "Error creating wallet: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	response := map[string]interface{}{
		"wallet_id": wallet.ID,
		"balance":   wallet.Balance,
		"currency":  "USD", // Default platform internal currency
	}
	json.NewEncoder(w).Encode(response)
}

// handleDepositWallet handles adding funds to the wallet
func (s *Server) handleDepositWallet(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r.Context())

	var req struct {
		Amount      int64  `json:"amount"` // In cents
		ReferenceID string `json:"reference_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	if req.Amount <= 0 {
		http.Error(w, "Deposit amount must be positive", http.StatusBadRequest)
		return
	}

	wallet, err := s.db.GetWalletByUserID(r.Context(), userID)
	if err != nil {
		wallet, err = s.db.CreateWallet(r.Context(), userID)
		if err != nil {
			http.Error(w, "Error fetching wallet", http.StatusInternalServerError)
			return
		}
	}

	// In a real app, you would verify payment with Stripe/Paypal here using reference_id
	
	// Process transaction
	wallet, err = s.db.UpdateWalletBalance(r.Context(), db.UpdateWalletBalanceParams{
		Amount: req.Amount,
		ID:     wallet.ID,
	})
	if err != nil {
		http.Error(w, "Failed to update balance", http.StatusInternalServerError)
		return
	}

	s.db.CreateWalletTransaction(r.Context(), db.CreateWalletTransactionParams{
		WalletID: wallet.ID,
		Amount:   req.Amount,
		Type:     "deposit",
		Description: pgtype.Text{String: "Wallet deposit via external gateway", Valid: true},
		ReferenceID: pgtype.Text{String: req.ReferenceID, Valid: req.ReferenceID != ""},
	})

	json.NewEncoder(w).Encode(wallet)
}
