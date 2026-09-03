package api

import (
	"encoding/json"
	"net/http"

	"proyecto-go/db/sqlc"
	"github.com/jackc/pgx/v5/pgtype"
)

// handleProcessReferral is meant to be called right after a new user registers.
// It verifies the referral code (hash), ensures the device hasn't farmed accounts,
// and rewards the referrer.
func (s *Server) handleProcessReferral(w http.ResponseWriter, r *http.Request) {
	// Not an endpoint to be called directly by the user (usually), but can be if registration happens in two steps.
	// For this implementation, let's assume the user passes an attribution hash after signing up.
	
	_ = getUserID(r.Context()) // User ID of the newly registered user
	deviceID := getDeviceID(r.Context()) // Assuming middleware sets this if valid
	
	var req struct {
		AttributionHash string `json:"attribution_hash"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	// 1. Get Referral using hash
	ref, err := s.db.GetReferralByHash(r.Context(), pgtype.Text{String: req.AttributionHash, Valid: true})
	if err != nil {
		http.Error(w, "Invalid referral link", http.StatusNotFound)
		return
	}

	if ref.Status != "pending" {
		http.Error(w, "Referral link already used or invalid", http.StatusBadRequest)
		return
	}

	// 2. Fraud Check: Count how many referrals this device has used
	if deviceID > 0 {
		count, err := s.db.CountReferralsByDevice(r.Context(), pgtype.Int8{Int64: deviceID, Valid: true})
		if err == nil && count >= 2 { // Max 2 accounts per device allowed to be referred
			s.db.UpdateReferralStatus(r.Context(), db.UpdateReferralStatusParams{
				ID:     ref.ID,
				Status: "invalid", // Flag as fraud
			})
			http.Error(w, "Fraud detected: Device limit reached", http.StatusForbidden)
			return
		}
	}

	// 3. Complete Referral (Converted & Rewarded at the same time as requested)
	tx, err := s.dbPool.Begin(r.Context())
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())

	qtx := s.db.WithTx(tx)

	// Update referral status to rewarded
	_, err = qtx.UpdateReferralStatus(r.Context(), db.UpdateReferralStatusParams{
		ID:     ref.ID,
		Status: "rewarded",
	})
	if err != nil {
		http.Error(w, "Error updating status", http.StatusInternalServerError)
		return
	}

	// Give reward to Referrer (e.g., 50 tokens)
	// We assume a fixed reward here, could be configurable
	if ref.ReferrerUserID.Valid {
		wallet, err := qtx.GetWalletByUserID(r.Context(), ref.ReferrerUserID.Int64)
		if err != nil {
			wallet, err = qtx.CreateWallet(r.Context(), ref.ReferrerUserID.Int64)
		}

		if err == nil {
			qtx.UpdateWalletBalance(r.Context(), db.UpdateWalletBalanceParams{
				ID:     wallet.ID,
				Amount: 50, // 50 tokens
			})
		}
	}

	if err = tx.Commit(r.Context()); err != nil {
		http.Error(w, "Failed to commit referral", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Referral processed successfully"}`))
}
