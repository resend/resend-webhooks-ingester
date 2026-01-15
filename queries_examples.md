# Example Queries

This document provides example queries for each database connector to help you analyze your Resend webhook data.

## Email Status Counts by Day

Get the count of emails in each status (event type) for each day.

### Supabase / PostgreSQL

```sql
SELECT
  DATE(event_created_at) AS day,
  event_type,
  COUNT(*) AS count
FROM resend_wh_emails
GROUP BY DATE(event_created_at), event_type
ORDER BY day DESC, event_type;
```

### MySQL / PlanetScale

```sql
SELECT
  DATE(event_created_at) AS day,
  event_type,
  COUNT(*) AS count
FROM resend_wh_emails
GROUP BY DATE(event_created_at), event_type
ORDER BY day DESC, event_type;
```

### BigQuery

```sql
SELECT
  DATE(event_created_at) AS day,
  event_type,
  COUNT(*) AS count
FROM `your_project.your_dataset.resend_wh_emails`
GROUP BY day, event_type
ORDER BY day DESC, event_type;
```

### Snowflake

```sql
SELECT
  DATE(event_created_at) AS day,
  event_type,
  COUNT(*) AS count
FROM resend_wh_emails
GROUP BY DATE(event_created_at), event_type
ORDER BY day DESC, event_type;
```

### ClickHouse

```sql
SELECT
  toDate(event_created_at) AS day,
  event_type,
  count() AS count
FROM resend_wh_emails
FINAL
GROUP BY day, event_type
ORDER BY day DESC, event_type;
```

> **Note:** The `FINAL` keyword ensures proper deduplication when using ReplacingMergeTree.

### MongoDB

```javascript
db.resend_wh_emails.aggregate([
  {
    $group: {
      _id: {
        day: { $dateToString: { format: "%Y-%m-%d", date: "$event_created_at" } },
        event_type: "$event_type"
      },
      count: { $sum: 1 }
    }
  },
  { $sort: { "_id.day": -1, "_id.event_type": 1 } },
  {
    $project: {
      _id: 0,
      day: "$_id.day",
      event_type: "$_id.event_type",
      count: 1
    }
  }
]);
```

## Additional Useful Queries

### Bounce Rate by Day (PostgreSQL/Supabase)

```sql
SELECT
  DATE(event_created_at) AS day,
  COUNT(*) FILTER (WHERE event_type = 'email.bounced') AS bounced,
  COUNT(*) FILTER (WHERE event_type = 'email.sent') AS sent,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'email.bounced')::DECIMAL /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'email.sent'), 0) * 100,
    2
  ) AS bounce_rate_percent
FROM resend_wh_emails
WHERE event_type IN ('email.sent', 'email.bounced')
GROUP BY DATE(event_created_at)
ORDER BY day DESC;
```

### Open Rate by Day (PostgreSQL/Supabase)

```sql
SELECT
  DATE(event_created_at) AS day,
  COUNT(*) FILTER (WHERE event_type = 'email.opened') AS opened,
  COUNT(*) FILTER (WHERE event_type = 'email.delivered') AS delivered,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'email.opened')::DECIMAL /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'email.delivered'), 0) * 100,
    2
  ) AS open_rate_percent
FROM resend_wh_emails
WHERE event_type IN ('email.delivered', 'email.opened')
GROUP BY DATE(event_created_at)
ORDER BY day DESC;
```

### Click-Through Rate by Day (PostgreSQL/Supabase)

```sql
SELECT
  DATE(event_created_at) AS day,
  COUNT(*) FILTER (WHERE event_type = 'email.clicked') AS clicked,
  COUNT(*) FILTER (WHERE event_type = 'email.opened') AS opened,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'email.clicked')::DECIMAL /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'email.opened'), 0) * 100,
    2
  ) AS ctr_percent
FROM resend_wh_emails
WHERE event_type IN ('email.opened', 'email.clicked')
GROUP BY DATE(event_created_at)
ORDER BY day DESC;
```

### Contact Growth by Day (PostgreSQL/Supabase)

```sql
SELECT
  DATE(event_created_at) AS day,
  COUNT(*) FILTER (WHERE event_type = 'contact.created') AS created,
  COUNT(*) FILTER (WHERE event_type = 'contact.deleted') AS deleted,
  COUNT(*) FILTER (WHERE event_type = 'contact.created') -
    COUNT(*) FILTER (WHERE event_type = 'contact.deleted') AS net_growth
FROM resend_wh_contacts
GROUP BY DATE(event_created_at)
ORDER BY day DESC;
```

### Domain Status Summary (PostgreSQL/Supabase)

```sql
SELECT
  name,
  event_type,
  status,
  event_created_at
FROM resend_wh_domains
ORDER BY event_created_at DESC;
```

### Most Clicked Links (PostgreSQL/Supabase)

```sql
SELECT
  click_link,
  COUNT(*) AS click_count
FROM resend_wh_emails
WHERE event_type = 'email.clicked' AND click_link IS NOT NULL
GROUP BY click_link
ORDER BY click_count DESC
LIMIT 10;
```

### Bounce Types Distribution (PostgreSQL/Supabase)

```sql
SELECT
  bounce_type,
  COUNT(*) AS count
FROM resend_wh_emails
WHERE event_type = 'email.bounced'
GROUP BY bounce_type
ORDER BY count DESC;
```
