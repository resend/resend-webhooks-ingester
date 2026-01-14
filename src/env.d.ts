declare namespace NodeJS {
  interface ProcessEnv {
    RESEND_WEBHOOK_SECRET: string;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
  }
}
