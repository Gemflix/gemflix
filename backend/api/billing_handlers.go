package api

import (
	"encoding/json"
	"net/http"

	"proyecto-go/db/sqlc"
)

func (server *Server) HandleListActivePlans(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	plans, err := server.db.ListActivePlans(ctx)
	if err != nil {
		http.Error(w, "Failed to fetch plans", http.StatusInternalServerError)
		return
	}

	if plans == nil {
		plans = []db.Plan{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(plans)
}

func (server *Server) HandleGetActiveSubscriptions(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := getUserID(ctx)
	if userID == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	subs, err := server.db.GetActiveUserSubscriptions(ctx, userID)
	if err != nil {
		http.Error(w, "Failed to fetch subscriptions", http.StatusInternalServerError)
		return
	}

	if subs == nil {
		subs = []db.GetActiveUserSubscriptionsRow{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subs)
}
