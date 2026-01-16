import { SnowflakeTestClient } from '../helpers/db-clients';
import { createConnectorTests } from '../helpers/test-factory';

createConnectorTests('snowflake', () => new SnowflakeTestClient());
