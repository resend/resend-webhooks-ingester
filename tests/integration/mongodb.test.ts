import { MongoDBTestClient } from '../helpers/db-clients';
import { createConnectorTests } from '../helpers/test-factory';

createConnectorTests('mongodb', () => new MongoDBTestClient());
