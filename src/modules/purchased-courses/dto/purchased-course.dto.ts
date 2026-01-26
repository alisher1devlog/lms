import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevel } from '@prisma/client';
import { Type } from 'class-transformer';

export class PurchaseCourseDto {
  @ApiProperty({ description: 'Kurs ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;
}

export class CreatePurchasedCourseDto {
  @ApiProperty({ description: 'Kurs ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: 'Student telefon raqami',
    example: '+998902400005',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class QueryPurchasedCourseDto {
  @ApiPropertyOptional({ default: 0, description: 'Offset for pagination' })
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({ default: 8, description: 'Limit for pagination' })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: 'Search by course name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Category ID filter' })
  @IsOptional()
  @Type(() => Number)
  category_id?: number;

  @ApiPropertyOptional({
    enum: CourseLevel,
    description: 'Course level filter',
  })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;
}

export class QueryCourseStudentsDto {
  @ApiPropertyOptional({ default: 0, description: 'Offset for pagination' })
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({ default: 8, description: 'Limit for pagination' })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: 'Search by student name' })
  @IsOptional()
  @IsString()
  search?: string;
}
