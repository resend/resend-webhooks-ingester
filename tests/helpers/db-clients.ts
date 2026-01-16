import {
  type ClickHouseClient,
  createClient as createClickHouseClient,
} from '@clickhouse/client';
import { type Db, MongoClient } from 'mongodb';
import mysql from 'mysql2/promise';
import { Client as PgClient } from 'pg';
import { TEST_CONFIG } from '../setup';

type CollectionName =
  | 'resend_wh_emails'
  | 'resend_wh_contacts'
  | 'resend_wh_domains';

export class PostgreSQLTestClient {
  private client: PgClient | null = null;

  async connect() {
    this.client = new PgClient({
      connectionString: TEST_CONFIG.postgresql.url,
    });
    await this.client.connect();
  }

  async findBySvixId(table: CollectionName, svixId: string) {
    if (!this.client) {
      throw new Error('Not connected');
    }

    const { rows } = await this.client.query(
      `SELECT * FROM ${table} WHERE svix_id = $1`,
      [svixId],
    );
    return rows[0] || null;
  }

  async countBySvixId(table: CollectionName, svixId: string): Promise<number> {
    if (!this.client) {
      throw new Error('Not connected');
    }

    const { rows } = await this.client.query(
      `SELECT COUNT(*) as count FROM ${table} WHERE svix_id = $1`,
      [svixId],
    );
    return Number.parseInt(rows[0].count, 10);
  }

  async truncate(table: CollectionName) {
    if (!this.client) {
      throw new Error('Not connected');
    }

    await this.client.query(`TRUNCATE TABLE ${table}`);
  }

  async close() {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }
}

export class MySQLTestClient {
  private connection: mysql.Connection | null = null;

  async connect() {
    this.connection = await mysql.createConnection(TEST_CONFIG.mysql.url);
  }

  async findBySvixId(table: CollectionName, svixId: string) {
    if (!this.connection) {
      throw new Error('Not connected');
    }

    const [rows] = await this.connection.execute(
      `SELECT * FROM ${table} WHERE svix_id = ?`,
      [svixId],
    );
    return (rows as mysql.RowDataPacket[])[0] || null;
  }

  async countBySvixId(table: CollectionName, svixId: string): Promise<number> {
    if (!this.connection) {
      throw new Error('Not connected');
    }

    const [rows] = await this.connection.execute(
      `SELECT COUNT(*) as count FROM ${table} WHERE svix_id = ?`,
      [svixId],
    );
    return (rows as mysql.RowDataPacket[])[0].count;
  }

  async truncate(table: CollectionName) {
    if (!this.connection) {
      throw new Error('Not connected');
    }

    await this.connection.execute(`TRUNCATE TABLE ${table}`);
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }
}

export class MongoDBTestClient {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect() {
    this.client = new MongoClient(TEST_CONFIG.mongodb.uri);
    await this.client.connect();
    this.db = this.client.db(TEST_CONFIG.mongodb.database);
  }

  async findBySvixId(collection: CollectionName, svixId: string) {
    if (!this.db) {
      throw new Error('Not connected');
    }

    return this.db.collection(collection).findOne({ svix_id: svixId });
  }

  async countBySvixId(
    collection: CollectionName,
    svixId: string,
  ): Promise<number> {
    if (!this.db) {
      throw new Error('Not connected');
    }

    return this.db.collection(collection).countDocuments({ svix_id: svixId });
  }

  async truncate(collection: CollectionName) {
    if (!this.db) {
      throw new Error('Not connected');
    }

    await this.db.collection(collection).deleteMany({});
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}

export class ClickHouseTestClient {
  private client: ClickHouseClient | null = null;

  async connect() {
    this.client = createClickHouseClient({
      url: TEST_CONFIG.clickhouse.url,
      database: TEST_CONFIG.clickhouse.database,
    });
  }

  async findBySvixId(table: CollectionName, svixId: string) {
    if (!this.client) {
      throw new Error('Not connected');
    }

    const result = await this.client.query({
      query: `SELECT * FROM ${table} WHERE svix_id = {svixId:String} LIMIT 1`,
      query_params: { svixId },
      format: 'JSONEachRow',
    });
    const rows = await result.json();
    return (rows as unknown[])[0] || null;
  }

  async countBySvixId(table: CollectionName, svixId: string): Promise<number> {
    if (!this.client) {
      throw new Error('Not connected');
    }

    const result = await this.client.query({
      query: `SELECT count() as count FROM ${table} FINAL WHERE svix_id = {svixId:String}`,
      query_params: { svixId },
      format: 'JSONEachRow',
    });
    const rows = (await result.json()) as { count: string }[];
    return Number.parseInt(rows[0]?.count || '0', 10);
  }

  async truncate(table: CollectionName) {
    if (!this.client) {
      throw new Error('Not connected');
    }

    await this.client.command({ query: `TRUNCATE TABLE ${table}` });
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}
