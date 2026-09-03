-- name: CreateWallet :one
INSERT INTO wallets (user_id, balance) VALUES ($1, 0) RETURNING *;

-- name: GetWalletByUserID :one
SELECT * FROM wallets WHERE user_id = $1;

-- name: UpdateWalletBalance :one
UPDATE wallets 
SET balance = balance + sqlc.arg('amount'), updated_at = NOW() 
WHERE id = sqlc.arg('id') RETURNING *;

-- name: CreateWalletTransaction :one
INSERT INTO wallet_transactions (
    wallet_id, amount, type, description, reference_id
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: ListWalletTransactions :many
SELECT * FROM wallet_transactions
WHERE wallet_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
