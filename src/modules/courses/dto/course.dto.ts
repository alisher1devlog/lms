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
  @ApiProperty({ example: 'React JS Kursi' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "React JS asoslari va ilg'or mavzular" })
  @IsString()
  @IsNotEmpty()
  about: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 'https://example.com/banner.jpg' })
  @IsString()
  @IsNotEmpty()
  banner: string;

  @ApiPropertyOptional({ example: 'https://example.com/intro.mp4' })
  @IsString()
  @IsOptional()
  introVideo?: string;

  @ApiProperty({ enum: CourseLevel })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  categoryId: string;
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

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}

export class QueryCourseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  categoryId: string;

  @ApiPropertyOptional({ enum: CourseLevel })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @ApiPropertyOptional()
  @IsOptional()
  published?: string;

  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
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
