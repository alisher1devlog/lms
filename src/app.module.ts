import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { SmsModule } from './sms/sms.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonGroupsModule } from './modules/lesson-groups/lesson-groups.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { LessonFilesModule } from './modules/lesson-files/lesson-files.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { ExamsModule } from './modules/exams/exams.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { VerificationModule } from './modules/verification/verification.module';
import { PurchasedCoursesModule } from './modules/purchased-courses/purchased-courses.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ContactModule } from './modules/contact/contact.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RedisModule,
    SmsModule,
    UploadModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    CoursesModule,
    LessonGroupsModule,
    LessonsModule,
    LessonFilesModule,
    HomeworkModule,
    ExamsModule,
    QuestionsModule,
    RatingsModule,
    VerificationModule,
    PurchasedCoursesModule,
    PaymentModule,
    ContactModule,
    FilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
