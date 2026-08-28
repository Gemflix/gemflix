CREATE TABLE drive.replicas (
    id BIGSERIAL PRIMARY KEY,
    service_account_id BIGINT REFERENCES drive.service_accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'GemReplicas',
    shared_drive_id VARCHAR(255) NOT NULL,
    streaming_folder_id VARCHAR(255),
    gemdrive_folder_id VARCHAR(255),
    recovery_folder_id VARCHAR(255),
    space_limit_gib INT DEFAULT 2000,
    priority INT DEFAULT 1,
    health_status VARCHAR(50) DEFAULT 'healthy',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
