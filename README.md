# 🎓 Mini School Management API

A comprehensive RESTful API for school management built with Express.js, TypeScript, PostgreSQL, and JWT authentication.

## 📋 Features

### 🔐 Authentication Module
- User registration and login with hashed passwords
- JWT access & refresh token system
- Role-based access control (Admin, Teacher, Student)
- Protected routes with proper authorization

### 👨‍🎓 Student Module
- Create new students (Admin only)
- List all students with pagination (Admin/Teacher)
- Get student details by ID (Admin/Teacher)
- Update student information (Admin only)
- Delete students (Admin only)

### 🎓 Class Module
- Create new classes (Admin only)
- List all classes (Admin/Teacher)
- Get class details with student count (Admin/Teacher)
- Enroll students to classes (Admin/Teacher)
- Get students of a specific class (Admin/Teacher)
- Update class information (Admin only)
- Delete classes (Admin only)

### 🛡️ Security & Validation
- Input validation with class-validator
- Comprehensive error handling (400/401/403/404)
- Password strength validation
- SQL injection protection with Drizzle ORM
- Rate limiting ready

### 🗄️ Database
- PostgreSQL with optimized indexes
- Clean relational schema
- Database migrations with Drizzle
- Connection pooling and health checks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+ (or use Docker)
- npm or yarn

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd mini-school-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env` file in root directory:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_management
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_ACCESS_SECRET=your_super_secret_access_key_123456789
JWT_REFRESH_SECRET=your_super_secret_refresh_key_987654321
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

### 4. Database Setup

#### Option A: Local PostgreSQL
1. Create database:
```sql
CREATE DATABASE school_management;
```

2. Run migrations:
```bash
npm run db:generate
npm run db:migrate
```

#### Option B: Docker Database
```bash
# Start PostgreSQL with Docker
npm run docker:db

# Update .env with Docker database settings
# DB_HOST=localhost
# DB_PASSWORD=postgres123
```

### 5. Seed Database (Optional)
```bash
npm run seed
```

This creates sample data:
- 5 users (1 admin, 2 teachers, 2 students)
- 6 classes across different subjects
- 12 students with some enrolled in classes

### 6. Start Development Server
```bash
npm run dev
```

Server will start at `http://localhost:3000`

## 🐳 Docker Deployment

### Full Docker Setup
```bash
# Start all services (API + Database + pgAdmin)
npm run docker:up

# Stop all services
npm run docker:down
```

### Services:
- **API**: `http://localhost:3000`
- **Database**: `localhost:5432`
- **pgAdmin**: `http://localhost:8080` (admin@school.local / admin123)

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| POST | `/auth/refresh` | Refresh access token | Public |
| GET | `/auth/profile` | Get user profile | Protected |
| POST | `/auth/logout` | User logout | Protected |

### 👨‍🎓 Student Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/students` | Create student | Admin |
| GET | `/students` | List students (paginated) | Admin, Teacher |
| GET | `/students/:id` | Get student by ID | Admin, Teacher |
| PUT | `/students/:id` | Update student | Admin |
| DELETE | `/students/:id` | Delete student | Admin |

### 🎓 Class Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/classes` | Create class | Admin |
| GET | `/classes` | List all classes | Admin, Teacher |
| GET | `/classes/:id` | Get class by ID | Admin, Teacher |
| GET | `/classes/:id/students` | Get class students | Admin, Teacher |
| POST | `/classes/:id/enroll` | Enroll student | Admin, Teacher |
| PUT | `/classes/:id` | Update class | Admin |
| DELETE | `/classes/:id` | Delete class | Admin |

### 🔧 Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API health check |
| GET | `/test-db` | Database connection test |

## 📝 Request Examples

### Register User
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Admin",
  "email": "admin@school.com",
  "password": "AdminPass123!",
  "role": "admin"
}
```

### Create Student
```bash
POST /students
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "age": 16,
  "classId": 1
}
```

### Enroll Student
```bash
POST /classes/1/enroll
Authorization: Bearer <admin_or_teacher_token>
Content-Type: application/json

{
  "studentId": 1
}
```

## 🧪 Testing

### Using Postman Collection
1. Import `Mini-School-Management-API.postman_collection.json`
2. Update environment variables (baseUrl)
3. Run authentication requests to get tokens
4. Test all endpoints systematically

### Manual Testing Checklist
- [ ] Health check endpoints
- [ ] User registration/login flow
- [ ] Token-based authentication
- [ ] Role-based access control
- [ ] Student CRUD operations
- [ ] Class CRUD operations
- [ ] Student enrollment flow
- [ ] Error handling scenarios

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio
npm run seed         # Seed database with sample data
npm run test:db      # Test database connection
```

### Project Structure
```
src/
├── config/          # Database and environment config
├── controllers/     # Route controllers
├── middleware/      # Auth and validation middleware
├── models/          # Database schema and types
├── routes/          # API route definitions
├── services/        # Business logic layer
├── scripts/         # Database seeding and utilities
├── utils/           # Helper functions (JWT, password, etc.)
├── validators/      # DTO classes with validation
└── index.ts         # Application entry point
```

### Technology Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: class-validator
- **Password**: bcryptjs
- **Development**: nodemon, ts-node

## 📊 Database Schema

### Users Table
```sql
users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role ENUM('admin', 'teacher', 'student') NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Classes Table
```sql
classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  section VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Students Table
```sql
students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  class_id INTEGER REFERENCES classes(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
- `users_email_idx` on email
- `users_role_idx` on role
- `students_class_id_idx` on class_id
- `students_name_idx` on name
- `classes_name_section_idx` on (name, section)

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Separate access/refresh tokens
- **Role-Based Access**: Middleware for route protection
- **Input Validation**: DTO validation with detailed errors
- **SQL Injection Prevention**: Parameterized queries via ORM
- **Error Handling**: Secure error messages in production

## 🚀 Production Deployment

### Environment Variables
Ensure all required environment variables are set:
- Database connection details
- JWT secrets (use strong, unique values)
- NODE_ENV=production

### Database
- Enable connection pooling
- Set up database backups
- Monitor query performance
- Use read replicas for scaling

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Set secure JWT secrets
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up logging and monitoring
- [ ] Use environment-specific configs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - [your.email@example.com](mailto:your.email@example.com)

## 🙏 Acknowledgments

- Built with modern TypeScript and Express.js
- Database powered by PostgreSQL and Drizzle ORM  
- Authentication using industry-standard JWT
- Comprehensive testing with Postman