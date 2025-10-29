CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE,
    first_name_encrypted TEXT,
    last_name_encrypted TEXT,
    email_encrypted TEXT,
    phone_encrypted TEXT,
    address_encrypted TEXT,
    birth_date_encrypted TEXT,
    ip_address INET,
    coupon_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(50),
    discount_text VARCHAR(100),
    code VARCHAR(50),
    is_phishing BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    cta_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50),
    session_id VARCHAR(255),
    coupon_id INTEGER,
    ip_address INET,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE analytics
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE analytics
    ADD COLUMN IF NOT EXISTS user_agent TEXT;

CREATE TABLE IF NOT EXISTS auth_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    totp_secret TEXT,
    totp_temp_secret TEXT,
    totp_enabled BOOLEAN DEFAULT FALSE,
    totp_backup_codes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
