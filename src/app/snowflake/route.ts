import snowflake from 'snowflake-sdk';
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

function getConnection(): Promise<snowflake.Connection> {
  const account = process.env.SNOWFLAKE_ACCOUNT;
  const username = process.env.SNOWFLAKE_USERNAME;
  const password = process.env.SNOWFLAKE_PASSWORD;
  const database = process.env.SNOWFLAKE_DATABASE;
  const schema = process.env.SNOWFLAKE_SCHEMA;
  const warehouse = process.env.SNOWFLAKE_WAREHOUSE;

  if (
    !account ||
    !username ||
    !password ||
    !database ||
    !schema ||
    !warehouse
  ) {
    throw new Error('Missing required Snowflake environment variables');
  }

  const connection = snowflake.createConnection({
    account,
    username,
    password,
    database,
    schema,
    warehouse,
  });

  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) {
        reject(new Error(`Failed to connect to Snowflake: ${err.message}`));
      } else {
        resolve(conn);
      }
    });
  });
}

function executeQuery(
  connection: snowflake.Connection,
  sql: string,
  binds: unknown[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: sql,
      binds: binds as snowflake.Binds,
      complete: (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      },
    });
  });
}

async function insertEmailEvent(
  connection: snowflake.Connection,
  event: EmailWebhookEvent,
) {
  const data = prepareEmailEventData(event);

  const sql = `
    INSERT INTO resend_wh_emails (
      event_type, event_created_at, email_id, from_address, to_addresses,
      subject, email_created_at, broadcast_id, template_id, tags,
      bounce_type, bounce_sub_type, bounce_message, bounce_diagnostic_code,
      click_ip_address, click_link, click_timestamp, click_user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await executeQuery(connection, sql, [
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
  connection: snowflake.Connection,
  event: ContactWebhookEvent,
) {
  const data = prepareContactEventData(event);

  const sql = `
    INSERT INTO resend_wh_contacts (
      event_type, event_created_at, contact_id, audience_id, segment_ids,
      email, first_name, last_name, unsubscribed, contact_created_at, contact_updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await executeQuery(connection, sql, [
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
  connection: snowflake.Connection,
  event: DomainWebhookEvent,
) {
  const data = prepareDomainEventData(event);

  const sql = `
    INSERT INTO resend_wh_domains (
      event_type, event_created_at, domain_id, name, status,
      region, domain_created_at, records
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await executeQuery(connection, sql, [
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

async function cleanup(connection: snowflake.Connection) {
  return new Promise<void>((resolve) => {
    connection.destroy((err) => {
      if (err) {
        console.error('Error closing Snowflake connection:', err.message);
      }
      resolve();
    });
  });
}

export const POST = createWebhookHandler({
  getClient: getConnection,
  insertEmailEvent,
  insertContactEvent,
  insertDomainEvent,
  cleanup,
});
