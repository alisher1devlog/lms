import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ example: 'React Components' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "Bu darsda React componentlari haqida o'rganamiz" })
  @IsString()
  @IsNotEmpty()
  about: string;

  @ApiProperty({ example: 'group-uuid-here', description: "Bo'lim ID" })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Video fayl',
  })
  @IsOptional()
  video?: any;

  @ApiPropertyOptional({ example: 'https://example.com/video.mp4' })
  @IsString()
  @IsOptional()
  videoUrl?: string;
}

export class UpdateLessonDto {
  @ApiPropertyOptional({ example: 'React Components - Part 1' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: "Bu darsda React componentlari haqida o'rganamiz",
  })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Video fayl',
  })
  @IsOptional()
  video?: any;

  @ApiPropertyOptional({ example: 'https://example.com/video.mp4' })
  @IsString()
  @IsOptional()
  videoUrl?: string;
}

export class LessonViewDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  view: boolean;
}
