import { createClient } from '@supabase/supabase-js';
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

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key);
}

type SupabaseClient = ReturnType<typeof getSupabaseClient>;

async function insertEmailEvent(
  supabase: SupabaseClient,
  event: EmailWebhookEvent,
) {
  const { data: eventData, type, created_at } = event;

  const { error } = await supabase.from('resend_wh_emails').insert({
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
    // Bounce fields
    bounce_type: eventData.bounce?.type ?? null,
    bounce_sub_type: eventData.bounce?.subType ?? null,
    bounce_message: eventData.bounce?.message ?? null,
    bounce_diagnostic_code: eventData.bounce?.diagnosticCode ?? null,
    // Click fields
    click_ip_address: eventData.click?.ipAddress ?? null,
    click_link: eventData.click?.link ?? null,
    click_timestamp: eventData.click?.timestamp ?? null,
    click_user_agent: eventData.click?.userAgent ?? null,
  });

  if (error) {
    throw new Error(`Failed to insert email event: ${error.message}`);
  }
}

async function insertContactEvent(
  supabase: SupabaseClient,
  event: ContactWebhookEvent,
) {
  const { data: eventData, type, created_at } = event;

  const { error } = await supabase.from('resend_wh_contacts').insert({
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
  });

  if (error) {
    throw new Error(`Failed to insert contact event: ${error.message}`);
  }
}

async function insertDomainEvent(
  supabase: SupabaseClient,
  event: DomainWebhookEvent,
) {
  const { data: eventData, type, created_at } = event;

  const { error } = await supabase.from('resend_wh_domains').insert({
    event_type: type,
    event_created_at: created_at,
    domain_id: eventData.id,
    name: eventData.name,
    status: eventData.status,
    region: eventData.region,
    domain_created_at: eventData.created_at,
    records: eventData.records,
  });

  if (error) {
    throw new Error(`Failed to insert domain event: ${error.message}`);
  }
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (!secret) {
    console.error('Missing RESEND_WEBHOOK_SECRET environment variable');
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 },
    );
  }

  // Get required headers
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

  // Get raw body for signature verification
  const rawBody = await request.text();

  // Verify the webhook signature
  const result = verifyWebhook(rawBody, headers, secret);

  if (!result.success) {
    console.error('Webhook verification failed:', result.error);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 401 },
    );
  }

  const event = result.event;

  try {
    const supabase = getSupabaseClient();

    if (isEmailEvent(event)) {
      await insertEmailEvent(supabase, event);
    } else if (isContactEvent(event)) {
      await insertContactEvent(supabase, event);
    } else if (isDomainEvent(event)) {
      await insertDomainEvent(supabase, event);
    } else {
      // TypeScript exhaustiveness check - this should never be reached
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
  }
}
