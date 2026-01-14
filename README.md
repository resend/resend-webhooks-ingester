# Resend Webhooks Ingester

A self-hosted webhook ingester for [Resend](https://resend.com) that stores email, contact, and domain events in your database. Built with Next.js for easy deployment to Vercel or your preferred hosting platform.

## Features

- Receives and verifies Resend webhooks using Svix signatures
- Stores all webhook events in your database (append-only log)
- Supports all Resend event types: emails, contacts, and domains
- Type-safe with full TypeScript support
- Currently supports Supabase (more database connectors coming soon)

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

## Prerequisites

- pnpm (recommended)
- A [Resend](https://resend.com) account
- A Database

## Installation

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

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Resend Webhook Secret
# Get this from your Resend Dashboard when creating a webhook
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Supabase Configuration
# Get these from your Supabase project settings (Settings > API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Setup

### Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `schema.sql` and run it

This creates three tables:
- `resend_wh_emails` - Stores all email events
- `resend_wh_contacts` - Stores all contact events
- `resend_wh_domains` - Stores all domain events

Each table includes appropriate indexes for common queries.

#### Database Schema Overview

**resend_wh_emails**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Auto-generated primary key |
| `event_type` | TEXT | The webhook event type |
| `webhook_received_at` | TIMESTAMPTZ | When the webhook was received |
| `event_created_at` | TIMESTAMPTZ | When the event occurred in Resend |
| `email_id` | TEXT | Resend's email ID |
| `from_address` | TEXT | Sender email address |
| `to_addresses` | TEXT[] | Recipient email addresses |
| `subject` | TEXT | Email subject line |
| `broadcast_id` | TEXT | Broadcast campaign ID (if applicable) |
| `template_id` | TEXT | Template ID (if applicable) |
| `tags` | JSONB | Custom tags attached to the email |
| `bounce_*` | Various | Bounce details (for bounced events) |
| `click_*` | Various | Click details (for clicked events) |

**resend_wh_contacts**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Auto-generated primary key |
| `event_type` | TEXT | The webhook event type |
| `contact_id` | TEXT | Resend's contact ID |
| `audience_id` | TEXT | The audience this contact belongs to |
| `email` | TEXT | Contact's email address |
| `first_name` | TEXT | Contact's first name |
| `last_name` | TEXT | Contact's last name |
| `unsubscribed` | BOOLEAN | Subscription status |

**resend_wh_domains**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Auto-generated primary key |
| `event_type` | TEXT | The webhook event type |
| `domain_id` | TEXT | Resend's domain ID |
| `name` | TEXT | Domain name |
| `status` | TEXT | Verification status |
| `region` | TEXT | AWS region |
| `records` | JSONB | DNS records for verification |

## Running Locally

Start the development server:

```bash
pnpm dev
```

The webhook endpoint will be available at `http://localhost:3000/[connector]`.

For local testing, you'll need to expose your local server to the internet using a tool like [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Then use the ngrok URL (e.g., `https://abc123.ngrok.io/[connector]`) as your webhook endpoint in Resend.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel's project settings:
   - `RESEND_WEBHOOK_SECRET`
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or other required variables)
4. Deploy

Your webhook endpoint will be: `https://your-project.vercel.app/[connector]`

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Node.js:

- **Netlify**: Use the Next.js runtime
- **Railway**: Deploy directly from GitHub
- **Fly.io**: Use the Node.js buildpack
- **Self-hosted**: Run `pnpm build && pnpm start`

## Configuring Resend Webhooks

1. Go to your [Resend Dashboard](https://resend.com/webhooks)
2. Click **Add Webhook**
3. Enter your webhook endpoint URL:
   - Local: `https://your-ngrok-url.ngrok.io/[connector]`
   - Production: `https://your-domain.com/[connector]`
4. Select the events you want to receive
5. Click **Create**
6. Copy the **Signing Secret** and add it to your environment variables as `RESEND_WEBHOOK_SECRET`

## How It Works

1. Resend sends a POST request to your webhook endpoint when an event occurs
2. The request includes three Svix headers for verification:
   - `svix-id`: Unique message identifier
   - `svix-timestamp`: When the webhook was sent
   - `svix-signature`: Cryptographic signature
3. The ingester verifies the signature using your webhook secret
4. If valid, the event data is inserted into the appropriate database table
5. Returns `200 OK` on success, or `5xx` on failure (triggers Resend retry)

## Connector Endpoint Reference

### `POST /supabase`

Receives Resend webhooks and stores them in Supabase.

**Headers Required:**
- `svix-id`: Webhook message ID
- `svix-timestamp`: Unix timestamp
- `svix-signature`: HMAC signature

**Responses:**
| Status | Description |
|--------|-------------|
| `200` | Webhook processed successfully |
| `400` | Missing headers or unknown event type |
| `401` | Invalid webhook signature |
| `500` | Server error (will trigger Resend retry) |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Empty root page
│   └── supabase/
│       └── route.ts          # Supabase webhook endpoint
├── lib/
│   └── verify-webhook.ts     # Svix signature verification
├── types/
│   └── webhook.ts            # TypeScript types for webhook payloads
└── env.d.ts                  # Environment variable types

schema.sql                    # Database schema for Supabase
.env.example                  # Example environment variables
```

## Security Considerations

- **Always verify webhook signatures** - The ingester rejects requests with invalid signatures
- **Use environment variables** - Never commit secrets to your repository
- **Use service role keys carefully** - The Supabase service role key bypasses RLS; only use it server-side
- **HTTPS only** - Always use HTTPS in production for webhook endpoints

## Troubleshooting

### Webhooks not being received
- Verify your endpoint URL is correct in Resend
- Check that your server is publicly accessible
- Ensure the `RESEND_WEBHOOK_SECRET` matches the signing secret in Resend

### Signature verification failing
- Make sure you're using the raw request body for verification
- Check that `RESEND_WEBHOOK_SECRET` is set correctly
- Verify the webhook secret hasn't been rotated in Resend

### Database insertion errors
- Verify your Supabase credentials are correct
- Check that the database schema has been applied
- Review the server logs for specific error messages

## Resources

- [Resend Webhooks Documentation](https://resend.com/docs/webhooks/introduction)
- [Resend Event Types](https://resend.com/docs/webhooks/event-types)
- [Verifying Webhook Signatures](https://resend.com/docs/webhooks/verify-webhooks-requests)
- [Supabase Documentation](https://supabase.com/docs)

## License

MIT
