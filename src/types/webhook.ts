// Email event types
export type EmailEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked'
  | 'email.failed'
  | 'email.scheduled'
  | 'email.suppressed'
  | 'email.received';

// Contact event types
export type ContactEventType =
  | 'contact.created'
  | 'contact.updated'
  | 'contact.deleted';

// Domain event types
export type DomainEventType =
  | 'domain.created'
  | 'domain.updated'
  | 'domain.deleted';

export type WebhookEventType =
  | EmailEventType
  | ContactEventType
  | DomainEventType;

// Tag structure
export interface WebhookTag {
  name: string;
  value: string;
}

// Bounce details
export interface BounceData {
  diagnosticCode: string[];
  message: string;
  subType: string;
  type: string;
}

// Click details
export interface ClickData {
  ipAddress: string;
  link: string;
  timestamp: string;
  userAgent: string;
}

// Email event data (common fields)
export interface EmailEventData {
  email_id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  broadcast_id?: string;
  template_id?: string;
  tags?: WebhookTag[];
  // Event-specific fields
  bounce?: BounceData;
  click?: ClickData;
}

// Contact event data
export interface ContactEventData {
  id: string;
  audience_id?: string;
  segment_ids: string[];
  created_at: string;
  updated_at: string;
  email: string;
  first_name?: string;
  last_name?: string;
  unsubscribed: boolean;
}

// Domain DNS record
export interface DomainRecord {
  record: 'SPF' | 'DKIM' | 'Receiving MX';
  name: string;
  type: 'MX' | 'TXT' | 'CNAME';
  value: string;
  ttl: string;
  status: string;
  priority?: number;
}

// Domain event data
export interface DomainEventData {
  id: string;
  name: string;
  status:
    | 'verified'
    | 'partially_failed'
    | 'failed'
    | 'pending'
    | 'not_started';
  created_at: string;
  region: 'us-east-1' | 'eu-west-1' | 'sa-east-1' | 'ap-northeast-1';
  records: DomainRecord[];
}

// Webhook event wrapper
export interface WebhookEvent<T extends WebhookEventType, D> {
  type: T;
  created_at: string;
  data: D;
}

// Specific event types
export type EmailWebhookEvent = WebhookEvent<EmailEventType, EmailEventData>;
export type ContactWebhookEvent = WebhookEvent<
  ContactEventType,
  ContactEventData
>;
export type DomainWebhookEvent = WebhookEvent<DomainEventType, DomainEventData>;

// Union type for all webhook events
export type ResendWebhookEvent =
  | EmailWebhookEvent
  | ContactWebhookEvent
  | DomainWebhookEvent;

// Type guards
export function isEmailEvent(
  event: ResendWebhookEvent,
): event is EmailWebhookEvent {
  return event.type.startsWith('email.');
}

export function isContactEvent(
  event: ResendWebhookEvent,
): event is ContactWebhookEvent {
  return event.type.startsWith('contact.');
}

export function isDomainEvent(
  event: ResendWebhookEvent,
): event is DomainWebhookEvent {
  return event.type.startsWith('domain.');
}
