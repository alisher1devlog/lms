import { Module } from '@nestjs/common';
import { PurchasedCoursesController } from './purchased-courses.controller';
import { PurchasedCoursesService } from './purchased-courses.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PurchasedCoursesController],
  providers: [PurchasedCoursesService],
  exports: [PurchasedCoursesService],
})
export class PurchasedCoursesModule {}
