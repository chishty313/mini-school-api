import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ENV } from './env';
import * as schema from '../models/schema';

// Build connection string based on environment
const connectionString = ENV.NODE_ENV === 'production' 
  ? `postgresql://${ENV.DB_USER}:${ENV.DB_PASSWORD}@${ENV.DB_HOST}:${ENV.DB_PORT}/${ENV.DB_NAME}?sslmode=require`
  : `postgresql://${ENV.DB_USER}:${ENV.DB_PASSWORD}@${ENV.DB_HOST}:${ENV.DB_PORT}/${ENV.DB_NAME}`;

console.log('🔗 Connecting to database:', 
  ENV.NODE_ENV === 'production' 
    ? `postgresql://${ENV.DB_USER}:****@${ENV.DB_HOST}:${ENV.DB_PORT}/${ENV.DB_NAME}?sslmode=require`
    : `postgresql://${ENV.DB_USER}:****@${ENV.DB_HOST}:${ENV.DB_PORT}/${ENV.DB_NAME}`
);

// Configure postgres client with SSL for production
const client = postgres(connectionString, {
  ssl: ENV.NODE_ENV === 'production' ? 'require' : false,
  max: 1, // Vercel serverless functions work better with single connections
});

export const db = drizzle(client, { schema });