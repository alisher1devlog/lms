import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Joriy parol',
    example: 'currentpassword123',
  })
  @IsNotEmpty({ message: 'Joriy parol kiritilishi shart' })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'Yangi parol (kamida 6 ta belgi)',
    example: 'newpassword123',
  })
  @IsNotEmpty({ message: 'Yangi parol kiritilishi shart' })
  @IsString()
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  newPassword: string;

  @ApiProperty({
    description: 'Yangi parolni tasdiqlash',
    example: 'newpassword123',
  })
  @IsNotEmpty({ message: 'Parol tasdiqlash kiritilishi shart' })
  @IsString()
  confirmPassword: string;
}
