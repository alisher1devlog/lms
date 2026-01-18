import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MentorsModule } from './modules/mentors/mentors.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonGroupsModule } from './modules/lesson-groups/lesson-groups.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { ExamsModule } from './modules/exams/exams.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { ActivityModule } from './modules/activity/activity.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MentorsModule,
    CategoriesModule,
    CoursesModule,
    LessonGroupsModule,
    LessonsModule,
    HomeworkModule,
    ExamsModule,
    QuestionsModule,
    RatingsModule,
    ActivityModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
