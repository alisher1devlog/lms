import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Telefon raqam',
    example: '+998902400025',
  })
  @IsNotEmpty({ message: 'Telefon raqam kiritilishi shart' })
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, {
    message: "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak",
  })
  phone: string;

  @ApiProperty({
    description: 'OTP kod',
    example: '000000',
  })
  @IsNotEmpty({ message: 'OTP kod kiritilishi shart' })
  @IsString()
  otp: string;

  @ApiProperty({
    description: 'Yangi parol (kamida 6 ta belgi)',
    example: 'newpassword123',
  })
  @IsNotEmpty({ message: 'Yangi parol kiritilishi shart' })
  @IsString()
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  newPassword: string;
}
