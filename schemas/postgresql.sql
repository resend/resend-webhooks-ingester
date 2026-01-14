-- Resend Webhook Ingester - PostgreSQL Schema
-- Run this SQL in your PostgreSQL database to create the required tables

-- Email events table
CREATE TABLE IF NOT EXISTS resend_wh_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  svix_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  webhook_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_created_at TIMESTAMPTZ NOT NULL,
  email_id TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_addresses TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  email_created_at TIMESTAMPTZ NOT NULL,
  broadcast_id TEXT,
  template_id TEXT,
  tags JSONB,
  bounce_type TEXT,
  bounce_sub_type TEXT,
  bounce_message TEXT,
  bounce_diagnostic_code TEXT[],
  click_ip_address TEXT,
  click_link TEXT,
  click_timestamp TIMESTAMPTZ,
  click_user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_resend_wh_emails_email_id ON resend_wh_emails(email_id);
CREATE INDEX IF NOT EXISTS idx_resend_wh_emails_event_type ON resend_wh_emails(event_type);
CREATE INDEX IF NOT EXISTS idx_resend_wh_emails_webhook_received_at ON resend_wh_emails(webhook_received_at);
CREATE INDEX IF NOT EXISTS idx_resend_wh_emails_from_address ON resend_wh_emails(from_address);

-- Contact events table
CREATE TABLE IF NOT EXISTS resend_wh_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  svix_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  webhook_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_created_at TIMESTAMPTZ NOT NULL,
  contact_id TEXT NOT NULL,
  audience_id TEXT NOT NULL,
  segment_ids TEXT[],
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  unsubscribed BOOLEAN NOT NULL DEFAULT FALSE,
  contact_created_at TIMESTAMPTZ NOT NULL,
  contact_updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resend_wh_contacts_contact_id ON resend_wh_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_resend_wh_contacts_event_type ON resend_wh_contacts(event_type);
CREATE INDEX IF NOT EXISTS idx_resend_wh_contacts_webhook_received_at ON resend_wh_contacts(webhook_received_at);
CREATE INDEX IF NOT EXISTS idx_resend_wh_contacts_audience_id ON resend_wh_contacts(audience_id);
CREATE INDEX IF NOT EXISTS idx_resend_wh_contacts_email ON resend_wh_contacts(email);

-- Domain events table
CREATE TABLE IF NOT EXISTS resend_wh_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  svix_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  webhook_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_created_at TIMESTAMPTZ NOT NULL,
  domain_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  region TEXT NOT NULL,
  domain_created_at TIMESTAMPTZ NOT NULL,
  records JSONB
);

CREATE INDEX IF NOT EXISTS idx_resend_wh_domains_domain_id ON resend_wh_domains(domain_id);
CREATE INDEX IF NOT EXISTS idx_resend_wh_domains_event_type ON resend_wh_domains(event_type);
CREATE INDEX IF NOT EXISTS idx_resend_wh_domains_webhook_received_at ON resend_wh_domains(webhook_received_at);
CREATE INDEX IF NOT EXISTS idx_resend_wh_domains_name ON resend_wh_domains(name);
