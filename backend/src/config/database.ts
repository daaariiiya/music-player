// Pattern: Singleton
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from './env.js';
import * as schema from '../schema/index.js';

const client = postgres(env.DATABASE_URL, { ssl: 'require' });

export const db = drizzle(client, { schema });

export type Database = typeof db;
