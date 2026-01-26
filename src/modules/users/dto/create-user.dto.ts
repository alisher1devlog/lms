import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  Matches,
  IsEmail,
} from 'class-validator';

export class CreateAdminDto {
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
    description: "To'liq ism",
    example: 'Admin User',
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

  @ApiPropertyOptional({
    description: 'Email manzil',
    example: 'admin@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: "Noto'g'ri email format" })
  email?: string;
}

export class CreateMentorDto {
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
    description: "To'liq ism",
    example: 'Mentor User',
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

  @ApiPropertyOptional({
    description: 'Email manzil',
    example: 'mentor@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: "Noto'g'ri email format" })
  email?: string;

  @ApiPropertyOptional({
    description: 'Mentor haqida',
    example: "tajribangiz va ko'nikmalaringiz haqida qisqacha",
  })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({
    description: 'Ish joyi',
    example: 'Software Engineer at Google',
  })
  @IsOptional()
  @IsString()
  job?: string;

  @ApiPropertyOptional({
    description: 'Tajriba (yillar)',
    example: '5+ yil',
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional({
    description: 'Telegram username',
    example: '@mentor_user',
  })
  @IsOptional()
  @IsString()
  telegram?: string;

  @ApiPropertyOptional({
    description: 'Instagram username',
    example: '@mentor_instagram',
  })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/mentor',
  })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional({
    description: 'Facebook profile URL',
    example: 'https://facebook.com/mentor',
  })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({
    description: 'GitHub username',
    example: 'mentor-github',
  })
  @IsOptional()
  @IsString()
  github?: string;

  @ApiPropertyOptional({
    description: 'Personal website URL',
    example: 'https://mentor-website.com',
  })
  @IsOptional()
  @IsString()
  website?: string;
}

export class CreateAssistantDto {
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
    description: "To'liq ism",
    example: 'Adminov Adminjon',
  })
  @IsNotEmpty({ message: "To'liq ism kiritilishi shart" })
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Parol (kamida 6 ta belgi)',
    example: 'string',
  })
  @IsNotEmpty({ message: 'Parol kiritilishi shart' })
  @IsString()
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  password: string;

  @ApiProperty({
    description: 'Kurs ID (assistant qaysi kursga biriktiriladi)',
    example: 'string',
  })
  @IsNotEmpty({ message: 'Kurs ID kiritilishi shart' })
  @IsString()
  courseId: string;
}

export class UpdateMentorDto {
  @ApiPropertyOptional({
    description: "To'liq ism",
    example: 'Updated Mentor Name',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Email manzil',
    example: 'updated@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: "Noto'g'ri email format" })
  email?: string;

  @ApiPropertyOptional({
    description: 'Rasm URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Mentor haqida',
    example: 'Updated bio',
  })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({
    description: 'Ish joyi',
    example: 'Updated job',
  })
  @IsOptional()
  @IsString()
  job?: string;

  @ApiPropertyOptional({
    description: 'Tajriba',
    example: '10+ yil',
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional({
    description: 'Telegram username',
    example: '@updated_telegram',
  })
  @IsOptional()
  @IsString()
  telegram?: string;

  @ApiPropertyOptional({
    description: 'Instagram username',
    example: '@updated_instagram',
  })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/mentor',
  })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional({
    description: 'Facebook profile URL',
    example: 'https://facebook.com/mentor',
  })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({
    description: 'GitHub username',
    example: 'mentor-github',
  })
  @IsOptional()
  @IsString()
  github?: string;

  @ApiPropertyOptional({
    description: 'Personal website URL',
    example: 'https://mentor-website.com',
  })
  @IsOptional()
  @IsString()
  website?: string;
}
