import { validateEnvironment } from '../config/env';
import { db } from '../config/database';
import { users, classes, students } from '../models/schema';

validateEnvironment();

export async function testDatabaseConnection() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test basic connection
    console.log('1. Testing basic connection...');
    await db.select().from(users).limit(1);
    console.log('✅ Basic connection successful');
    
    // Test all tables exist
    console.log('2. Testing table access...');
    await db.select().from(users).limit(0);
    console.log('✅ Users table accessible');
    
    await db.select().from(classes).limit(0);
    console.log('✅ Classes table accessible');
    
    await db.select().from(students).limit(0);
    console.log('✅ Students table accessible');
    
    console.log('🎉 All database tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}