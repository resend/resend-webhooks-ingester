-- Resend Webhook Ingester - MySQL Schema
-- Run this SQL in your MySQL database to create the required tables

-- Email events table
CREATE TABLE IF NOT EXISTS resend_wh_emails (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  event_type VARCHAR(50) NOT NULL,
  webhook_received_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  event_created_at TIMESTAMP(6) NOT NULL,
  email_id VARCHAR(255) NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  to_addresses JSON NOT NULL,
  subject TEXT NOT NULL,
  email_created_at TIMESTAMP(6) NOT NULL,
  broadcast_id VARCHAR(255),
  template_id VARCHAR(255),
  tags JSON,
  bounce_type VARCHAR(50),
  bounce_sub_type VARCHAR(50),
  bounce_message TEXT,
  bounce_diagnostic_code JSON,
  click_ip_address VARCHAR(45),
  click_link TEXT,
  click_timestamp TIMESTAMP(6),
  click_user_agent TEXT,
  INDEX idx_email_id (email_id),
  INDEX idx_event_type (event_type),
  INDEX idx_webhook_received_at (webhook_received_at),
  INDEX idx_from_address (from_address)
);

-- Contact events table
CREATE TABLE IF NOT EXISTS resend_wh_contacts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  event_type VARCHAR(50) NOT NULL,
  webhook_received_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  event_created_at TIMESTAMP(6) NOT NULL,
  contact_id VARCHAR(255) NOT NULL,
  audience_id VARCHAR(255) NOT NULL,
  segment_ids JSON,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  unsubscribed BOOLEAN NOT NULL DEFAULT FALSE,
  contact_created_at TIMESTAMP(6) NOT NULL,
  contact_updated_at TIMESTAMP(6) NOT NULL,
  INDEX idx_contact_id (contact_id),
  INDEX idx_event_type (event_type),
  INDEX idx_webhook_received_at (webhook_received_at),
  INDEX idx_audience_id (audience_id),
  INDEX idx_email (email)
);

-- Domain events table
CREATE TABLE IF NOT EXISTS resend_wh_domains (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  event_type VARCHAR(50) NOT NULL,
  webhook_received_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  event_created_at TIMESTAMP(6) NOT NULL,
  domain_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  region VARCHAR(50) NOT NULL,
  domain_created_at TIMESTAMP(6) NOT NULL,
  records JSON,
  INDEX idx_domain_id (domain_id),
  INDEX idx_event_type (event_type),
  INDEX idx_webhook_received_at (webhook_received_at),
  INDEX idx_name (name)
);
