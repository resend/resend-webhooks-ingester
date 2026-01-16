import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TEST_CONFIG } from '../setup';
import { fixtures } from './fixtures';
import { generateSvixId, signPayload } from './svix';

type CollectionName =
  | 'resend_wh_emails'
  | 'resend_wh_contacts'
  | 'resend_wh_domains';

export interface TestDbClient {
  connect(): Promise<void>;
  findBySvixId(table: CollectionName, svixId: string): Promise<unknown>;
  countBySvixId(table: CollectionName, svixId: string): Promise<number>;
  truncate(table: CollectionName): Promise<void>;
  close(): Promise<void>;
}

export function createConnectorTests(
  connectorName: string,
  createClient: () => TestDbClient,
) {
  const endpoint = `${TEST_CONFIG.appBaseUrl}/${connectorName}`;

  describe(`${connectorName} connector`, () => {
    let dbClient: TestDbClient;

    beforeAll(async () => {
      dbClient = createClient();
      await dbClient.connect();
    });

    afterAll(async () => {
      await dbClient.close();
    });

    beforeEach(async () => {
      await dbClient.truncate('resend_wh_emails');
      await dbClient.truncate('resend_wh_contacts');
      await dbClient.truncate('resend_wh_domains');
    });

    describe('email events', () => {
      it('stores email.sent event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.email.sent();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_emails', svixId);
        expect(stored).not.toBeNull();
      });

      it('stores email.delivered event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.email.delivered();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_emails', svixId);
        expect(stored).not.toBeNull();
      });

      it('stores email.delivery_delayed event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.email.deliveryDelayed();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_emails', svixId);
        expect(stored).not.toBeNull();
      });

      it('stores email.complained event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.email.complained();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_emails', svixId);
        expect(stored).not.toBeNull();
      });

      it('stores email.bounced event with bounce data', async () => {
        const svixId = generateSvixId();
        const event = fixtures.email.bounced();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_emails', svixId);
        expect(stored).not.toBeNull();
      });

      it('stores email.opened event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.email.opened();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_emails', svixId);
        expect(stored).not.toBeNull();
      });

      it('stores email.clicked event with click data', async () => {
        const svixId = generateSvixId();
        const event = fixtures.email.clicked();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_emails', svixId);
        expect(stored).not.toBeNull();
      });

      it('stores email.failed event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.email.failed();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_emails', svixId);
        expect(stored).not.toBeNull();
      });

      it('stores email.scheduled event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.email.scheduled();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_emails', svixId);
        expect(stored).not.toBeNull();
      });

      it('stores email.suppressed event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.email.suppressed();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_emails', svixId);
        expect(stored).not.toBeNull();
      });

      it('stores email.received event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.email.received();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_emails', svixId);
        expect(stored).not.toBeNull();
      });
    });

    describe('contact events', () => {
      it('stores contact.created event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.contact.created();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId(
          'resend_wh_contacts',
          svixId,
        );
        expect(stored).not.toBeNull();
      });

      it('stores contact.updated event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.contact.updated();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId(
          'resend_wh_contacts',
          svixId,
        );
        expect(stored).not.toBeNull();
      });

      it('stores contact.deleted event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.contact.deleted();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId(
          'resend_wh_contacts',
          svixId,
        );
        expect(stored).not.toBeNull();
      });
    });

    describe('domain events', () => {
      it('stores domain.created event with records', async () => {
        const svixId = generateSvixId();
        const event = fixtures.domain.created();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_domains', svixId);
        expect(stored).not.toBeNull();
      });

      it('stores domain.updated event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.domain.updated();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_domains', svixId);
        expect(stored).not.toBeNull();
      });

      it('stores domain.deleted event', async () => {
        const svixId = generateSvixId();
        const event = fixtures.domain.deleted();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });

        expect(response.status).toBe(200);

        const stored = await dbClient.findBySvixId('resend_wh_domains', svixId);
        expect(stored).not.toBeNull();
      });
    });

    describe('idempotency', () => {
      it('stores event only once when sent twice with same svix-id', async () => {
        const svixId = generateSvixId();
        const event = fixtures.email.sent();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event, svixId);

        const response1 = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });
        expect(response1.status).toBe(200);

        const response2 = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: signed.body,
        });
        expect(response2.status).toBe(200);

        const count = await dbClient.countBySvixId('resend_wh_emails', svixId);
        expect(count).toBe(1);
      });
    });

    describe('error handling', () => {
      it('returns 401 for invalid signature', async () => {
        const event = fixtures.email.sent();
        const signed = signPayload(TEST_CONFIG.webhookSecret, event);

        // Tamper with the body after signing
        const tamperedBody = JSON.stringify({ ...event, tampered: true });

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: signed.headers,
          body: tamperedBody,
        });

        expect(response.status).toBe(401);
      });

      it('returns 400 for missing svix headers', async () => {
        const event = fixtures.email.sent();

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(event),
        });

        expect(response.status).toBe(400);
      });
    });
  });
}
