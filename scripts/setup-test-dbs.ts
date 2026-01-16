import fs from 'node:fs';
import path from 'node:path';
import { createClient as createClickHouseClient } from '@clickhouse/client';
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import mysql from 'mysql2/promise';
import { Client as PgClient } from 'pg';

config({ path: path.resolve(__dirname, '../.env.test') });

const SCHEMAS_DIR = path.resolve(__dirname, '../schemas');

async function setupPostgreSQL() {
  console.info('Setting up PostgreSQL...');
  const client = new PgClient({ connectionString: process.env.POSTGRESQL_URL });
  await client.connect();

  const schema = fs.readFileSync(
    path.join(SCHEMAS_DIR, 'postgresql.sql'),
    'utf-8',
  );
  await client.query(schema);

  await client.end();
  console.info('PostgreSQL setup complete');
}

async function setupSupabase() {
  console.info('Setting up Supabase...');
  if (!process.env.SUPABASE_DB_URL) {
    throw new Error('SUPABASE_DB_URL not set. Get it from Supabase dashboard: Settings > Database > Connection string');
  }
  const client = new PgClient({ connectionString: process.env.SUPABASE_DB_URL });
  await client.connect();

  const schema = fs.readFileSync(
    path.join(SCHEMAS_DIR, 'supabase.sql'),
    'utf-8',
  );
  await client.query(schema);

  await client.end();
  console.info('Supabase setup complete');
}

async function setupMySQL() {
  console.info('Setting up MySQL...');
  const connection = await mysql.createConnection(process.env.MYSQL_URL!);

  const schema = fs.readFileSync(path.join(SCHEMAS_DIR, 'mysql.sql'), 'utf-8');
  const statements = schema.split(';').filter((s) => s.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      await connection.execute(statement);
    }
  }

  await connection.end();
  console.info('MySQL setup complete');
}

async function setupMongoDB() {
  console.info('Setting up MongoDB...');
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();

  const db = client.db(process.env.MONGODB_DATABASE || 'resend_test');

  const collections = [
    'resend_wh_emails',
    'resend_wh_contacts',
    'resend_wh_domains',
  ];

  for (const name of collections) {
    try {
      await db.createCollection(name);
    } catch (e: unknown) {
      const err = e as { codeName?: string };
      if (err.codeName !== 'NamespaceExists') {
        throw e;
      }
    }
  }

  await db
    .collection('resend_wh_emails')
    .createIndex({ svix_id: 1 }, { unique: true });
  await db
    .collection('resend_wh_contacts')
    .createIndex({ svix_id: 1 }, { unique: true });
  await db
    .collection('resend_wh_domains')
    .createIndex({ svix_id: 1 }, { unique: true });

  await client.close();
  console.info('MongoDB setup complete');
}

async function setupClickHouse() {
  console.info('Setting up ClickHouse...');
  const dbName = process.env.CLICKHOUSE_DATABASE || 'resend_test';

  // First connect without database to create it
  const adminClient = createClickHouseClient({
    url: process.env.CLICKHOUSE_URL,
  });

  await adminClient.command({
    query: `CREATE DATABASE IF NOT EXISTS ${dbName}`,
  });
  await adminClient.close();

  // Now connect to the database and create tables
  const client = createClickHouseClient({
    url: process.env.CLICKHOUSE_URL,
    database: dbName,
  });

  const schema = fs.readFileSync(
    path.join(SCHEMAS_DIR, 'clickhouse.sql'),
    'utf-8',
  );
  const statements = schema
    .split(';')
    .map((s) =>
      s
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim(),
    )
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    if (statement.trim()) {
      await client.command({ query: statement });
    }
  }

  await client.close();
  console.info('ClickHouse setup complete');
}

async function main() {
  console.info('Starting test database setup...\n');

  const args = process.argv.slice(2);
  const runAll = args.length === 0;

  if (runAll || args.includes('--postgresql') || args.includes('--pg')) {
    await setupPostgreSQL();
  }

  // Supabase requires real credentials - not run by default
  if (args.includes('--supabase')) {
    await setupSupabase();
  }

  if (runAll || args.includes('--mysql')) {
    await setupMySQL();
  }

  if (runAll || args.includes('--mongodb') || args.includes('--mongo')) {
    await setupMongoDB();
  }

  if (runAll || args.includes('--clickhouse') || args.includes('--ch')) {
    await setupClickHouse();
  }

  console.info('\nAll requested databases set up successfully!');
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
