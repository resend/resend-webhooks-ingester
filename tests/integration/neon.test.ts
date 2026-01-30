import { NeonTestClient } from '../helpers/db-clients';
import { createConnectorTests } from '../helpers/test-factory';

createConnectorTests('neon', () => new NeonTestClient());
