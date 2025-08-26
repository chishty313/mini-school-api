import { validateEnvironment } from '../config/env';
import { db } from '../config/database';
import { users, classes, students } from '../models/schema';
import { PasswordService } from '../utils/password';
import { eq } from 'drizzle-orm';

// Load environment first
validateEnvironment();

interface SeedData {
  users: Array<{
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'teacher' | 'student';
  }>;
  classes: Array<{
    name: string;
    section: string;
  }>;
  students: Array<{
    name: string;
    age: number;
    className?: string;
    classSection?: string;
  }>;
}

const seedData: SeedData = {
  users: [
    {
      name: 'System Admin',
      email: 'admin@school.edu',
      password: 'AdminPass123!',
      role: 'admin',
    },
    {
      name: 'John Teacher',
      email: 'john.teacher@school.edu',
      password: 'TeacherPass123!',
      role: 'teacher',
    },
    {
      name: 'Sarah Teacher',
      email: 'sarah.teacher@school.edu',
      password: 'TeacherPass123!',
      role: 'teacher',
    },
    {
      name: 'Alice Student',
      email: 'alice.student@school.edu',
      password: 'StudentPass123!',
      role: 'student',
    },
    {
      name: 'Bob Student',
      email: 'bob.student@school.edu',
      password: 'StudentPass123!',
      role: 'student',
    },
  ],
  classes: [
    { name: 'Mathematics', section: 'A' },
    { name: 'Mathematics', section: 'B' },
    { name: 'Science', section: 'A' },
    { name: 'Science', section: 'B' },
    { name: 'English', section: 'A' },
    { name: 'History', section: 'A' },
  ],
  students: [
    { name: 'Emma Wilson', age: 16, className: 'Mathematics', classSection: 'A' },
    { name: 'Liam Johnson', age: 17, className: 'Mathematics', classSection: 'A' },
    { name: 'Olivia Brown', age: 15, className: 'Mathematics', classSection: 'B' },
    { name: 'Noah Davis', age: 16, className: 'Science', classSection: 'A' },
    { name: 'Ava Miller', age: 17, className: 'Science', classSection: 'A' },
    { name: 'William Garcia', age: 16, className: 'Science', classSection: 'B' },
    { name: 'Sophia Rodriguez', age: 15, className: 'English', classSection: 'A' },
    { name: 'James Martinez', age: 17, className: 'English', classSection: 'A' },
    { name: 'Isabella Anderson', age: 16, className: 'History', classSection: 'A' },
    { name: 'Benjamin Taylor', age: 15, className: 'History', classSection: 'A' },
    { name: 'Mia Thomas', age: 16 }, // No class assigned
    { name: 'Lucas Jackson', age: 17 }, // No class assigned
  ],
};

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Clear existing data (in correct order due to foreign keys)
    console.log('🧹 Clearing existing data...');
    await db.delete(students);
    await db.delete(classes);
    await db.delete(users);
    console.log('✅ Existing data cleared\n');

    // 2. Seed Users
    console.log('👥 Seeding users...');
    const hashedUsers = await Promise.all(
      seedData.users.map(async (user) => ({
        name: user.name,
        email: user.email,
        passwordHash: await PasswordService.hashPassword(user.password),
        role: user.role,
      }))
    );

    const createdUsers = await db.insert(users).values(hashedUsers).returning();
    console.log(`✅ Created ${createdUsers.length} users`);

    // Print user credentials
    console.log('\n📋 User Credentials:');
    seedData.users.forEach((user, index) => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });
    console.log();

    // 3. Seed Classes
    console.log('🎓 Seeding classes...');
    const createdClasses = await db.insert(classes).values(seedData.classes).returning();
    console.log(`✅ Created ${createdClasses.length} classes`);

    // Print classes
    console.log('\n📚 Classes Created:');
    createdClasses.forEach((cls) => {
      console.log(`- ${cls.name} (Section ${cls.section}) [ID: ${cls.id}]`);
    });
    console.log();

    // 4. Seed Students
    console.log('👨‍🎓 Seeding students...');
    const studentsToInsert = await Promise.all(
      seedData.students.map(async (student) => {
        let classId = null;

        if (student.className && student.classSection) {
          const [foundClass] = await db
            .select()
            .from(classes)
            .where(eq(classes.name, student.className))
            .limit(1);

          if (foundClass && foundClass.section === student.classSection) {
            classId = foundClass.id;
          }
        }

        return {
          name: student.name,
          age: student.age,
          classId,
        };
      })
    );

    const createdStudents = await db.insert(students).values(studentsToInsert).returning();
    console.log(`✅ Created ${createdStudents.length} students`);

    // Print students with their classes
    console.log('\n👨‍🎓 Students Created:');
    for (const student of createdStudents) {
      let classInfo = 'No class assigned';
      if (student.classId) {
        const [studentClass] = await db
          .select()
          .from(classes)
          .where(eq(classes.id, student.classId))
          .limit(1);
        
        if (studentClass) {
          classInfo = `${studentClass.name} - Section ${studentClass.section}`;
        }
      }
      console.log(`- ${student.name} (Age ${student.age}) → ${classInfo}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${createdUsers.length} users created`);
    console.log(`- ${createdClasses.length} classes created`);
    console.log(`- ${createdStudents.length} students created`);
    console.log('\n🔐 You can now login with any of the user credentials listed above.');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding process failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };