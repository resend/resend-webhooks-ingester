import { createClient } from '@clickhouse/client';
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

function getClient() {
  const url = process.env.CLICKHOUSE_URL;
  const username = process.env.CLICKHOUSE_USERNAME;
  const password = process.env.CLICKHOUSE_PASSWORD;
  const database = process.env.CLICKHOUSE_DATABASE;

  if (!url) {
    throw new Error('Missing CLICKHOUSE_URL environment variable');
  }

  return createClient({
    url,
    username: username || 'default',
    password: password || '',
    database: database || 'default',
  });
}

type ClickHouseClient = ReturnType<typeof getClient>;

async function insertEmailEvent(
  client: ClickHouseClient,
  event: EmailWebhookEvent,
) {
  const data = prepareEmailEventData(event);

  await client.insert({
    table: 'resend_wh_emails',
    values: [
      {
        event_type: data.event_type,
        event_created_at: data.event_created_at,
        webhook_received_at: new Date().toISOString(),
        email_id: data.email_id,
        from_address: data.from_address,
        to_addresses: data.to_addresses,
        subject: data.subject,
        email_created_at: data.email_created_at,
        broadcast_id: data.broadcast_id || '',
        template_id: data.template_id || '',
        tags: data.tags ? JSON.stringify(data.tags) : '',
        bounce_type: data.bounce_type || '',
        bounce_sub_type: data.bounce_sub_type || '',
        bounce_message: data.bounce_message || '',
        bounce_diagnostic_code: data.bounce_diagnostic_code || [],
        click_ip_address: data.click_ip_address || '',
        click_link: data.click_link || '',
        click_timestamp: data.click_timestamp || '',
        click_user_agent: data.click_user_agent || '',
      },
    ],
    format: 'JSONEachRow',
  });
}

async function insertContactEvent(
  client: ClickHouseClient,
  event: ContactWebhookEvent,
) {
  const data = prepareContactEventData(event);

  await client.insert({
    table: 'resend_wh_contacts',
    values: [
      {
        event_type: data.event_type,
        event_created_at: data.event_created_at,
        webhook_received_at: new Date().toISOString(),
        contact_id: data.contact_id,
        audience_id: data.audience_id,
        segment_ids: data.segment_ids,
        email: data.email,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        unsubscribed: data.unsubscribed ? 1 : 0,
        contact_created_at: data.contact_created_at,
        contact_updated_at: data.contact_updated_at,
      },
    ],
    format: 'JSONEachRow',
  });
}

async function insertDomainEvent(
  client: ClickHouseClient,
  event: DomainWebhookEvent,
) {
  const data = prepareDomainEventData(event);

  await client.insert({
    table: 'resend_wh_domains',
    values: [
      {
        event_type: data.event_type,
        event_created_at: data.event_created_at,
        webhook_received_at: new Date().toISOString(),
        domain_id: data.domain_id,
        name: data.name,
        status: data.status,
        region: data.region,
        domain_created_at: data.domain_created_at,
        records: data.records ? JSON.stringify(data.records) : '',
      },
    ],
    format: 'JSONEachRow',
  });
}

async function cleanup(client: ClickHouseClient) {
  await client.close();
}

export const POST = createWebhookHandler({
  getClient,
  insertEmailEvent,
  insertContactEvent,
  insertDomainEvent,
  cleanup,
});
