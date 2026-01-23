import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
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
    description: "To'liq ism",
    example: 'John Doe',
  })
  @IsNotEmpty({ message: "To'liq ism kiritilishi shart" })
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Parol (kamida 6 ta belgi)',
    example: 'password123',
  })
  @IsNotEmpty({ message: 'Parol kiritilishi shart' })
  @IsString()
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  password: string;
}
