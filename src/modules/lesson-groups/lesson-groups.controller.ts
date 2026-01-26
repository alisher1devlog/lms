import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
} from '@nestjs/swagger';
import { LessonGroupsService } from './lesson-groups.service';
import {
  CreateLessonGroupDto,
  UpdateLessonGroupDto,
  QueryLessonGroupDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Lesson Groups')
@Controller('api/lesson-group')
export class LessonGroupsController {
  constructor(private lessonGroupsService: LessonGroupsService) {}

  // ===================== PUBLIC ENDPOINTS =====================

  @Get('all/:course_id')
  @ApiOperation({ summary: "Kurs bo'limlari (hammaga ochiq)" })
  @ApiResponse({ status: 200, description: "Bo'limlar ro'yxati" })
  async getAllByCourse(
    @Param('course_id') courseId: string,
    @Query() query: QueryLessonGroupDto,
  ) {
    return this.lessonGroupsService.getAllByCourse(courseId, query);
  }

  @Get('detail/:id')
  @ApiOperation({ summary: "Bo'lim tafsilotlari" })
  @ApiResponse({ status: 200, description: "Bo'lim ma'lumotlari" })
  async getDetail(@Param('id') id: string) {
    return this.lessonGroupsService.getDetail(id);
  }

  // ===================== STUDENT ENDPOINTS =====================

  @Get('mine-all/:course_id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Student uchun kurs bo'limlari - STUDENT" })
  @ApiResponse({ status: 200, description: "Bo'limlar ro'yxati" })
  async getMineAllByCourse(
    @Param('course_id') courseId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.lessonGroupsService.getMineAllByCourse(courseId, userId);
  }

  // ===================== MENTOR & ADMIN ENDPOINTS =====================

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Yangi bo'lim yaratish - MENTOR, ADMIN" })
  @ApiResponse({ status: 201, description: "Bo'lim yaratildi" })
  async create(
    @Body() dto: CreateLessonGroupDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonGroupsService.create(dto, userId, userRole);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Bo'limni yangilash - MENTOR, ADMIN" })
  @ApiResponse({ status: 200, description: "Bo'lim yangilandi" })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonGroupDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonGroupsService.update(id, dto, userId, userRole);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Bo'limni o'chirish - MENTOR, ADMIN" })
  @ApiResponse({ status: 200, description: "Bo'lim o'chirildi" })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonGroupsService.remove(id, userId, userRole);
  }
}
