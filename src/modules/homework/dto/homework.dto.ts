import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HomeworkSubStatus } from '@prisma/client';

export class CreateHomeworkDto {
  @ApiProperty({ description: 'Lesson ID' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ example: 'React component yarating' })
  @IsString()
  @IsNotEmpty()
  task: string;

  @ApiPropertyOptional({ example: 'https://example.com/task.pdf' })
  @IsString()
  @IsOptional()
  file?: string;
}

export class UpdateHomeworkDto {
  @ApiPropertyOptional({ example: 'React component yarating' })
  @IsString()
  @IsOptional()
  task?: string;

  @ApiPropertyOptional({ example: 'https://example.com/task.pdf' })
  @IsString()
  @IsOptional()
  file?: string;
}

export class SubmitHomeworkDto {
  @ApiPropertyOptional({ example: 'Mening yechimim' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ example: 'https://example.com/submission.zip' })
  @IsString()
  @IsNotEmpty()
  file: string;
}

export class CheckSubmissionDto {
  @ApiProperty({ description: 'Submission ID' })
  @IsString()
  @IsNotEmpty()
  submissionId: string;

  @ApiProperty({ enum: HomeworkSubStatus })
  @IsEnum(HomeworkSubStatus)
  status: HomeworkSubStatus;

  @ApiPropertyOptional({ example: 'Kod yaxshi yozilgan' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class QuerySubmissionDto {
  @ApiPropertyOptional({ enum: HomeworkSubStatus })
  @IsEnum(HomeworkSubStatus)
  @IsOptional()
  status?: HomeworkSubStatus;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  limit?: number;
}
