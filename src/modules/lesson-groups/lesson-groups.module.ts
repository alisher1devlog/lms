import { Module } from '@nestjs/common';
import { LessonGroupsController } from './lesson-groups.controller';
import { LessonGroupsService } from './lesson-groups.service';

@Module({
  controllers: [LessonGroupsController],
  providers: [LessonGroupsService],
  exports: [LessonGroupsService],
})
export class LessonGroupsModule {}
