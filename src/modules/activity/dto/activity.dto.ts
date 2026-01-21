import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateActivityDto {
  @ApiPropertyOptional({ example: 'uuid-course-id' })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  groupId: string;

  @ApiPropertyOptional({ example: 'uuid-lesson-id' })
  @IsString()
  @IsOptional()
  lessonId?: string;

  @ApiPropertyOptional({ example: '/courses/uuid/lessons/uuid' })
  @IsString()
  @IsOptional()
  url?: string;
}
