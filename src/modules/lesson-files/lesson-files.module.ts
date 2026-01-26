import { Module } from '@nestjs/common';
import { LessonFilesController } from './lesson-files.controller';
import { LessonFilesService } from './lesson-files.service';
import { UploadModule } from '../../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [LessonFilesController],
  providers: [LessonFilesService],
  exports: [LessonFilesService],
})
export class LessonFilesModule {}
