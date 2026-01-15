import { MongoClient } from 'mongodb';
import {
  createWebhookHandler,
  prepareContactEventData,
  prepareDomainEventData,
  prepareEmailEventData,
} from '@/lib/webhook-handler';
import type {
  ContactWebhookEvent,
  DomainWebhookEvent,
  EmailWebhookEvent,
} from '@/types/webhook';

async function getClient() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DATABASE;

  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  const client = new MongoClient(uri);
  await client.connect();

  return { client, dbName: dbName || 'resend_webhooks' };
}

type MongoDBClient = Awaited<ReturnType<typeof getClient>>;

async function insertEmailEvent(
  { client, dbName }: MongoDBClient,
  event: EmailWebhookEvent,
  svixId: string,
) {
  const data = prepareEmailEventData(event);
  const db = client.db(dbName);

  // Use updateOne with upsert to handle idempotency
  await db.collection('resend_wh_emails').updateOne(
    { svix_id: svixId },
    {
      $setOnInsert: {
        svix_id: svixId,
        event_type: data.event_type,
        event_created_at: new Date(data.event_created_at),
        webhook_received_at: new Date(),
        email_id: data.email_id,
        from_address: data.from_address,
        to_addresses: data.to_addresses,
        subject: data.subject,
        email_created_at: new Date(data.email_created_at),
        broadcast_id: data.broadcast_id,
        template_id: data.template_id,
        tags: data.tags,
        bounce_type: data.bounce_type,
        bounce_sub_type: data.bounce_sub_type,
        bounce_message: data.bounce_message,
        bounce_diagnostic_code: data.bounce_diagnostic_code,
        click_ip_address: data.click_ip_address,
        click_link: data.click_link,
        click_timestamp: data.click_timestamp
          ? new Date(data.click_timestamp)
          : null,
        click_user_agent: data.click_user_agent,
      },
    },
    { upsert: true },
  );
}

async function insertContactEvent(
  { client, dbName }: MongoDBClient,
  event: ContactWebhookEvent,
  svixId: string,
) {
  const data = prepareContactEventData(event);
  const db = client.db(dbName);

  await db.collection('resend_wh_contacts').updateOne(
    { svix_id: svixId },
    {
      $setOnInsert: {
        svix_id: svixId,
        event_type: data.event_type,
        event_created_at: new Date(data.event_created_at),
        webhook_received_at: new Date(),
        contact_id: data.contact_id,
        audience_id: data.audience_id,
        segment_ids: data.segment_ids,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        unsubscribed: data.unsubscribed,
        contact_created_at: new Date(data.contact_created_at),
        contact_updated_at: new Date(data.contact_updated_at),
      },
    },
    { upsert: true },
  );
}

async function insertDomainEvent(
  { client, dbName }: MongoDBClient,
  event: DomainWebhookEvent,
  svixId: string,
) {
  const data = prepareDomainEventData(event);
  const db = client.db(dbName);

  await db.collection('resend_wh_domains').updateOne(
    { svix_id: svixId },
    {
      $setOnInsert: {
        svix_id: svixId,
        event_type: data.event_type,
        event_created_at: new Date(data.event_created_at),
        webhook_received_at: new Date(),
        domain_id: data.domain_id,
        name: data.name,
        status: data.status,
        region: data.region,
        domain_created_at: new Date(data.domain_created_at),
        records: data.records,
      },
    },
    { upsert: true },
  );
}

async function cleanup({ client }: MongoDBClient) {
  await client.close();
}

export const POST = createWebhookHandler({
  getClient,
  insertEmailEvent,
  insertContactEvent,
  insertDomainEvent,
  cleanup,
});
