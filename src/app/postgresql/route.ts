import { Client } from 'pg';
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
  const connectionString = process.env.POSTGRESQL_URL;

  if (!connectionString) {
    throw new Error('Missing POSTGRESQL_URL environment variable');
  }

  const client = new Client({ connectionString });
  await client.connect();
  return client;
}

async function insertEmailEvent(
  client: Client,
  event: EmailWebhookEvent,
  svixId: string,
) {
  const data = prepareEmailEventData(event);

  const sql = `
    INSERT INTO resend_wh_emails (
      svix_id, event_type, event_created_at, email_id, from_address, to_addresses,
      subject, email_created_at, broadcast_id, template_id, tags,
      bounce_type, bounce_sub_type, bounce_message, bounce_diagnostic_code,
      click_ip_address, click_link, click_timestamp, click_user_agent
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    ON CONFLICT (svix_id) DO NOTHING
  `;

  await client.query(sql, [
    svixId,
    data.event_type,
    data.event_created_at,
    data.email_id,
    data.from_address,
    data.to_addresses,
    data.subject,
    data.email_created_at,
    data.broadcast_id,
    data.template_id,
    data.tags ? JSON.stringify(data.tags) : null,
    data.bounce_type,
    data.bounce_sub_type,
    data.bounce_message,
    data.bounce_diagnostic_code,
    data.click_ip_address,
    data.click_link,
    data.click_timestamp,
    data.click_user_agent,
  ]);
}

async function insertContactEvent(
  client: Client,
  event: ContactWebhookEvent,
  svixId: string,
) {
  const data = prepareContactEventData(event);

  const sql = `
    INSERT INTO resend_wh_contacts (
      svix_id, event_type, event_created_at, contact_id, audience_id, segment_ids,
      email, first_name, last_name, unsubscribed, contact_created_at, contact_updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (svix_id) DO NOTHING
  `;

  await client.query(sql, [
    svixId,
    data.event_type,
    data.event_created_at,
    data.contact_id,
    data.audience_id,
    data.segment_ids,
    data.email,
    data.first_name,
    data.last_name,
    data.unsubscribed,
    data.contact_created_at,
    data.contact_updated_at,
  ]);
}

async function insertDomainEvent(
  client: Client,
  event: DomainWebhookEvent,
  svixId: string,
) {
  const data = prepareDomainEventData(event);

  const sql = `
    INSERT INTO resend_wh_domains (
      svix_id, event_type, event_created_at, domain_id, name, status,
      region, domain_created_at, records
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (svix_id) DO NOTHING
  `;

  await client.query(sql, [
    svixId,
    data.event_type,
    data.event_created_at,
    data.domain_id,
    data.name,
    data.status,
    data.region,
    data.domain_created_at,
    data.records ? JSON.stringify(data.records) : null,
  ]);
}

async function cleanup(client: Client) {
  await client.end();
}

export const POST = createWebhookHandler({
  getClient,
  insertEmailEvent,
  insertContactEvent,
  insertDomainEvent,
  cleanup,
});
