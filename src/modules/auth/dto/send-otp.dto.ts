import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { OTPType } from '@prisma/client';

export class SendOtpDto {
  @ApiProperty({
    description: 'Telefon raqam (998XXXXXXXXX formatida)',
    example: '998901234567',
  })
  @IsNotEmpty({ message: 'Telefon raqam kiritilishi shart' })
  @IsString()
  @Matches(/^998[0-9]{9}$/, {
    message:
      "Telefon raqam noto'g'ri formatda. 998XXXXXXXXX formatida kiriting",
  })
  phone: string;

  @ApiProperty({
    description: 'OTP turi',
    enum: OTPType,
    default: OTPType.REGISTRATION,
    required: false,
  })
  @IsOptional()
  @IsEnum(OTPType)
  type?: OTPType;
}
