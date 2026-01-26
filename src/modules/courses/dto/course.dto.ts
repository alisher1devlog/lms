import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevel, PaidVia } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Kurs nomi',
    example: 'NestJS ultimate course for absolute beginners',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Kurs haqida',
    example: 'Best nodeJS back-end course ever!',
  })
  @IsString()
  @IsNotEmpty()
  about: string;

  @ApiProperty({ description: 'Kurs narxi', example: '250000' })
  @IsNotEmpty()
  @Type(() => Number)
  price: number;

  @ApiProperty({ enum: CourseLevel, description: 'Kurs darajasi' })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({
    description: 'Kategoriya ID (UUID)',
    example: 'uuid-category-id',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Banner rasmi',
    type: 'string',
    format: 'binary',
  })
  banner?: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Intro video',
    type: 'string',
    format: 'binary',
  })
  introVideo?: Express.Multer.File;
}

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'React JS Kursi' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: "React JS asoslari va ilg'or mavzular" })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiPropertyOptional({ example: 500000 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
  @IsString()
  @IsOptional()
  banner?: string;

  @ApiPropertyOptional({ example: 'https://example.com/intro.mp4' })
  @IsString()
  @IsOptional()
  introVideo?: string;

  @ApiPropertyOptional({ enum: CourseLevel })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;
}

export class QueryCourseDto {
  @ApiPropertyOptional({ default: 0, description: 'Offset for pagination' })
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({ default: 8, description: 'Limit for pagination' })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: 'Search by name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: CourseLevel,
    description: 'Course level filter',
  })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @ApiPropertyOptional({ description: 'Category ID filter' })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Mentor ID filter' })
  @IsOptional()
  @IsString()
  mentor_id?: string;

  @ApiPropertyOptional({ description: 'Minimum price filter' })
  @IsOptional()
  @Type(() => Number)
  price_min?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter' })
  @IsOptional()
  @Type(() => Number)
  price_max?: number;
}

export class PurchaseCourseDto {
  @ApiProperty({ enum: PaidVia })
  @IsEnum(PaidVia)
  paidVia: PaidVia;

  @ApiPropertyOptional({ example: 500000 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  amount?: number;
}

export class AssignCourseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  userId: string;
}
