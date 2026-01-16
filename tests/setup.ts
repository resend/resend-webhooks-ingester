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
  postgresql: {
    url:
      process.env.POSTGRESQL_URL ||
      'postgres://postgres:postgres@localhost:5432/resend_test',
  },
  mysql: {
    url:
      process.env.MYSQL_URL || 'mysql://root:mysql@localhost:3306/resend_test',
  },
  clickhouse: {
    url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
    database: process.env.CLICKHOUSE_DATABASE || 'resend_test',
  },
};
