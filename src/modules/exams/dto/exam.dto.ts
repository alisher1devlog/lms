import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExamAnswer } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateExamDto {
  @ApiProperty({ description: 'Lesson group ID' })
  @IsString()
  @IsNotEmpty()
  lessonGroupId: string;

  @ApiProperty({ example: 'React nima?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: 'Framework' })
  @IsString()
  @IsNotEmpty()
  variantA: string;

  @ApiProperty({ example: 'Library' })
  @IsString()
  @IsNotEmpty()
  variantB: string;

  @ApiProperty({ example: 'Dasturlash tili' })
  @IsString()
  @IsNotEmpty()
  variantC: string;

  @ApiProperty({ example: "Ma'lumotlar bazasi" })
  @IsString()
  @IsNotEmpty()
  variantD: string;

  @ApiProperty({ enum: ExamAnswer })
  @IsEnum(ExamAnswer)
  answer: ExamAnswer;
}

class SingleExamDto {
  @ApiProperty({ example: 'React nima?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: 'Framework' })
  @IsString()
  @IsNotEmpty()
  variantA: string;

  @ApiProperty({ example: 'Library' })
  @IsString()
  @IsNotEmpty()
  variantB: string;

  @ApiProperty({ example: 'Dasturlash tili' })
  @IsString()
  @IsNotEmpty()
  variantC: string;

  @ApiProperty({ example: "Ma'lumotlar bazasi" })
  @IsString()
  @IsNotEmpty()
  variantD: string;

  @ApiProperty({ enum: ExamAnswer })
  @IsEnum(ExamAnswer)
  answer: ExamAnswer;
}

export class CreateManyExamsDto {
  @ApiProperty({ description: 'Lesson group ID' })
  @IsString()
  @IsNotEmpty()
  lessonGroupId: string;

  @ApiProperty({ type: [SingleExamDto], description: 'Array of exams' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleExamDto)
  exams: SingleExamDto[];
}

export class UpdateExamDto {
  @ApiPropertyOptional({ example: 'React nima?' })
  @IsString()
  @IsOptional()
  question?: string;

  @ApiPropertyOptional({ example: 'Framework' })
  @IsString()
  @IsOptional()
  variantA?: string;

  @ApiPropertyOptional({ example: 'Library' })
  @IsString()
  @IsOptional()
  variantB?: string;

  @ApiPropertyOptional({ example: 'Dasturlash tili' })
  @IsString()
  @IsOptional()
  variantC?: string;

  @ApiPropertyOptional({ example: "Ma'lumotlar bazasi" })
  @IsString()
  @IsOptional()
  variantD?: string;

  @ApiPropertyOptional({ enum: ExamAnswer })
  @IsEnum(ExamAnswer)
  @IsOptional()
  answer?: ExamAnswer;
}

class ExamAnswerDto {
  @ApiProperty({ example: 'exam-uuid' })
  @IsString()
  examId: string;

  @ApiProperty({ enum: ExamAnswer })
  @IsEnum(ExamAnswer)
  answer: ExamAnswer;
}

export class SubmitExamDto {
  @ApiProperty({ example: 'lesson-group-uuid' })
  @IsString()
  lessonGroupId: string;

  @ApiProperty({ type: [ExamAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamAnswerDto)
  answers: ExamAnswerDto[];
}
