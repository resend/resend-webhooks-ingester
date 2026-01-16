# Resend Webhooks Ingester

A self-hosted webhook ingester for [Resend](https://resend.com) that stores email, contact, and domain events in your database. Built with Next.js for easy deployment to Vercel or your preferred hosting platform.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/resend/resend-webhooks-ingester&env=RESEND_WEBHOOK_SECRET&envDescription=Your%20Resend%20webhook%20signing%20secret&envLink=https://resend.com/webhooks)
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/cd2lvJ?referralCode=w2CHHM&utm_medium=integration&utm_source=template&utm_campaign=generic)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/resend/resend-webhooks-ingester)

Or use [Docker](#docker): `docker pull ghcr.io/resend/resend-webhooks-ingester`

## Table of Contents

- [Features](#features)
- [Supported Databases](#supported-databases)
- [Supported Event Types](#supported-event-types)
- [Quick Start](#quick-start)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Development & Testing](#development--testing)
- [Deployment](#deployment)
- [Configuring Resend Webhooks](#configuring-resend-webhooks)
- [API Reference](#api-reference)
- [Data Retention](#data-retention)
- [Troubleshooting](#troubleshooting)

## Features

- Receives and verifies Resend webhooks using Svix signatures
- Stores all webhook events in your database (append-only log)
- Supports all Resend event types: emails, contacts, and domains
- Idempotent event storage (duplicate webhooks are safely ignored)
- Type-safe with full TypeScript support
- Multiple database connectors available

## Supported Databases

| Connector | Endpoint | Best For |
|-----------|----------|----------|
| [Supabase](#supabase) | `/supabase` | Quick setup with managed Postgres |
| [PostgreSQL](#postgresql) | `/postgresql` | Self-hosted or managed Postgres (Neon, Railway, Render) |
| [MySQL](#mysql) | `/mysql` | Self-hosted or managed MySQL |
| [PlanetScale](#planetscale) | `/planetscale` | Serverless MySQL |
| [MongoDB](#mongodb) | `/mongodb` | Document database (Atlas, self-hosted) |
| [Snowflake](#snowflake) | `/snowflake` | Data warehousing and analytics |
| [BigQuery](#bigquery) | `/bigquery` | Google Cloud analytics |
| [ClickHouse](#clickhouse) | `/clickhouse` | High-performance analytics |

## Supported Event Types

### Email Events
| Event | Description |
|-------|-------------|
| `email.sent` | Email accepted by Resend, delivery attempted |
| `email.delivered` | Email successfully delivered to recipient |
| `email.delivery_delayed` | Temporary delivery issue |
| `email.bounced` | Email permanently rejected |
| `email.complained` | Recipient marked email as spam |
| `email.opened` | Recipient opened the email |
| `email.clicked` | Recipient clicked a link in the email |
| `email.failed` | Email failed to send |
| `email.scheduled` | Email scheduled for future delivery |
| `email.suppressed` | Email suppressed by Resend |
| `email.received` | Inbound email received |

### Contact Events
| Event | Description |
|-------|-------------|
| `contact.created` | Contact added to an audience |
| `contact.updated` | Contact information updated |
| `contact.deleted` | Contact removed from an audience |

### Domain Events
| Event | Description |
|-------|-------------|
| `domain.created` | Domain added to Resend |
| `domain.updated` | Domain configuration updated |
| `domain.deleted` | Domain removed from Resend |

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/resend/resend-webhooks-ingester.git
cd resend-webhooks-ingester
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Resend webhook secret and database credentials (see [Database Setup](#database-setup)).

### 4. Create database tables

Run the appropriate schema file for your database from the `schemas/` directory.

### 5. Deploy and configure webhook

Deploy to Vercel (or your preferred platform) and configure your webhook endpoint in the [Resend Dashboard](https://resend.com/webhooks).

## Database Setup

### Supabase

**Environment Variables:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Schema:** Run `schemas/supabase.sql` in the Supabase SQL Editor.

**Endpoint:** `POST /supabase`

---

### PostgreSQL

Works with any PostgreSQL database: self-hosted, Neon, Railway, Render, etc.

**Environment Variables:**
```env
POSTGRESQL_URL=postgresql://user:password@host:5432/database
```

**Schema:** Run `schemas/postgresql.sql` in your database.

**Endpoint:** `POST /postgresql`

---

### MySQL

**Environment Variables:**
```env
MYSQL_URL=mysql://user:password@host:3306/database
```

**Schema:** Run `schemas/mysql.sql` in your database.

**Endpoint:** `POST /mysql`

---

### PlanetScale

**Environment Variables:**
```env
PLANETSCALE_URL=mysql://username:password@host/database?ssl={"rejectUnauthorized":true}
```

Get your connection string from the PlanetScale dashboard under **Connect > Create password**.

**Schema:** Run `schemas/mysql.sql` in your PlanetScale database (uses MySQL syntax).

**Endpoint:** `POST /planetscale`

---

### MongoDB

Works with MongoDB Atlas, self-hosted MongoDB, or any MongoDB-compatible database.

**Environment Variables:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=resend_webhooks
```

Get your connection string from your MongoDB Atlas dashboard or construct it for your self-hosted instance.

**Schema:** Run `schemas/mongodb.js` using mongosh:
```bash
mongosh "your-connection-string" schemas/mongodb.js
```

Or execute the commands manually in MongoDB Compass or Atlas.

**Endpoint:** `POST /mongodb`

---

### Snowflake

**Environment Variables:**
```env
SNOWFLAKE_ACCOUNT=your-account-identifier
SNOWFLAKE_USERNAME=your-username
SNOWFLAKE_PASSWORD=your-password
SNOWFLAKE_DATABASE=your-database
SNOWFLAKE_SCHEMA=your-schema
SNOWFLAKE_WAREHOUSE=your-warehouse
```

**Schema:** Run `schemas/snowflake.sql` in a Snowflake worksheet.

**Endpoint:** `POST /snowflake`

---

### BigQuery

**Environment Variables:**
```env
BIGQUERY_PROJECT_ID=your-project-id
BIGQUERY_DATASET_ID=your-dataset-id
# Optional: Service account credentials as JSON string
BIGQUERY_CREDENTIALS={"type":"service_account","project_id":"..."}
```

If running on Google Cloud (Cloud Run, GKE), you can omit `BIGQUERY_CREDENTIALS` and use default application credentials.

**Schema:** Run `schemas/bigquery.sql` in the BigQuery console (replace `YOUR_DATASET` with your dataset ID).

**Endpoint:** `POST /bigquery`

---

### ClickHouse

**Environment Variables:**
```env
CLICKHOUSE_URL=https://your-instance.clickhouse.cloud:8443
CLICKHOUSE_USERNAME=default
CLICKHOUSE_PASSWORD=your-password
CLICKHOUSE_DATABASE=default
```

**Schema:** Run `schemas/clickhouse.sql` in your ClickHouse client.

**Endpoint:** `POST /clickhouse`

---

## Running Locally

Start the development server:

```bash
pnpm dev
```

The webhook endpoints will be available at `http://localhost:3000/{connector}`.

For local testing, expose your server using [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Use the ngrok URL (e.g., `https://abc123.ngrok.io/supabase`) as your webhook endpoint in Resend.

## Development & Testing

### Running Tests Locally

The project includes integration tests for MongoDB, PostgreSQL, MySQL, and ClickHouse that run with Docker.

**Cloud-only connectors** (require real accounts, not run in CI):
- **Supabase** - Requires real Supabase project credentials
- **PlanetScale** - Requires real PlanetScale account (uses same schema as MySQL)
- **Snowflake** - Requires real Snowflake account
- **BigQuery** - Requires real GCP project

**1. Start databases with Docker Compose:**

```bash
docker compose up -d
```

**2. Apply schemas to test databases:**

```bash
pnpm db:setup
```

**3. Start the dev server with test environment:**

```bash
pnpm dev:test
```

**4. Run tests (in another terminal):**

```bash
pnpm test
```

Or run tests for a specific connector:

```bash
pnpm test:mongodb
pnpm test:supabase
pnpm test:postgresql
pnpm test:mysql
pnpm test:clickhouse
```

### Test Environment

Tests use `.env.test` for configuration. The `dev:test` script loads this file automatically via dotenv-cli.

### Testing Cloud Connectors (Supabase, PlanetScale, etc.)

To test cloud connectors like Supabase:

1. Add your credentials to `.env.test`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

2. Run the schema setup (from Supabase SQL Editor or via CLI):
```bash
pnpm db:setup --supabase
```

3. Run the tests:
```bash
pnpm test:supabase
```

## Deployment

### Docker

Pull the image from GitHub Container Registry:

```bash
docker pull ghcr.io/resend/resend-webhooks-ingester:latest
```

Run with environment variables:

```bash
docker run -p 3000:3000 \
  -e RESEND_WEBHOOK_SECRET=whsec_your_secret \
  -e MONGODB_URI=mongodb://host:27017 \
  -e MONGODB_DATABASE=resend_webhooks \
  ghcr.io/resend/resend-webhooks-ingester:latest
```

Or build locally:

```bash
docker build -t resend-webhooks-ingester .
docker run -p 3000:3000 -e ... resend-webhooks-ingester
```

### Vercel

Use the [deploy button](#deploy) above, or:

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables:
   - `RESEND_WEBHOOK_SECRET` (required)
   - Database-specific variables for your chosen connector
4. Deploy

Your webhook endpoint: `https://your-project.vercel.app/{connector}`

### Other Platforms

This is a standard Next.js application:

- **Netlify**: Use the Next.js runtime
- **Railway**: Deploy directly from GitHub or use the deploy button above
- **Render**: Use the deploy button above or connect your repo
- **Fly.io**: Use the Dockerfile
- **Google Cloud Run**: Build and deploy container
- **Self-hosted**: Use Docker or `pnpm build && pnpm start`

## Configuring Resend Webhooks

1. Go to your [Resend Dashboard](https://resend.com/webhooks)
2. Click **Add Webhook**
3. Enter your webhook endpoint URL (e.g., `https://your-domain.com/supabase`)
4. Select the events you want to receive
5. Click **Create**
6. Copy the **Signing Secret** and add it as `RESEND_WEBHOOK_SECRET`

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Empty root page
│   ├── supabase/route.ts     # Supabase connector
│   ├── postgresql/route.ts   # PostgreSQL connector
│   ├── mysql/route.ts        # MySQL connector
│   ├── planetscale/route.ts  # PlanetScale connector
│   ├── mongodb/route.ts      # MongoDB connector
│   ├── snowflake/route.ts    # Snowflake connector
│   ├── bigquery/route.ts     # BigQuery connector
│   └── clickhouse/route.ts   # ClickHouse connector
├── lib/
│   ├── verify-webhook.ts     # Svix signature verification
│   └── webhook-handler.ts    # Shared webhook handling logic
├── types/
│   └── webhook.ts            # TypeScript types for webhook payloads
└── env.d.ts                  # Environment variable types

schemas/
├── supabase.sql              # Supabase/PostgreSQL schema
├── postgresql.sql            # PostgreSQL schema
├── mysql.sql                 # MySQL/PlanetScale schema
├── mongodb.js                # MongoDB schema and indexes
├── snowflake.sql             # Snowflake schema
├── bigquery.sql              # BigQuery schema
└── clickhouse.sql            # ClickHouse schema

tests/
├── setup.ts                  # Test configuration
├── helpers/
│   ├── svix.ts               # Webhook signature generation
│   ├── fixtures.ts           # Sample event payloads
│   ├── db-clients.ts         # DB clients for assertions
│   └── test-factory.ts       # Shared test cases
└── integration/
    ├── mongodb.test.ts
    ├── supabase.test.ts
    ├── postgresql.test.ts
    ├── mysql.test.ts
    └── clickhouse.test.ts
```

## API Reference

All connectors share the same API:

### `POST /{connector}`

Receives and stores Resend webhook events.

**Required Headers:**
- `svix-id`: Webhook message ID
- `svix-timestamp`: Unix timestamp
- `svix-signature`: HMAC signature

**Responses:**
| Status | Description |
|--------|-------------|
| `200` | Webhook processed successfully |
| `400` | Missing headers or unknown event type |
| `401` | Invalid webhook signature |
| `500` | Server error (triggers Resend retry) |

## Security Considerations

- **Always verify webhook signatures** - The ingester rejects requests with invalid signatures
- **Use environment variables** - Never commit secrets to your repository
- **Use service role keys carefully** - Keys that bypass RLS should only be used server-side
- **HTTPS only** - Always use HTTPS in production

## Data Retention

By default, webhook events are stored **indefinitely**. This gives you complete historical data for analytics and auditing.

If you need to limit data retention, you can set up scheduled jobs to delete old events. Below are example queries to delete events older than a specified number of days.

### PostgreSQL / Supabase

```sql
-- Delete email events older than 90 days
DELETE FROM resend_wh_emails
WHERE event_created_at < NOW() - INTERVAL '90 days';

-- Delete contact events older than 90 days
DELETE FROM resend_wh_contacts
WHERE event_created_at < NOW() - INTERVAL '90 days';

-- Delete domain events older than 90 days
DELETE FROM resend_wh_domains
WHERE event_created_at < NOW() - INTERVAL '90 days';
```

For Supabase, you can use [pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron) to schedule these queries.

### MySQL / PlanetScale

```sql
-- Delete email events older than 90 days
DELETE FROM resend_wh_emails
WHERE event_created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Delete contact events older than 90 days
DELETE FROM resend_wh_contacts
WHERE event_created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Delete domain events older than 90 days
DELETE FROM resend_wh_domains
WHERE event_created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### BigQuery

```sql
-- Delete email events older than 90 days
DELETE FROM `your_project.your_dataset.resend_wh_emails`
WHERE event_created_at < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY);
```

You can also set up [partition expiration](https://cloud.google.com/bigquery/docs/managing-partitioned-tables#partition-expiration) on your tables.

### Snowflake

```sql
-- Delete email events older than 90 days
DELETE FROM resend_wh_emails
WHERE event_created_at < DATEADD(day, -90, CURRENT_TIMESTAMP());
```

You can use [Snowflake Tasks](https://docs.snowflake.com/en/user-guide/tasks-intro) to schedule cleanup.

### ClickHouse

```sql
-- Delete email events older than 90 days
ALTER TABLE resend_wh_emails DELETE
WHERE event_created_at < now() - INTERVAL 90 DAY;
```

Alternatively, use [TTL expressions](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) in your table definition for automatic cleanup.

### MongoDB

```javascript
// Delete email events older than 90 days
db.resend_wh_emails.deleteMany({
  event_created_at: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});

// Delete contact events older than 90 days
db.resend_wh_contacts.deleteMany({
  event_created_at: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});

// Delete domain events older than 90 days
db.resend_wh_domains.deleteMany({
  event_created_at: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});
```

You can also use [MongoDB Atlas scheduled triggers](https://www.mongodb.com/docs/atlas/app-services/triggers/scheduled-triggers/) or create a TTL index for automatic expiration.

## Example Queries

See [`queries_examples.md`](./queries_examples.md) for useful analytics queries including:
- Email status counts by day
- Bounce rates
- Open rates
- Click-through rates
- Contact growth tracking
- Most clicked links

## Troubleshooting

### Webhooks not being received
- Verify your endpoint URL is correct in Resend
- Check that your server is publicly accessible
- Ensure `RESEND_WEBHOOK_SECRET` matches the signing secret in Resend

### Signature verification failing
- Make sure you're using the raw request body for verification
- Check that `RESEND_WEBHOOK_SECRET` is set correctly
- Verify the webhook secret hasn't been rotated in Resend

### Database insertion errors
- Verify your database credentials are correct
- Check that the schema has been applied
- Review server logs for specific error messages

### Snowflake connection issues
- Verify your account identifier format (e.g., `xy12345.us-east-1`)
- Ensure the warehouse is running and accessible
- Check that the user has INSERT permissions on the tables

### BigQuery errors
- Verify the service account has BigQuery Data Editor role
- Ensure the dataset and tables exist
- Check that the project ID is correct

## Resources

- [Resend Webhooks Documentation](https://resend.com/docs/webhooks/introduction)
- [Resend Event Types](https://resend.com/docs/webhooks/event-types)
- [Verifying Webhook Signatures](https://resend.com/docs/webhooks/verify-webhooks-requests)

## License

MIT
