import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PurchasedCoursesService } from './purchased-courses.service';
import {
  PurchaseCourseDto,
  CreatePurchasedCourseDto,
  QueryPurchasedCourseDto,
  QueryCourseStudentsDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Purchased Courses')
@Controller('api/purchased-courses')
export class PurchasedCoursesController {
  constructor(private purchasedCoursesService: PurchasedCoursesService) {}

  @Get('mine')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mening sotib olgan kurslarim, STUDENT' })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiQuery({ name: 'limit', required: false, example: 8 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category_id', required: false })
  @ApiQuery({
    name: 'level',
    required: false,
    enum: [
      'BEGINNER',
      'PRE_INTERMEDIATE',
      'INTERMEDIATE',
      'UPPER_INTERMEDIATE',
      'ADVANCED',
    ],
  })
  @ApiResponse({ status: 200, description: "Sotib olingan kurslar ro'yxati" })
  async getMyPurchasedCourses(
    @CurrentUser('id') userId: string,
    @Query() query: QueryPurchasedCourseDto,
  ) {
    return this.purchasedCoursesService.getMyPurchasedCourses(userId, query);
  }

  @Get('mine/:course_id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Ma'lum bir kursni sotib olganlikni tekshirish, STUDENT",
  })
  @ApiResponse({ status: 200, description: "Kurs ma'lumotlari" })
  async getMyPurchasedCourse(
    @CurrentUser('id') userId: string,
    @Param('course_id') courseId: string,
  ) {
    return this.purchasedCoursesService.getMyPurchasedCourse(userId, courseId);
  }

  @Post('purchase')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kurs sotib olish, STUDENT' })
  @ApiResponse({ status: 201, description: 'Kurs sotib olindi' })
  async purchaseCourse(
    @Body() dto: PurchaseCourseDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.purchasedCoursesService.purchaseCourse(dto, userId);
  }

  @Get('course/:id/students')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Kursni sotib olgan studentlar ro'yxati, MENTOR, ADMIN",
  })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiQuery({ name: 'limit', required: false, example: 8 })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: "Studentlar ro'yxati" })
  async getCourseStudents(
    @Param('id') courseId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query() query: QueryCourseStudentsDto,
  ) {
    return this.purchasedCoursesService.getCourseStudents(
      courseId,
      userId,
      userRole,
      query,
    );
  }

  @Post('create')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin tomonidan studentga kurs biriktirish, ADMIN',
  })
  @ApiResponse({ status: 201, description: 'Kurs biriktirildi' })
  async createPurchasedCourse(@Body() dto: CreatePurchasedCourseDto) {
    return this.purchasedCoursesService.createPurchasedCourse(dto);
  }
}
