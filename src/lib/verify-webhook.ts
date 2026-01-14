import { Webhook } from 'svix';
import type { ResendWebhookEvent } from '@/types/webhook';

export interface WebhookHeaders {
  'svix-id': string;
  'svix-timestamp': string;
  'svix-signature': string;
}

export interface VerificationResult {
  success: true;
  event: ResendWebhookEvent;
}

export interface VerificationError {
  success: false;
  error: string;
}

export type VerifyWebhookResult = VerificationResult | VerificationError;

export function verifyWebhook(
  rawBody: string,
  headers: WebhookHeaders,
  secret: string,
): VerifyWebhookResult {
  const wh = new Webhook(secret);

  try {
    const event = wh.verify(rawBody, {
      'svix-id': headers['svix-id'],
      'svix-timestamp': headers['svix-timestamp'],
      'svix-signature': headers['svix-signature'],
    }) as ResendWebhookEvent;

    return { success: true, event };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown verification error';
    return { success: false, error: message };
  }
}
