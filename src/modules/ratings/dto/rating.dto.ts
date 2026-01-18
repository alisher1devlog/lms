import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rate: number;

  @ApiProperty({ example: "Juda zo'r kurs!" })
  @IsString()
  @IsNotEmpty()
  comment: string;
}

export class UpdateRatingDto {
  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rate?: number;

  @ApiPropertyOptional({ example: 'Yaxshi kurs' })
  @IsString()
  @IsOptional()
  comment?: string;
}
