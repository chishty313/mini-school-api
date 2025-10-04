# Mini School Management API

Backend API for the Mini School Management System built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Role-based Access Control**: Admin, Teacher, and Student roles
- **Student Management**: CRUD operations for student records
- **Class Management**: Create and manage classes with teacher assignments
- **Enrollment System**: Enroll students in classes with capacity limits (max 5 per section)
- **Database**: PostgreSQL with Drizzle ORM
- **Security**: Password hashing, CORS, input validation

## Tech Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Cloud)
- **ORM**: Drizzle ORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: class-validator, class-transformer
- **Security**: bcryptjs, helmet, cors

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get user profile

### Students

- `GET /students` - Get all students (Admin/Teacher)
- `GET /students/me/classes` - Get student's classes (Student)
- `POST /students` - Create student (Admin)
- `PUT /students/:id` - Update student (Admin)
- `DELETE /students/:id` - Delete student (Admin)

### Classes

- `GET /classes` - Get all classes
- `POST /classes` - Create class (Admin)
- `PUT /classes/:id` - Update class (Admin)
- `DELETE /classes/:id` - Delete class (Admin)
- `POST /classes/:id/enroll` - Enroll student in class (Admin/Teacher)

### Admin

- `GET /admin/stats` - Get dashboard statistics
- `GET /admin/teachers` - Get teachers with details
- `GET /admin/users` - Get all users

### Teacher

- `GET /teacher/dashboard` - Get teacher dashboard stats
- `GET /teacher/activities` - Get teacher activities
- `GET /teacher/classes` - Get teacher's classes

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Database Configuration
DB_HOST=your-neon-db-host
DB_PORT=5432
DB_USER=your-neon-db-user
DB_PASSWORD=your-neon-db-password
DB_NAME=your-neon-db-name

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# Environment
NODE_ENV=production

# CORS (for frontend)
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon Cloud)
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`
4. Run database migrations:
   ```bash
   npm run db:migrate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## Deployment

This API is configured for deployment on Vercel.

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set the following environment variables in Vercel:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `NODE_ENV=production`
   - `FRONTEND_URL` (your frontend domain)
3. Deploy

### Docker Deployment

```bash
# Build the image
docker build -t mini-school-api .

# Run the container
docker run -p 3000:3000 --env-file .env mini-school-api
```

## Database Schema

### Users Table

- `id` (Primary Key)
- `name` (String)
- `email` (String, Unique)
- `passwordHash` (String)
- `role` (Enum: admin, teacher, student)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Students Table

- `id` (Primary Key)
- `name` (String)
- `age` (Number)
- `classId` (Foreign Key to Classes)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Classes Table

- `id` (Primary Key)
- `name` (String)
- `section` (String)
- `teacherId` (Foreign Key to Users)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation with class-validator
- CORS configuration
- Security headers with helmet
- SQL injection protection with Drizzle ORM

## API Response Format

### Success Response

```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "error": "Error type",
  "message": "Error description"
}
```

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute

## Health Check

- `GET /` - Health check endpoint
- `GET /health` - Detailed health status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
