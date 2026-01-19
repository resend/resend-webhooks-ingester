-- Resend Webhook Ingester Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Email events table
CREATE TABLE IF NOT EXISTS resend_wh_emails (
  -- Primary key for each webhook event (auto-generated)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Svix ID for idempotency (unique to prevent duplicate webhook processing)
  svix_id TEXT NOT NULL UNIQUE,

  -- Webhook metadata
  event_type TEXT NOT NULL,
  webhook_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_created_at TIMESTAMPTZ NOT NULL,

  -- Common email fields
  email_id TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_addresses TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  email_created_at TIMESTAMPTZ NOT NULL,

  -- Optional common fields
  broadcast_id TEXT,
  template_id TEXT,
  tags JSONB,

  -- Bounce-specific fields (for email.bounced events)
  bounce_type TEXT,
  bounce_sub_type TEXT,
  bounce_message TEXT,
  bounce_diagnostic_code TEXT[],

  -- Click-specific fields (for email.clicked events)
  click_ip_address TEXT,
  click_link TEXT,
  click_timestamp TIMESTAMPTZ,
  click_user_agent TEXT
);

-- Indexes for common queries on emails
CREATE INDEX IF NOT EXISTS idx_resend_wh_emails_email_id ON resend_wh_emails(email_id);
CREATE INDEX IF NOT EXISTS idx_resend_wh_emails_event_type ON resend_wh_emails(event_type);
CREATE INDEX IF NOT EXISTS idx_resend_wh_emails_webhook_received_at ON resend_wh_emails(webhook_received_at);
CREATE INDEX IF NOT EXISTS idx_resend_wh_emails_from_address ON resend_wh_emails(from_address);

-- Contact events table
CREATE TABLE IF NOT EXISTS resend_wh_contacts (
  -- Primary key for each webhook event (auto-generated)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Svix ID for idempotency (unique to prevent duplicate webhook processing)
  svix_id TEXT NOT NULL UNIQUE,

  -- Webhook metadata
  event_type TEXT NOT NULL,
  webhook_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_created_at TIMESTAMPTZ NOT NULL,

  -- Contact fields
  contact_id TEXT NOT NULL,
  audience_id TEXT,
  segment_ids TEXT[],
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  unsubscribed BOOLEAN NOT NULL DEFAULT FALSE,
  contact_created_at TIMESTAMPTZ NOT NULL,
  contact_updated_at TIMESTAMPTZ NOT NULL
);

-- Indexes for common queries on contacts
CREATE INDEX IF NOT EXISTS idx_resend_wh_contacts_contact_id ON resend_wh_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_resend_wh_contacts_event_type ON resend_wh_contacts(event_type);
CREATE INDEX IF NOT EXISTS idx_resend_wh_contacts_webhook_received_at ON resend_wh_contacts(webhook_received_at);
CREATE INDEX IF NOT EXISTS idx_resend_wh_contacts_audience_id ON resend_wh_contacts(audience_id);
CREATE INDEX IF NOT EXISTS idx_resend_wh_contacts_email ON resend_wh_contacts(email);

-- Domain events table
CREATE TABLE IF NOT EXISTS resend_wh_domains (
  -- Primary key for each webhook event (auto-generated)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Svix ID for idempotency (unique to prevent duplicate webhook processing)
  svix_id TEXT NOT NULL UNIQUE,

  -- Webhook metadata
  event_type TEXT NOT NULL,
  webhook_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_created_at TIMESTAMPTZ NOT NULL,

  -- Domain fields
  domain_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  region TEXT NOT NULL,
  domain_created_at TIMESTAMPTZ NOT NULL,
  records JSONB
);

-- Indexes for common queries on domains
CREATE INDEX IF NOT EXISTS idx_resend_wh_domains_domain_id ON resend_wh_domains(domain_id);
CREATE INDEX IF NOT EXISTS idx_resend_wh_domains_event_type ON resend_wh_domains(event_type);
CREATE INDEX IF NOT EXISTS idx_resend_wh_domains_webhook_received_at ON resend_wh_domains(webhook_received_at);
CREATE INDEX IF NOT EXISTS idx_resend_wh_domains_name ON resend_wh_domains(name);
