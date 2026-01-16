-- Resend Webhook Ingester - BigQuery Schema
-- Run these commands using the bq CLI or BigQuery Console
-- Replace YOUR_DATASET with your actual dataset name

-- Email events table
CREATE TABLE IF NOT EXISTS YOUR_DATASET.resend_wh_emails (
  id STRING NOT NULL,
  svix_id STRING NOT NULL,
  event_type STRING NOT NULL,
  webhook_received_at TIMESTAMP NOT NULL,
  event_created_at TIMESTAMP NOT NULL,
  email_id STRING NOT NULL,
  from_address STRING NOT NULL,
  to_addresses ARRAY<STRING>,
  subject STRING NOT NULL,
  email_created_at TIMESTAMP NOT NULL,
  broadcast_id STRING,
  template_id STRING,
  tags STRING, -- JSON string
  bounce_type STRING,
  bounce_sub_type STRING,
  bounce_message STRING,
  bounce_diagnostic_code ARRAY<STRING>,
  click_ip_address STRING,
  click_link STRING,
  click_timestamp TIMESTAMP,
  click_user_agent STRING
)
PARTITION BY DATE(webhook_received_at)
CLUSTER BY event_type, email_id;

-- Contact events table
CREATE TABLE IF NOT EXISTS YOUR_DATASET.resend_wh_contacts (
  id STRING NOT NULL,
  svix_id STRING NOT NULL,
  event_type STRING NOT NULL,
  webhook_received_at TIMESTAMP NOT NULL,
  event_created_at TIMESTAMP NOT NULL,
  contact_id STRING NOT NULL,
  audience_id STRING NOT NULL,
  segment_ids ARRAY<STRING>,
  email STRING NOT NULL,
  first_name STRING,
  last_name STRING,
  unsubscribed BOOL NOT NULL,
  contact_created_at TIMESTAMP NOT NULL,
  contact_updated_at TIMESTAMP NOT NULL
)
PARTITION BY DATE(webhook_received_at)
CLUSTER BY event_type, contact_id;

-- Domain events table
CREATE TABLE IF NOT EXISTS YOUR_DATASET.resend_wh_domains (
  id STRING NOT NULL,
  svix_id STRING NOT NULL,
  event_type STRING NOT NULL,
  webhook_received_at TIMESTAMP NOT NULL,
  event_created_at TIMESTAMP NOT NULL,
  domain_id STRING NOT NULL,
  name STRING NOT NULL,
  status STRING NOT NULL,
  region STRING NOT NULL,
  domain_created_at TIMESTAMP NOT NULL,
  records STRING -- JSON string
)
PARTITION BY DATE(webhook_received_at)
CLUSTER BY event_type, domain_id;
