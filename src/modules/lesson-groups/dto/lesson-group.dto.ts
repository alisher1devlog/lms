import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumberString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryLessonGroupDto {
  @ApiPropertyOptional({ example: '0', description: 'Offset' })
  @IsOptional()
  @IsNumberString()
  offset?: string;

  @ApiPropertyOptional({ example: '8', description: 'Limit' })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({ example: 'true', description: 'Darslarni ham olish' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  include_lessons?: boolean;
}

export class CreateLessonGroupDto {
  @ApiProperty({ example: 'course-uuid-here', description: 'Kurs ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ example: "1-Bo'lim: Kirish" })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateLessonGroupDto {
  @ApiPropertyOptional({ example: "1-Bo'lim: Asoslar" })
  @IsString()
  @IsOptional()
  name?: string;
}
