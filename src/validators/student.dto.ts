import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty({ message: 'Student name is required' })
  @IsString({ message: 'Student name must be a string' })
  name!: string;

  @IsNotEmpty({ message: 'Age is required' })
  @IsNumber({}, { message: 'Age must be a number' })
  @Min(5, { message: 'Student age must be at least 5 years' })
  @Max(25, { message: 'Student age must not exceed 25 years' })
  age!: number;

  @IsOptional()
  @IsNumber({}, { message: 'Class ID must be a number' })
  classId?: number;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString({ message: 'Student name must be a string' })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Age must be a number' })
  @Min(5, { message: 'Student age must be at least 5 years' })
  @Max(25, { message: 'Student age must not exceed 25 years' })
  age?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Class ID must be a number' })
  classId?: number;
}

export class GetStudentsQueryDto {
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Class ID must be a number' })
  classId?: number;
}