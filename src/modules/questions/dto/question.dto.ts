import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ example: 'React hooks haqida savol' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({ example: 'https://example.com/screenshot.png' })
  @IsString()
  @IsOptional()
  file?: string;
}

export class CreateAnswerDto {
  @ApiProperty({ example: 'React hooks bu...' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({ example: 'https://example.com/answer.png' })
  @IsString()
  @IsOptional()
  file?: string;
}

export class UpdateAnswerDto {
  @ApiPropertyOptional({ example: 'React hooks bu...' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ example: 'https://example.com/answer.png' })
  @IsString()
  @IsOptional()
  file?: string;
}
