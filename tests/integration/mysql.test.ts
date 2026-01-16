import { MySQLTestClient } from '../helpers/db-clients';
import { createConnectorTests } from '../helpers/test-factory';

createConnectorTests('mysql', () => new MySQLTestClient());
