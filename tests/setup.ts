import path from 'node:path';
import { config } from 'dotenv';

config({ path: path.resolve(__dirname, '../.env.test') });

export const TEST_CONFIG = {
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
  webhookSecret:
    process.env.RESEND_WEBHOOK_SECRET ||
    'whsec_dGVzdF9zZWNyZXRfa2V5X2Zvcl90ZXN0aW5nXzEyMzQ=',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: process.env.MONGODB_DATABASE || 'resend_test',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    dbUrl: process.env.SUPABASE_DB_URL || '',
  },
  postgresql: {
    url:
      process.env.POSTGRESQL_URL ||
      'postgres://postgres:postgres@localhost:5432/resend_test',
  },
  neon: {
    url: process.env.NEON_DATABASE_URL || '',
  },
  mysql: {
    url:
      process.env.MYSQL_URL || 'mysql://root:mysql@localhost:3306/resend_test',
  },
  clickhouse: {
    url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
    database: process.env.CLICKHOUSE_DATABASE || 'resend_test',
  },
  planetscale: {
    url: process.env.PLANETSCALE_URL || '',
  },
  bigquery: {
    projectId: process.env.BIGQUERY_PROJECT_ID || '',
    datasetId: process.env.BIGQUERY_DATASET_ID || '',
    credentials: process.env.BIGQUERY_CREDENTIALS || '',
  },
  snowflake: {
    account: process.env.SNOWFLAKE_ACCOUNT || '',
    username: process.env.SNOWFLAKE_USERNAME || '',
    password: process.env.SNOWFLAKE_PASSWORD || '',
    database: process.env.SNOWFLAKE_DATABASE || '',
    schema: process.env.SNOWFLAKE_SCHEMA || '',
    warehouse: process.env.SNOWFLAKE_WAREHOUSE || '',
  },
};
