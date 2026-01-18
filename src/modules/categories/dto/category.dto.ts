import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
