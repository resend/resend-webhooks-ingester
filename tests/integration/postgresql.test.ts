import { PostgreSQLTestClient } from '../helpers/db-clients';
import { createConnectorTests } from '../helpers/test-factory';

createConnectorTests('postgresql', () => new PostgreSQLTestClient());
