import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

// Explicitly load environment variables
dotenv.config();

// Verify environment variables are loaded
console.log('Drizzle Config - DB Connection Details:');
console.log(`Node Environment: ${process.env.NODE_ENV}`);
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`Password: ${process.env.DB_PASSWORD ? 'SET' : 'NOT SET'}`);

if (!process.env.DB_HOST || !process.env.DB_PASSWORD) {
  throw new Error('Missing required database environment variables. Check your .env file.');
}

// Configure SSL based on environment
const sslConfig = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;

export default defineConfig({
  schema: './src/models/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME!,
    ssl: sslConfig,
  },
});