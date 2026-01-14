import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyWebhook, type WebhookHeaders } from '@/lib/verify-webhook';
import {
  prepareContactEventData,
  prepareDomainEventData,
  prepareEmailEventData,
} from '@/lib/webhook-handler';
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
  svixId: string,
) {
  const data = prepareEmailEventData(event);

  const { error } = await supabase.from('resend_wh_emails').upsert(
    {
      svix_id: svixId,
      ...data,
    },
    { onConflict: 'svix_id', ignoreDuplicates: true },
  );

  if (error) {
    throw new Error(`Failed to insert email event: ${error.message}`);
  }
}

async function insertContactEvent(
  supabase: SupabaseClient,
  event: ContactWebhookEvent,
  svixId: string,
) {
  const data = prepareContactEventData(event);

  const { error } = await supabase.from('resend_wh_contacts').upsert(
    {
      svix_id: svixId,
      ...data,
    },
    { onConflict: 'svix_id', ignoreDuplicates: true },
  );

  if (error) {
    throw new Error(`Failed to insert contact event: ${error.message}`);
  }
}

async function insertDomainEvent(
  supabase: SupabaseClient,
  event: DomainWebhookEvent,
  svixId: string,
) {
  const data = prepareDomainEventData(event);

  const { error } = await supabase.from('resend_wh_domains').upsert(
    {
      svix_id: svixId,
      ...data,
    },
    { onConflict: 'svix_id', ignoreDuplicates: true },
  );

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

  try {
    const supabase = getSupabaseClient();

    if (isEmailEvent(event)) {
      await insertEmailEvent(supabase, event, svixId);
    } else if (isContactEvent(event)) {
      await insertContactEvent(supabase, event, svixId);
    } else if (isDomainEvent(event)) {
      await insertDomainEvent(supabase, event, svixId);
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
  }
}
