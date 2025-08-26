const dotenv = require('dotenv');
dotenv.config();

console.log('🧪 Testing Environment Variables:');
console.log('================================');
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_PORT: ${process.env.DB_PORT}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '***SET***' : 'NOT SET'}`);
console.log(`PORT: ${process.env.PORT}`);

if (!process.env.DB_PASSWORD) {
  console.error('❌ DB_PASSWORD is not set! Please check your .env file');
} else {
  console.log('✅ All database environment variables are set');
}