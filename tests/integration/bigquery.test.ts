import { BigQueryTestClient } from '../helpers/db-clients';
import { createConnectorTests } from '../helpers/test-factory';

createConnectorTests('bigquery', () => new BigQueryTestClient());
