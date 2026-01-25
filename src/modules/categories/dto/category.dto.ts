import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Dasturlash' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Web Dasturlash' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class QueryCategoryDto {
  @ApiPropertyOptional({ default: 0, description: 'Offset for pagination' })
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({ default: 10, description: 'Limit for pagination' })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  search?: string;
}
