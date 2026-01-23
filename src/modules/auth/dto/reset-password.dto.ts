import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  Length,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
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
    description: 'Yangi parol (kamida 6 ta belgi)',
    example: 'newpassword123',
  })
  @IsNotEmpty({ message: 'Yangi parol kiritilishi shart' })
  @IsString()
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  newPassword: string;
}
