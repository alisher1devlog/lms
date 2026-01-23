import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AssignAssistantDto {
  @ApiProperty({
    description: 'Kurs ID',
    example: 'course-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: 'Assistant ID',
    example: 'user-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  assistantId: string;
}

export class UnassignAssistantDto {
  @ApiProperty({
    description: 'Kurs ID',
    example: 'course-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: 'Assistant ID',
    example: 'user-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  assistantId: string;
}

export class UpdateCourseMentorDto {
  @ApiProperty({
    description: 'Kurs ID',
    example: 'course-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: 'Yangi Mentor ID',
    example: 'mentor-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  mentorId: string;
}
