import { SupabaseTestClient } from '../helpers/db-clients';
import { createConnectorTests } from '../helpers/test-factory';

createConnectorTests('supabase', () => new SupabaseTestClient());
