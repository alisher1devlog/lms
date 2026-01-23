import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: "To'liq ism",
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Profil rasmi',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Email',
    example: 'user@example.com',
  })
  @ValidateIf(
    (o) => o.email !== '' && o.email !== undefined && o.email !== null,
  )
  @IsEmail({}, { message: "Noto'g'ri email format" })
  email?: string;
}
