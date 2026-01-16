import type {
  ContactWebhookEvent,
  DomainWebhookEvent,
  EmailWebhookEvent,
} from '@/types/webhook';

export function createEmailSentEvent(
  overrides?: Partial<EmailWebhookEvent>,
): EmailWebhookEvent {
  return {
    type: 'email.sent',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'em_test123',
      from: 'test@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Email',
      created_at: new Date().toISOString(),
      tags: [{ name: 'campaign', value: 'test' }],
    },
    ...overrides,
  };
}

export function createEmailBouncedEvent(
  overrides?: Partial<EmailWebhookEvent>,
): EmailWebhookEvent {
  return {
    type: 'email.bounced',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'em_bounce123',
      from: 'sender@example.com',
      to: ['invalid@example.com'],
      subject: 'Bounced Email',
      created_at: new Date().toISOString(),
      bounce: {
        type: 'hard',
        subType: 'permanent',
        message: 'Mailbox not found',
        diagnosticCode: ['550 5.1.1 User unknown'],
      },
    },
    ...overrides,
  };
}

export function createEmailClickedEvent(
  overrides?: Partial<EmailWebhookEvent>,
): EmailWebhookEvent {
  return {
    type: 'email.clicked',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'em_click123',
      from: 'sender@example.com',
      to: ['clicker@example.com'],
      subject: 'Email with Link',
      created_at: new Date().toISOString(),
      click: {
        ipAddress: '192.168.1.1',
        link: 'https://example.com/link',
        timestamp: new Date().toISOString(),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
    },
    ...overrides,
  };
}

export function createEmailDeliveredEvent(
  overrides?: Partial<EmailWebhookEvent>,
): EmailWebhookEvent {
  return {
    type: 'email.delivered',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'em_delivered123',
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Delivered Email',
      created_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

export function createEmailDeliveryDelayedEvent(
  overrides?: Partial<EmailWebhookEvent>,
): EmailWebhookEvent {
  return {
    type: 'email.delivery_delayed',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'em_delayed123',
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Delayed Email',
      created_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

export function createEmailComplainedEvent(
  overrides?: Partial<EmailWebhookEvent>,
): EmailWebhookEvent {
  return {
    type: 'email.complained',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'em_complained123',
      from: 'sender@example.com',
      to: ['complainer@example.com'],
      subject: 'Complained Email',
      created_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

export function createEmailOpenedEvent(
  overrides?: Partial<EmailWebhookEvent>,
): EmailWebhookEvent {
  return {
    type: 'email.opened',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'em_opened123',
      from: 'sender@example.com',
      to: ['opener@example.com'],
      subject: 'Opened Email',
      created_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

export function createEmailFailedEvent(
  overrides?: Partial<EmailWebhookEvent>,
): EmailWebhookEvent {
  return {
    type: 'email.failed',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'em_failed123',
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Failed Email',
      created_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

export function createEmailScheduledEvent(
  overrides?: Partial<EmailWebhookEvent>,
): EmailWebhookEvent {
  return {
    type: 'email.scheduled',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'em_scheduled123',
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Scheduled Email',
      created_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

export function createEmailSuppressedEvent(
  overrides?: Partial<EmailWebhookEvent>,
): EmailWebhookEvent {
  return {
    type: 'email.suppressed',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'em_suppressed123',
      from: 'sender@example.com',
      to: ['suppressed@example.com'],
      subject: 'Suppressed Email',
      created_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

export function createEmailReceivedEvent(
  overrides?: Partial<EmailWebhookEvent>,
): EmailWebhookEvent {
  return {
    type: 'email.received',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'em_received123',
      from: 'external@example.com',
      to: ['inbox@example.com'],
      subject: 'Received Email',
      created_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

export function createContactCreatedEvent(
  overrides?: Partial<ContactWebhookEvent>,
): ContactWebhookEvent {
  return {
    type: 'contact.created',
    created_at: new Date().toISOString(),
    data: {
      id: 'ct_test123',
      audience_id: 'aud_test123',
      segment_ids: ['seg_1', 'seg_2'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email: 'contact@example.com',
      first_name: 'John',
      last_name: 'Doe',
      unsubscribed: false,
    },
    ...overrides,
  };
}

export function createContactDeletedEvent(
  overrides?: Partial<ContactWebhookEvent>,
): ContactWebhookEvent {
  return {
    type: 'contact.deleted',
    created_at: new Date().toISOString(),
    data: {
      id: 'ct_deleted123',
      audience_id: 'aud_test123',
      segment_ids: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email: 'deleted@example.com',
      unsubscribed: true,
    },
    ...overrides,
  };
}

export function createContactUpdatedEvent(
  overrides?: Partial<ContactWebhookEvent>,
): ContactWebhookEvent {
  return {
    type: 'contact.updated',
    created_at: new Date().toISOString(),
    data: {
      id: 'ct_updated123',
      audience_id: 'aud_test123',
      segment_ids: ['seg_1'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email: 'updated@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      unsubscribed: false,
    },
    ...overrides,
  };
}

export function createDomainCreatedEvent(
  overrides?: Partial<DomainWebhookEvent>,
): DomainWebhookEvent {
  return {
    type: 'domain.created',
    created_at: new Date().toISOString(),
    data: {
      id: 'dom_test123',
      name: 'example.com',
      status: 'pending',
      created_at: new Date().toISOString(),
      region: 'us-east-1',
      records: [
        {
          record: 'SPF',
          name: 'example.com',
          type: 'TXT',
          value: 'v=spf1 include:_spf.resend.com ~all',
          ttl: '3600',
          status: 'not_started',
        },
        {
          record: 'DKIM',
          name: 'resend._domainkey.example.com',
          type: 'TXT',
          value: 'p=MIGfMA0GCSqGSIb3DQEBAQUAA4...',
          ttl: '3600',
          status: 'not_started',
        },
      ],
    },
    ...overrides,
  };
}

export function createDomainUpdatedEvent(
  overrides?: Partial<DomainWebhookEvent>,
): DomainWebhookEvent {
  return {
    type: 'domain.updated',
    created_at: new Date().toISOString(),
    data: {
      id: 'dom_updated123',
      name: 'updated.example.com',
      status: 'verified',
      created_at: new Date().toISOString(),
      region: 'us-east-1',
      records: [
        {
          record: 'SPF',
          name: 'updated.example.com',
          type: 'TXT',
          value: 'v=spf1 include:_spf.resend.com ~all',
          ttl: '3600',
          status: 'verified',
        },
      ],
    },
    ...overrides,
  };
}

export function createDomainDeletedEvent(
  overrides?: Partial<DomainWebhookEvent>,
): DomainWebhookEvent {
  return {
    type: 'domain.deleted',
    created_at: new Date().toISOString(),
    data: {
      id: 'dom_deleted123',
      name: 'deleted.example.com',
      status: 'pending',
      created_at: new Date().toISOString(),
      region: 'eu-west-1',
      records: [],
    },
    ...overrides,
  };
}

export const fixtures = {
  email: {
    sent: createEmailSentEvent,
    delivered: createEmailDeliveredEvent,
    deliveryDelayed: createEmailDeliveryDelayedEvent,
    complained: createEmailComplainedEvent,
    bounced: createEmailBouncedEvent,
    opened: createEmailOpenedEvent,
    clicked: createEmailClickedEvent,
    failed: createEmailFailedEvent,
    scheduled: createEmailScheduledEvent,
    suppressed: createEmailSuppressedEvent,
    received: createEmailReceivedEvent,
  },
  contact: {
    created: createContactCreatedEvent,
    updated: createContactUpdatedEvent,
    deleted: createContactDeletedEvent,
  },
  domain: {
    created: createDomainCreatedEvent,
    updated: createDomainUpdatedEvent,
    deleted: createDomainDeletedEvent,
  },
};
