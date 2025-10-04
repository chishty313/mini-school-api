import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";

export class CreateClassDto {
  @IsNotEmpty({ message: "Class name is required" })
  @IsString({ message: "Class name must be a string" })
  name!: string;

  @IsNotEmpty({ message: "Section is required" })
  @IsString({ message: "Section must be a string" })
  section!: string;

  @IsOptional()
  @IsNumber({}, { message: "Teacher ID must be a number" })
  teacherId?: number;
}

export class UpdateClassDto {
  @IsString({ message: "Class name must be a string" })
  name?: string;

  @IsString({ message: "Section must be a string" })
  section?: string;

  @IsOptional()
  @IsNumber({}, { message: "Teacher ID must be a number" })
  teacherId?: number;
}

export class EnrollStudentDto {
  @IsNotEmpty({ message: "Student ID is required" })
  @IsNumber({}, { message: "Student ID must be a number" })
  studentId!: number;
}
