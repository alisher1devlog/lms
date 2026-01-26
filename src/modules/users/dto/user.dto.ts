import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'newpassword123' })
  @IsString()
  @IsOptional()
  password?: string;
}

export class QueryUserDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ default: 0, description: 'Offset for pagination' })
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Search by name or phone' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class QueryMentorDto {
  @ApiPropertyOptional({
    default: 0,
    example: 0,
    description: 'Offset for pagination',
  })
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({
    default: 8,
    example: 8,
    description: 'Limit for pagination',
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Search by name' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class UpdateUserRoleDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
}
