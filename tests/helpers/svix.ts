import crypto from 'node:crypto';
import { Webhook } from 'svix';

export interface SignedWebhook {
  body: string;
  headers: {
    'svix-id': string;
    'svix-timestamp': string;
    'svix-signature': string;
    'content-type': string;
  };
}

export function signPayload(
  secret: string,
  payload: object,
  msgId?: string,
): SignedWebhook {
  const svixId = msgId || generateSvixId();
  const timestamp = new Date();
  const body = JSON.stringify(payload);

  const wh = new Webhook(secret);
  const signature = wh.sign(svixId, timestamp, body);

  return {
    body,
    headers: {
      'svix-id': svixId,
      'svix-timestamp': Math.floor(timestamp.getTime() / 1_000).toString(),
      'svix-signature': signature,
      'content-type': 'application/json',
    },
  };
}

export function generateSvixId(): string {
  return `msg_${crypto.randomUUID().replace(/-/g, '')}`;
}
