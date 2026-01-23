import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, Matches } from 'class-validator';

export enum VerificationType {
  REGISTER = 'register',
  RESET_PASSWORD = 'reset_password',
  EDIT_PHONE = 'edit_phone',
}

export class SendVerificationDto {
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
}
