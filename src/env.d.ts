declare namespace NodeJS {
  interface ProcessEnv {
    // Resend
    RESEND_WEBHOOK_SECRET: string;

    // Supabase
    SUPABASE_URL?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;

    // PostgreSQL
    POSTGRESQL_URL?: string;

    // MySQL
    MYSQL_URL?: string;

    // PlanetScale
    PLANETSCALE_URL?: string;

    // Snowflake
    SNOWFLAKE_ACCOUNT?: string;
    SNOWFLAKE_USERNAME?: string;
    SNOWFLAKE_PASSWORD?: string;
    SNOWFLAKE_DATABASE?: string;
    SNOWFLAKE_SCHEMA?: string;
    SNOWFLAKE_WAREHOUSE?: string;

    // BigQuery
    BIGQUERY_PROJECT_ID?: string;
    BIGQUERY_DATASET_ID?: string;
    BIGQUERY_CREDENTIALS?: string;

    // ClickHouse
    CLICKHOUSE_URL?: string;
    CLICKHOUSE_USERNAME?: string;
    CLICKHOUSE_PASSWORD?: string;
    CLICKHOUSE_DATABASE?: string;
  }
}
