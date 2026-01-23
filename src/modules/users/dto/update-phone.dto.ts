import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdatePhoneDto {
  @ApiProperty({
    description: 'Yangi telefon raqam',
    example: '+998902400025',
  })
  @IsNotEmpty({ message: 'Yangi telefon raqam kiritilishi shart' })
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, {
    message: "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak",
  })
  newPhone: string;

  @ApiProperty({
    description: 'OTP kod',
    example: '000000',
  })
  @IsNotEmpty({ message: 'OTP kod kiritilishi shart' })
  @IsString()
  otp: string;
}
