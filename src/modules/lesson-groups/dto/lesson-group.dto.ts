import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonGroupDto {
  @ApiProperty({ example: "1-Bo'lim: Kirish" })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateLessonGroupDto {
  @ApiProperty({ example: "1-Bo'lim: Asoslar" })
  @IsString()
  @IsNotEmpty()
  name: string;
}
