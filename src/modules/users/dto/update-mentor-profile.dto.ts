import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateMentorProfileDto {
  @ApiProperty({
    description: 'Haqida',
    example: 'Mening haqimda...',
    required: false,
  })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiProperty({
    description: 'Ish',
    example: 'Senior Developer',
    required: false,
  })
  @IsOptional()
  @IsString()
  job?: string;

  @ApiProperty({
    description: "Ta'lim tajribasi (yillar)",
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  experience?: number;

  @ApiProperty({
    description: 'Telegram',
    example: '@username',
    required: false,
  })
  @IsOptional()
  @IsString()
  telegram?: string;
}
