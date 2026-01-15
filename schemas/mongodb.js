// MongoDB Schema Setup
// Run this script with: mongosh <your-connection-string> mongodb.js
// Or execute these commands in MongoDB Compass or Atlas

// Switch to database (creates if not exists)
use resend_webhooks;

// Create collections with validation (optional but recommended)
db.createCollection('resend_wh_emails', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['svix_id', 'event_type', 'event_created_at', 'email_id'],
      properties: {
        svix_id: { bsonType: 'string', description: 'Unique webhook event ID from Svix' },
        event_type: { bsonType: 'string', description: 'Type of email event' },
        event_created_at: { bsonType: 'date', description: 'When the event occurred' },
        webhook_received_at: { bsonType: 'date', description: 'When webhook was received' },
        email_id: { bsonType: 'string', description: 'Resend email ID' },
        from_address: { bsonType: 'string' },
        to_addresses: { bsonType: 'array', items: { bsonType: 'string' } },
        subject: { bsonType: 'string' },
        email_created_at: { bsonType: 'date' },
        broadcast_id: { bsonType: ['string', 'null'] },
        template_id: { bsonType: ['string', 'null'] },
        tags: { bsonType: ['object', 'null'] },
        bounce_type: { bsonType: ['string', 'null'] },
        bounce_sub_type: { bsonType: ['string', 'null'] },
        bounce_message: { bsonType: ['string', 'null'] },
        bounce_diagnostic_code: { bsonType: ['array', 'null'] },
        click_ip_address: { bsonType: ['string', 'null'] },
        click_link: { bsonType: ['string', 'null'] },
        click_timestamp: { bsonType: ['date', 'null'] },
        click_user_agent: { bsonType: ['string', 'null'] }
      }
    }
  }
});

db.createCollection('resend_wh_contacts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['svix_id', 'event_type', 'event_created_at', 'contact_id'],
      properties: {
        svix_id: { bsonType: 'string', description: 'Unique webhook event ID from Svix' },
        event_type: { bsonType: 'string', description: 'Type of contact event' },
        event_created_at: { bsonType: 'date', description: 'When the event occurred' },
        webhook_received_at: { bsonType: 'date', description: 'When webhook was received' },
        contact_id: { bsonType: 'string', description: 'Resend contact ID' },
        audience_id: { bsonType: 'string' },
        segment_ids: { bsonType: 'array', items: { bsonType: 'string' } },
        email: { bsonType: 'string' },
        first_name: { bsonType: ['string', 'null'] },
        last_name: { bsonType: ['string', 'null'] },
        unsubscribed: { bsonType: 'bool' },
        contact_created_at: { bsonType: 'date' },
        contact_updated_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('resend_wh_domains', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['svix_id', 'event_type', 'event_created_at', 'domain_id'],
      properties: {
        svix_id: { bsonType: 'string', description: 'Unique webhook event ID from Svix' },
        event_type: { bsonType: 'string', description: 'Type of domain event' },
        event_created_at: { bsonType: 'date', description: 'When the event occurred' },
        webhook_received_at: { bsonType: 'date', description: 'When webhook was received' },
        domain_id: { bsonType: 'string', description: 'Resend domain ID' },
        name: { bsonType: 'string' },
        status: { bsonType: 'string' },
        region: { bsonType: 'string' },
        domain_created_at: { bsonType: 'date' },
        records: { bsonType: ['array', 'null'] }
      }
    }
  }
});

// Create indexes for idempotency and query performance
// Unique index on svix_id ensures no duplicate events
db.resend_wh_emails.createIndex({ svix_id: 1 }, { unique: true });
db.resend_wh_emails.createIndex({ event_created_at: -1 });
db.resend_wh_emails.createIndex({ event_type: 1, event_created_at: -1 });
db.resend_wh_emails.createIndex({ email_id: 1 });

db.resend_wh_contacts.createIndex({ svix_id: 1 }, { unique: true });
db.resend_wh_contacts.createIndex({ event_created_at: -1 });
db.resend_wh_contacts.createIndex({ event_type: 1, event_created_at: -1 });
db.resend_wh_contacts.createIndex({ contact_id: 1 });

db.resend_wh_domains.createIndex({ svix_id: 1 }, { unique: true });
db.resend_wh_domains.createIndex({ event_created_at: -1 });
db.resend_wh_domains.createIndex({ event_type: 1, event_created_at: -1 });
db.resend_wh_domains.createIndex({ domain_id: 1 });

print('MongoDB schema setup complete!');
print('Collections created: resend_wh_emails, resend_wh_contacts, resend_wh_domains');
print('Indexes created for idempotency (svix_id) and query performance');
