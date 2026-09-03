package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"proyecto-go/db/sqlc"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// handlePurchaseShopItem handles buying an item from the shop
func (s *Server) handlePurchaseShopItem(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r.Context())
	
	itemIDStr := chi.URLParam(r, "itemId")
	itemID, err := strconv.ParseInt(itemIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid item ID", http.StatusBadRequest)
		return
	}

	// 1. Validate Shop Item
	item, err := s.db.GetShopItem(r.Context(), itemID)
	if err != nil {
		http.Error(w, "Item not found", http.StatusNotFound)
		return
	}

	if !item.IsActive {
		http.Error(w, "Item is no longer available", http.StatusBadRequest)
		return
	}

	// Check if already owns it
	inventory, err := s.db.GetUserInventory(r.Context(), userID)
	if err == nil {
		for _, invItem := range inventory {
			if invItem.ShopItemID == item.ID {
				http.Error(w, "You already own this item", http.StatusConflict)
				return
			}
		}
	}

	// 2. Validate Wallet Balance
	wallet, err := s.db.GetWalletByUserID(r.Context(), userID)
	if err != nil {
		http.Error(w, "Wallet not found. Please deposit funds first.", http.StatusBadRequest)
		return
	}

	if wallet.Balance < item.Price {
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
		Amount: -item.Price,
	})
	if err != nil {
		http.Error(w, "Failed to deduct balance", http.StatusInternalServerError)
		return
	}

	// Log transaction
	_, err = qtx.CreateWalletTransaction(r.Context(), db.CreateWalletTransactionParams{
		WalletID: wallet.ID,
		Amount:   -item.Price,
		Type:     "purchase_shop_item",
		Description: pgtype.Text{String: "Purchase shop item: " + item.Name, Valid: true},
	})
	if err != nil {
		http.Error(w, "Failed to log transaction", http.StatusInternalServerError)
		return
	}

	// Insert into inventory
	invItem, err := qtx.CreateUserInventoryItem(r.Context(), db.CreateUserInventoryItemParams{
		UserID:     userID,
		ShopItemID: item.ID,
	})
	if err != nil {
		http.Error(w, "Failed to add item to inventory", http.StatusInternalServerError)
		return
	}

	// 4. Commit transaction
	if err = tx.Commit(r.Context()); err != nil {
		http.Error(w, "Failed to complete purchase", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(invItem)
}

// handleGetMyInventory returns the user's purchased items
func (s *Server) handleGetMyInventory(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r.Context())

	inventory, err := s.db.GetUserInventory(r.Context(), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"data": inventory,
	}
	json.NewEncoder(w).Encode(response)
}

// handleEquipShopItem allows a user to equip an inventory item to a profile
func (s *Server) handleEquipShopItem(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r.Context())

	invIDStr := chi.URLParam(r, "inventoryId")
	invID, err := strconv.ParseInt(invIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid inventory ID", http.StatusBadRequest)
		return
	}

	var req struct {
		ProfileID int64 `json:"profile_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// To ensure "only 1 item per profile" of a specific type (e.g., only 1 frame at a time),
	// we first need to know the type of the item being equipped.
	// Since GetUserInventory returns types, we could fetch that, but for simplicity here
	// we just need to join shop_items to unequip the same type.
	
	// We added UnequipShopItemTypeFromProfile to shop.sql, but we need the item type first.
	// We can fetch the inventory list to find it, or add a query to get an inventory item by ID.
	// For now, let's just fetch all and find the type.
	inventory, err := s.db.GetUserInventory(r.Context(), userID)
	var itemType string
	for _, inv := range inventory {
		if inv.ID == invID {
			itemType = inv.Type
			break
		}
	}

	if itemType == "" {
		http.Error(w, "Inventory item not found", http.StatusNotFound)
		return
	}

	// Open Transaction
	tx, err := s.dbPool.Begin(r.Context())
	if err != nil {
		http.Error(w, "Error starting transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())
	
	qtx := s.db.WithTx(tx)

	// Unequip any existing item of the SAME type from this profile
	profileID := pgtype.Int8{Int64: req.ProfileID, Valid: true}
	err = qtx.UnequipShopItemTypeFromProfile(r.Context(), db.UnequipShopItemTypeFromProfileParams{
		UserID:               userID,
		EquippedByProfileID:  profileID,
		Type:                 itemType,
	})
	if err != nil {
		http.Error(w, "Error unequipping old item", http.StatusInternalServerError)
		return
	}

	// Equip the new item
	err = qtx.EquipShopItemToProfile(r.Context(), db.EquipShopItemToProfileParams{
		EquippedByProfileID: profileID,
		UserID:              userID,
		ID:                  invID,
	})
	if err != nil {
		http.Error(w, "Error equipping new item", http.StatusInternalServerError)
		return
	}

	if err = tx.Commit(r.Context()); err != nil {
		http.Error(w, "Error commiting equip", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Item equipped successfully"}`))
}
