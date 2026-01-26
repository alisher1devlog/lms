import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaidVia } from '@prisma/client';

export class CheckoutDto {
  @ApiProperty({ description: 'Course ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ enum: PaidVia, description: "To'lov turi" })
  @IsEnum(PaidVia)
  paidVia: PaidVia;

  @ApiPropertyOptional({ description: "To'lov summasi" })
  @IsNumber()
  @IsOptional()
  amount?: number;
}
