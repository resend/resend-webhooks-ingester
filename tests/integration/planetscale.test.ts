import { PlanetScaleTestClient } from '../helpers/db-clients';
import { createConnectorTests } from '../helpers/test-factory';

createConnectorTests('planetscale', () => new PlanetScaleTestClient());
