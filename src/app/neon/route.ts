import { neon } from '@neondatabase/serverless';
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

type NeonClient = ReturnType<typeof neon>;

function getClient(): NeonClient {
  const connectionString = process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    throw new Error('Missing NEON_DATABASE_URL environment variable');
  }

  // Using HTTP mode (neon function) for optimal serverless performance
  // HTTP queries are faster than WebSocket/TCP in serverless environments
  // since there's no connection overhead (~3 roundtrips vs ~8 for TCP)
  return neon(connectionString);
}

async function insertEmailEvent(
  sql: NeonClient,
  event: EmailWebhookEvent,
  svixId: string,
) {
  const data = prepareEmailEventData(event);

  await sql`
    INSERT INTO resend_wh_emails (
      svix_id, event_type, event_created_at, email_id, from_address, to_addresses,
      subject, email_created_at, broadcast_id, template_id, tags,
      bounce_type, bounce_sub_type, bounce_message, bounce_diagnostic_code,
      click_ip_address, click_link, click_timestamp, click_user_agent
    ) VALUES (
      ${svixId},
      ${data.event_type},
      ${data.event_created_at},
      ${data.email_id},
      ${data.from_address},
      ${data.to_addresses},
      ${data.subject},
      ${data.email_created_at},
      ${data.broadcast_id},
      ${data.template_id},
      ${data.tags ? JSON.stringify(data.tags) : null},
      ${data.bounce_type},
      ${data.bounce_sub_type},
      ${data.bounce_message},
      ${data.bounce_diagnostic_code},
      ${data.click_ip_address},
      ${data.click_link},
      ${data.click_timestamp},
      ${data.click_user_agent}
    )
    ON CONFLICT (svix_id) DO NOTHING
  `;
}

async function insertContactEvent(
  sql: NeonClient,
  event: ContactWebhookEvent,
  svixId: string,
) {
  const data = prepareContactEventData(event);

  await sql`
    INSERT INTO resend_wh_contacts (
      svix_id, event_type, event_created_at, contact_id, audience_id, segment_ids,
      email, first_name, last_name, unsubscribed, contact_created_at, contact_updated_at
    ) VALUES (
      ${svixId},
      ${data.event_type},
      ${data.event_created_at},
      ${data.contact_id},
      ${data.audience_id},
      ${data.segment_ids},
      ${data.email},
      ${data.first_name},
      ${data.last_name},
      ${data.unsubscribed},
      ${data.contact_created_at},
      ${data.contact_updated_at}
    )
    ON CONFLICT (svix_id) DO NOTHING
  `;
}

async function insertDomainEvent(
  sql: NeonClient,
  event: DomainWebhookEvent,
  svixId: string,
) {
  const data = prepareDomainEventData(event);

  await sql`
    INSERT INTO resend_wh_domains (
      svix_id, event_type, event_created_at, domain_id, name, status,
      region, domain_created_at, records
    ) VALUES (
      ${svixId},
      ${data.event_type},
      ${data.event_created_at},
      ${data.domain_id},
      ${data.name},
      ${data.status},
      ${data.region},
      ${data.domain_created_at},
      ${data.records ? JSON.stringify(data.records) : null}
    )
    ON CONFLICT (svix_id) DO NOTHING
  `;
}

// No cleanup needed for HTTP mode - each query is a stateless HTTP request
export const POST = createWebhookHandler({
  getClient,
  insertEmailEvent,
  insertContactEvent,
  insertDomainEvent,
});
