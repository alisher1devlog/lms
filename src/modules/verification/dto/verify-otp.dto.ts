import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, Matches, Length } from 'class-validator';
import { VerificationType } from './send-verification.dto';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Verification type',
    enum: VerificationType,
    example: VerificationType.REGISTER,
  })
  @IsNotEmpty({ message: 'Type kiritilishi shart' })
  @IsEnum(VerificationType, {
    message:
      "Type qiymati register, reset_password yoki edit_phone bo'lishi kerak",
  })
  type: VerificationType;

  @ApiProperty({
    description: 'Phone number',
    example: '+998902400025',
  })
  @IsNotEmpty({ message: 'Telefon raqam kiritilishi shart' })
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, {
    message: "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak",
  })
  phone: string;

  @ApiProperty({
    description: 'OTP code',
    example: '000000',
  })
  @IsNotEmpty({ message: 'OTP kod kiritilishi shart' })
  @IsString()
  @Length(6, 6, { message: "OTP kod 6 ta raqamdan iborat bo'lishi kerak" })
  otp: string;
}
