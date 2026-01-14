import mysql from 'mysql2/promise';
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

async function getConnection() {
  const connectionString = process.env.MYSQL_URL;

  if (!connectionString) {
    throw new Error('Missing MYSQL_URL environment variable');
  }

  return mysql.createConnection(connectionString);
}

async function insertEmailEvent(
  connection: mysql.Connection,
  event: EmailWebhookEvent,
  svixId: string,
) {
  const data = prepareEmailEventData(event);

  const sql = `
    INSERT IGNORE INTO resend_wh_emails (
      svix_id, event_type, event_created_at, email_id, from_address, to_addresses,
      subject, email_created_at, broadcast_id, template_id, tags,
      bounce_type, bounce_sub_type, bounce_message, bounce_diagnostic_code,
      click_ip_address, click_link, click_timestamp, click_user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await connection.execute(sql, [
    svixId,
    data.event_type,
    data.event_created_at,
    data.email_id,
    data.from_address,
    JSON.stringify(data.to_addresses),
    data.subject,
    data.email_created_at,
    data.broadcast_id,
    data.template_id,
    data.tags ? JSON.stringify(data.tags) : null,
    data.bounce_type,
    data.bounce_sub_type,
    data.bounce_message,
    data.bounce_diagnostic_code
      ? JSON.stringify(data.bounce_diagnostic_code)
      : null,
    data.click_ip_address,
    data.click_link,
    data.click_timestamp,
    data.click_user_agent,
  ]);
}

async function insertContactEvent(
  connection: mysql.Connection,
  event: ContactWebhookEvent,
  svixId: string,
) {
  const data = prepareContactEventData(event);

  const sql = `
    INSERT IGNORE INTO resend_wh_contacts (
      svix_id, event_type, event_created_at, contact_id, audience_id, segment_ids,
      email, first_name, last_name, unsubscribed, contact_created_at, contact_updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await connection.execute(sql, [
    svixId,
    data.event_type,
    data.event_created_at,
    data.contact_id,
    data.audience_id,
    JSON.stringify(data.segment_ids),
    data.email,
    data.first_name,
    data.last_name,
    data.unsubscribed,
    data.contact_created_at,
    data.contact_updated_at,
  ]);
}

async function insertDomainEvent(
  connection: mysql.Connection,
  event: DomainWebhookEvent,
  svixId: string,
) {
  const data = prepareDomainEventData(event);

  const sql = `
    INSERT IGNORE INTO resend_wh_domains (
      svix_id, event_type, event_created_at, domain_id, name, status,
      region, domain_created_at, records
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await connection.execute(sql, [
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

async function cleanup(connection: mysql.Connection) {
  await connection.end();
}

export const POST = createWebhookHandler({
  getClient: getConnection,
  insertEmailEvent,
  insertContactEvent,
  insertDomainEvent,
  cleanup,
});
