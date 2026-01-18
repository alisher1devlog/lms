import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExamAnswer } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateExamDto {
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

class ExamAnswerDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  examId: number;

  @ApiProperty({ enum: ExamAnswer })
  @IsEnum(ExamAnswer)
  answer: ExamAnswer;
}

export class SubmitExamDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  lessonGroupId: number;

  @ApiProperty({ type: [ExamAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamAnswerDto)
  answers: ExamAnswerDto[];
}
