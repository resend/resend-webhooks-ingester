import { NextResponse } from 'next/server';
import { verifyWebhook, type WebhookHeaders } from '@/lib/verify-webhook';
import {
  type ContactWebhookEvent,
  type DomainWebhookEvent,
  type EmailWebhookEvent,
  isContactEvent,
  isDomainEvent,
  isEmailEvent,
} from '@/types/webhook';

export interface WebhookHandlers<TClient> {
  getClient: () => TClient | Promise<TClient>;
  insertEmailEvent: (
    client: TClient,
    event: EmailWebhookEvent,
  ) => Promise<void>;
  insertContactEvent: (
    client: TClient,
    event: ContactWebhookEvent,
  ) => Promise<void>;
  insertDomainEvent: (
    client: TClient,
    event: DomainWebhookEvent,
  ) => Promise<void>;
  cleanup?: (client: TClient) => Promise<void>;
}

export function createWebhookHandler<TClient>(
  handlers: WebhookHandlers<TClient>,
) {
  return async function POST(request: Request) {
    const secret = process.env.RESEND_WEBHOOK_SECRET;

    if (!secret) {
      console.error('Missing RESEND_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 },
      );
    }

    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: 'Missing required Svix headers' },
        { status: 400 },
      );
    }

    const headers: WebhookHeaders = {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    };

    const rawBody = await request.text();
    const result = verifyWebhook(rawBody, headers, secret);

    if (!result.success) {
      console.error('Webhook verification failed:', result.error);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 },
      );
    }

    const event = result.event;
    let client: TClient | null = null;

    try {
      client = await handlers.getClient();

      if (isEmailEvent(event)) {
        await handlers.insertEmailEvent(client, event);
      } else if (isContactEvent(event)) {
        await handlers.insertContactEvent(client, event);
      } else if (isDomainEvent(event)) {
        await handlers.insertDomainEvent(client, event);
      } else {
        const _exhaustiveCheck: never = event;
        console.warn('Unknown event type:', _exhaustiveCheck);
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 },
        );
      }

      return NextResponse.json({ received: true }, { status: 200 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Database insertion failed:', message);
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 500 },
      );
    } finally {
      if (client && handlers.cleanup) {
        await handlers.cleanup(client).catch(console.error);
      }
    }
  };
}

// Helper to prepare email event data for insertion
export function prepareEmailEventData(event: EmailWebhookEvent) {
  const { data: eventData, type, created_at } = event;
  return {
    event_type: type,
    event_created_at: created_at,
    email_id: eventData.email_id,
    from_address: eventData.from,
    to_addresses: eventData.to,
    subject: eventData.subject,
    email_created_at: eventData.created_at,
    broadcast_id: eventData.broadcast_id ?? null,
    template_id: eventData.template_id ?? null,
    tags: eventData.tags ?? null,
    bounce_type: eventData.bounce?.type ?? null,
    bounce_sub_type: eventData.bounce?.subType ?? null,
    bounce_message: eventData.bounce?.message ?? null,
    bounce_diagnostic_code: eventData.bounce?.diagnosticCode ?? null,
    click_ip_address: eventData.click?.ipAddress ?? null,
    click_link: eventData.click?.link ?? null,
    click_timestamp: eventData.click?.timestamp ?? null,
    click_user_agent: eventData.click?.userAgent ?? null,
  };
}

// Helper to prepare contact event data for insertion
export function prepareContactEventData(event: ContactWebhookEvent) {
  const { data: eventData, type, created_at } = event;
  return {
    event_type: type,
    event_created_at: created_at,
    contact_id: eventData.id,
    audience_id: eventData.audience_id,
    segment_ids: eventData.segment_ids,
    email: eventData.email,
    first_name: eventData.first_name ?? null,
    last_name: eventData.last_name ?? null,
    unsubscribed: eventData.unsubscribed,
    contact_created_at: eventData.created_at,
    contact_updated_at: eventData.updated_at,
  };
}

// Helper to prepare domain event data for insertion
export function prepareDomainEventData(event: DomainWebhookEvent) {
  const { data: eventData, type, created_at } = event;
  return {
    event_type: type,
    event_created_at: created_at,
    domain_id: eventData.id,
    name: eventData.name,
    status: eventData.status,
    region: eventData.region,
    domain_created_at: eventData.created_at,
    records: eventData.records,
  };
}
