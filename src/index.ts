import app from './app';
import { ENV } from './config/env';

const PORT = ENV.PORT;

// Start server (only when not in serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${ENV.NODE_ENV}`);
    console.log(`🗄️  Database: ${ENV.DB_NAME}`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth`);
    console.log(`👨‍🎓 Student endpoints: http://localhost:${PORT}/students`);
    console.log(`🎓 Class endpoints: http://localhost:${PORT}/classes`);
  });
}