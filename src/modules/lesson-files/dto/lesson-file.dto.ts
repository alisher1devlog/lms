import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonFileDto {
  @ApiProperty({ example: 'lesson-uuid-here', description: 'Dars ID' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Fayl',
  })
  @IsOptional()
  file?: any;

  @ApiPropertyOptional({ example: 'https://example.com/file.pdf' })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiPropertyOptional({ example: "Qo'shimcha material" })
  @IsString()
  @IsOptional()
  note?: string;
}
