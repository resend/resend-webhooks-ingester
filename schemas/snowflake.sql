-- Resend Webhook Ingester - Snowflake Schema
-- Run this SQL in your Snowflake worksheet to create the required tables

-- Email events table
CREATE TABLE IF NOT EXISTS resend_wh_emails (
  id STRING DEFAULT UUID_STRING(),
  event_type STRING NOT NULL,
  webhook_received_at TIMESTAMP_TZ NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  event_created_at TIMESTAMP_TZ NOT NULL,
  email_id STRING NOT NULL,
  from_address STRING NOT NULL,
  to_addresses ARRAY NOT NULL,
  subject STRING NOT NULL,
  email_created_at TIMESTAMP_TZ NOT NULL,
  broadcast_id STRING,
  template_id STRING,
  tags VARIANT,
  bounce_type STRING,
  bounce_sub_type STRING,
  bounce_message STRING,
  bounce_diagnostic_code ARRAY,
  click_ip_address STRING,
  click_link STRING,
  click_timestamp TIMESTAMP_TZ,
  click_user_agent STRING
);

-- Contact events table
CREATE TABLE IF NOT EXISTS resend_wh_contacts (
  id STRING DEFAULT UUID_STRING(),
  event_type STRING NOT NULL,
  webhook_received_at TIMESTAMP_TZ NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  event_created_at TIMESTAMP_TZ NOT NULL,
  contact_id STRING NOT NULL,
  audience_id STRING NOT NULL,
  segment_ids ARRAY,
  email STRING NOT NULL,
  first_name STRING,
  last_name STRING,
  unsubscribed BOOLEAN NOT NULL DEFAULT FALSE,
  contact_created_at TIMESTAMP_TZ NOT NULL,
  contact_updated_at TIMESTAMP_TZ NOT NULL
);

-- Domain events table
CREATE TABLE IF NOT EXISTS resend_wh_domains (
  id STRING DEFAULT UUID_STRING(),
  event_type STRING NOT NULL,
  webhook_received_at TIMESTAMP_TZ NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  event_created_at TIMESTAMP_TZ NOT NULL,
  domain_id STRING NOT NULL,
  name STRING NOT NULL,
  status STRING NOT NULL,
  region STRING NOT NULL,
  domain_created_at TIMESTAMP_TZ NOT NULL,
  records VARIANT
);

-- Create clustering keys for better query performance (optional but recommended)
ALTER TABLE resend_wh_emails CLUSTER BY (event_type, webhook_received_at);
ALTER TABLE resend_wh_contacts CLUSTER BY (event_type, webhook_received_at);
ALTER TABLE resend_wh_domains CLUSTER BY (event_type, webhook_received_at);
