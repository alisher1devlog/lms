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

  @ApiProperty({ example: 'https://example.com/video.mp4' })
  @IsString()
  @IsNotEmpty()
  video: string;
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

  @ApiPropertyOptional({ example: 'https://example.com/video.mp4' })
  @IsString()
  @IsOptional()
  video?: string;
}

export class CreateLessonFileDto {
  @ApiProperty({ example: 'https://example.com/file.pdf' })
  @IsString()
  @IsNotEmpty()
  file: string;

  @ApiPropertyOptional({ example: "Qo'shimcha material" })
  @IsString()
  @IsOptional()
  note?: string;
}

export class LessonViewDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  view: boolean;
}
