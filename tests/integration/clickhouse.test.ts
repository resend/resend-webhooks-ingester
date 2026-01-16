import { ClickHouseTestClient } from '../helpers/db-clients';
import { createConnectorTests } from '../helpers/test-factory';

createConnectorTests('clickhouse', () => new ClickHouseTestClient());
