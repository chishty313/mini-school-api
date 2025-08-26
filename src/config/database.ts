import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ENV } from './env';
import * as schema from '../models/schema';

const connectionString = `postgresql://${ENV.DB_USER}:${ENV.DB_PASSWORD}@${ENV.DB_HOST}:${ENV.DB_PORT}/${ENV.DB_NAME}`;

console.log('🔗 Connecting to database:', `postgresql://${ENV.DB_USER}:****@${ENV.DB_HOST}:${ENV.DB_PORT}/${ENV.DB_NAME}`);

const client = postgres(connectionString);
export const db = drizzle(client, { schema });