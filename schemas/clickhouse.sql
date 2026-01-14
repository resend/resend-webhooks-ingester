-- Resend Webhook Ingester - ClickHouse Schema
-- Run this SQL in your ClickHouse client to create the required tables

-- Email events table
CREATE TABLE IF NOT EXISTS resend_wh_emails (
  id UUID DEFAULT generateUUIDv4(),
  svix_id String,
  event_type String,
  webhook_received_at DateTime64(3) DEFAULT now64(3),
  event_created_at DateTime64(3),
  email_id String,
  from_address String,
  to_addresses Array(String),
  subject String,
  email_created_at DateTime64(3),
  broadcast_id String DEFAULT '',
  template_id String DEFAULT '',
  tags String DEFAULT '',
  bounce_type String DEFAULT '',
  bounce_sub_type String DEFAULT '',
  bounce_message String DEFAULT '',
  bounce_diagnostic_code Array(String) DEFAULT [],
  click_ip_address String DEFAULT '',
  click_link String DEFAULT '',
  click_timestamp String DEFAULT '',
  click_user_agent String DEFAULT ''
)
ENGINE = ReplacingMergeTree()
ORDER BY (svix_id)
PARTITION BY toYYYYMM(webhook_received_at);

-- Contact events table
CREATE TABLE IF NOT EXISTS resend_wh_contacts (
  id UUID DEFAULT generateUUIDv4(),
  svix_id String,
  event_type String,
  webhook_received_at DateTime64(3) DEFAULT now64(3),
  event_created_at DateTime64(3),
  contact_id String,
  audience_id String,
  segment_ids Array(String) DEFAULT [],
  email String,
  first_name String DEFAULT '',
  last_name String DEFAULT '',
  unsubscribed UInt8 DEFAULT 0,
  contact_created_at DateTime64(3),
  contact_updated_at DateTime64(3)
)
ENGINE = ReplacingMergeTree()
ORDER BY (svix_id)
PARTITION BY toYYYYMM(webhook_received_at);

-- Domain events table
CREATE TABLE IF NOT EXISTS resend_wh_domains (
  id UUID DEFAULT generateUUIDv4(),
  svix_id String,
  event_type String,
  webhook_received_at DateTime64(3) DEFAULT now64(3),
  event_created_at DateTime64(3),
  domain_id String,
  name String,
  status String,
  region String,
  domain_created_at DateTime64(3),
  records String DEFAULT ''
)
ENGINE = ReplacingMergeTree()
ORDER BY (svix_id)
PARTITION BY toYYYYMM(webhook_received_at);
