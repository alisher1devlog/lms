import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  Length,
  MinLength,
  IsEmail,
} from 'class-validator';

export class RegisterWithOtpDto {
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
    description: 'Tasdiqlash kodi',
    example: '123456',
  })
  @IsNotEmpty({ message: 'Tasdiqlash kodi kiritilishi shart' })
  @IsString()
  @Length(6, 6, {
    message: "Tasdiqlash kodi 6 ta raqamdan iborat bo'lishi kerak",
  })
  code: string;

  @ApiProperty({
    description: 'Email manzil',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email kiritilishi shart' })
  @IsEmail({}, { message: "Noto'g'ri email format" })
  email: string;

  @ApiProperty({
    description: "To'liq ism",
    example: 'Alisher Karimov',
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
