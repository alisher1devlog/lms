import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLastActivityDto {
  @ApiPropertyOptional({
    description: 'Kurs ID',
    example: 'course-uuid-123',
  })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Guruh ID',
    example: 'group-uuid-123',
  })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({
    description: 'Dars ID',
    example: 'lesson-uuid-123',
  })
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiPropertyOptional({
    description: 'URL',
    example: '/courses/123/lessons/456',
  })
  @IsOptional()
  @IsString()
  url?: string;
}
