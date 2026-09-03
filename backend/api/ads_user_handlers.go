package api

import (
	"encoding/json"
	"net/http"

	"proyecto-go/db/sqlc"
	"github.com/jackc/pgx/v5/pgtype"
)

func (s *Server) handleGetWaterfall(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r.Context())

	// Fetch waterfall for the user
	ads, err := s.db.GetAdsWaterfall(r.Context(), userID)
	if err != nil {
		http.Error(w, "Failed to load waterfall", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(ads)
}

func (s *Server) handleRecordAdView(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r.Context())

	var req struct {
		AdID int64 `json:"ad_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	// Fetch ad to check if it's rewarded and to verify it exists
	ad, err := s.db.GetAdByID(r.Context(), req.AdID)
	if err != nil {
		http.Error(w, "Invalid ad", http.StatusNotFound)
		return
	}

	tx, err := s.dbPool.Begin(r.Context())
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())

	qtx := s.db.WithTx(tx)

	// Upsert view record
	view, err := qtx.UpsertAdView(r.Context(), db.UpsertAdViewParams{
		UserID: userID,
		AdID:   req.AdID,
	})
	if err != nil {
		http.Error(w, "Failed to record view", http.StatusInternalServerError)
		return
	}

	// Reward user if the ad is rewarded and they haven't exceeded daily limits
	// For added safety, check limit again:
	if ad.IsRewarded && ad.RewardTokens > 0 && (ad.DailyLimit == 0 || view.ViewsToday <= int32(ad.DailyLimit)) {
		wallet, err := qtx.GetWalletByUserID(r.Context(), userID)
		if err != nil {
			wallet, err = qtx.CreateWallet(r.Context(), userID)
		}

		if err == nil {
			_, err = qtx.UpdateWalletBalance(r.Context(), db.UpdateWalletBalanceParams{
				ID:     wallet.ID,
				Amount: int64(ad.RewardTokens),
			})

			if err == nil {
				qtx.CreateWalletTransaction(r.Context(), db.CreateWalletTransactionParams{
					WalletID:    wallet.ID,
					Amount:      int64(ad.RewardTokens),
					Type:        "reward",
					Description: pgtype.Text{String: "Ad Reward", Valid: true},
				})
			}
		}
	}

	if err = tx.Commit(r.Context()); err != nil {
		http.Error(w, "Transaction failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "View recorded"})
}
