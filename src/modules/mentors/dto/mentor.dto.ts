import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMentorProfileDto {
  @ApiPropertyOptional({ example: 'Senior dasturchi' })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  @IsString()
  @IsOptional()
  job?: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsNotEmpty()
  experience: number;

  @ApiPropertyOptional({ example: '@username' })
  @IsString()
  @IsOptional()
  telegram?: string;

  @ApiPropertyOptional({ example: '@username' })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/username' })
  @IsString()
  @IsOptional()
  linkedin?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/username' })
  @IsString()
  @IsOptional()
  facebook?: string;

  @ApiPropertyOptional({ example: 'https://github.com/username' })
  @IsString()
  @IsOptional()
  github?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsString()
  @IsOptional()
  website?: string;
}

export class UpdateMentorProfileDto {
  @ApiPropertyOptional({ example: 'Senior dasturchi' })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  @IsString()
  @IsOptional()
  job?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @IsOptional()
  experience?: number;

  @ApiPropertyOptional({ example: '@username' })
  @IsString()
  @IsOptional()
  telegram?: string;

  @ApiPropertyOptional({ example: '@username' })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/username' })
  @IsString()
  @IsOptional()
  linkedin?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/username' })
  @IsString()
  @IsOptional()
  facebook?: string;

  @ApiPropertyOptional({ example: 'https://github.com/username' })
  @IsString()
  @IsOptional()
  github?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsString()
  @IsOptional()
  website?: string;
}
