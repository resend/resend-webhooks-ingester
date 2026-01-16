import { BigQuery } from '@google-cloud/bigquery';
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
  const projectId = process.env.BIGQUERY_PROJECT_ID;
  const datasetId = process.env.BIGQUERY_DATASET_ID;
  const credentials = process.env.BIGQUERY_CREDENTIALS;

  if (!projectId || !datasetId) {
    throw new Error('Missing BIGQUERY_PROJECT_ID or BIGQUERY_DATASET_ID');
  }

  const options: { projectId: string; credentials?: object } = { projectId };

  if (credentials) {
    options.credentials = JSON.parse(credentials);
  }

  const bigquery = new BigQuery(options);
  return { bigquery, datasetId, projectId };
}

type BigQueryClient = ReturnType<typeof getClient>;

async function insertEmailEvent(
  client: BigQueryClient,
  event: EmailWebhookEvent,
  svixId: string,
) {
  const data = prepareEmailEventData(event);

  // BigQuery doesn't support INSERT IGNORE, so we use MERGE
  const sql = `
    MERGE \`${client.projectId}.${client.datasetId}.resend_wh_emails\` t
    USING (SELECT @svix_id AS svix_id) s
    ON t.svix_id = s.svix_id
    WHEN NOT MATCHED THEN INSERT (
      id, svix_id, event_type, webhook_received_at, event_created_at, email_id,
      from_address, to_addresses, subject, email_created_at, broadcast_id,
      template_id, tags, bounce_type, bounce_sub_type, bounce_message,
      bounce_diagnostic_code, click_ip_address, click_link, click_timestamp, click_user_agent
    ) VALUES (
      GENERATE_UUID(), @svix_id, @event_type, CURRENT_TIMESTAMP(), @event_created_at,
      @email_id, @from_address, @to_addresses, @subject, @email_created_at,
      @broadcast_id, @template_id, @tags, @bounce_type, @bounce_sub_type,
      @bounce_message, @bounce_diagnostic_code, @click_ip_address, @click_link,
      @click_timestamp, @click_user_agent
    )
  `;

  const options = {
    query: sql,
    params: {
      svix_id: svixId,
      event_type: data.event_type,
      event_created_at: new Date(data.event_created_at),
      email_id: data.email_id,
      from_address: data.from_address,
      to_addresses: data.to_addresses || [],
      subject: data.subject,
      email_created_at: new Date(data.email_created_at),
      broadcast_id: data.broadcast_id,
      template_id: data.template_id,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      bounce_type: data.bounce_type,
      bounce_sub_type: data.bounce_sub_type,
      bounce_message: data.bounce_message,
      bounce_diagnostic_code: data.bounce_diagnostic_code || [],
      click_ip_address: data.click_ip_address,
      click_link: data.click_link,
      click_timestamp: data.click_timestamp ? new Date(data.click_timestamp) : null,
      click_user_agent: data.click_user_agent,
    },
    types: {
      svix_id: 'STRING',
      event_type: 'STRING',
      event_created_at: 'TIMESTAMP',
      email_id: 'STRING',
      from_address: 'STRING',
      to_addresses: ['STRING'],
      subject: 'STRING',
      email_created_at: 'TIMESTAMP',
      broadcast_id: 'STRING',
      template_id: 'STRING',
      tags: 'STRING',
      bounce_type: 'STRING',
      bounce_sub_type: 'STRING',
      bounce_message: 'STRING',
      bounce_diagnostic_code: ['STRING'],
      click_ip_address: 'STRING',
      click_link: 'STRING',
      click_timestamp: 'TIMESTAMP',
      click_user_agent: 'STRING',
    },
  };

  await client.bigquery.query(options);
}

async function insertContactEvent(
  client: BigQueryClient,
  event: ContactWebhookEvent,
  svixId: string,
) {
  const data = prepareContactEventData(event);

  const sql = `
    MERGE \`${client.projectId}.${client.datasetId}.resend_wh_contacts\` t
    USING (SELECT @svix_id AS svix_id) s
    ON t.svix_id = s.svix_id
    WHEN NOT MATCHED THEN INSERT (
      id, svix_id, event_type, webhook_received_at, event_created_at, contact_id,
      audience_id, segment_ids, email, first_name, last_name, unsubscribed,
      contact_created_at, contact_updated_at
    ) VALUES (
      GENERATE_UUID(), @svix_id, @event_type, CURRENT_TIMESTAMP(), @event_created_at,
      @contact_id, @audience_id, @segment_ids, @email, @first_name, @last_name,
      @unsubscribed, @contact_created_at, @contact_updated_at
    )
  `;

  const options = {
    query: sql,
    params: {
      svix_id: svixId,
      event_type: data.event_type,
      event_created_at: new Date(data.event_created_at),
      contact_id: data.contact_id,
      audience_id: data.audience_id,
      segment_ids: data.segment_ids || [],
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      unsubscribed: data.unsubscribed,
      contact_created_at: new Date(data.contact_created_at),
      contact_updated_at: new Date(data.contact_updated_at),
    },
    types: {
      svix_id: 'STRING',
      event_type: 'STRING',
      event_created_at: 'TIMESTAMP',
      contact_id: 'STRING',
      audience_id: 'STRING',
      segment_ids: ['STRING'],
      email: 'STRING',
      first_name: 'STRING',
      last_name: 'STRING',
      unsubscribed: 'BOOL',
      contact_created_at: 'TIMESTAMP',
      contact_updated_at: 'TIMESTAMP',
    },
  };

  await client.bigquery.query(options);
}

async function insertDomainEvent(
  client: BigQueryClient,
  event: DomainWebhookEvent,
  svixId: string,
) {
  const data = prepareDomainEventData(event);

  const sql = `
    MERGE \`${client.projectId}.${client.datasetId}.resend_wh_domains\` t
    USING (SELECT @svix_id AS svix_id) s
    ON t.svix_id = s.svix_id
    WHEN NOT MATCHED THEN INSERT (
      id, svix_id, event_type, webhook_received_at, event_created_at, domain_id,
      name, status, region, domain_created_at, records
    ) VALUES (
      GENERATE_UUID(), @svix_id, @event_type, CURRENT_TIMESTAMP(), @event_created_at,
      @domain_id, @name, @status, @region, @domain_created_at, @records
    )
  `;

  const options = {
    query: sql,
    params: {
      svix_id: svixId,
      event_type: data.event_type,
      event_created_at: new Date(data.event_created_at),
      domain_id: data.domain_id,
      name: data.name,
      status: data.status,
      region: data.region,
      domain_created_at: new Date(data.domain_created_at),
      records: data.records ? JSON.stringify(data.records) : null,
    },
    types: {
      svix_id: 'STRING',
      event_type: 'STRING',
      event_created_at: 'TIMESTAMP',
      domain_id: 'STRING',
      name: 'STRING',
      status: 'STRING',
      region: 'STRING',
      domain_created_at: 'TIMESTAMP',
      records: 'STRING',
    },
  };

  await client.bigquery.query(options);
}

export const POST = createWebhookHandler({
  getClient,
  insertEmailEvent,
  insertContactEvent,
  insertDomainEvent,
});
