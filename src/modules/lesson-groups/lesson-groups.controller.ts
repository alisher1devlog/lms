import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
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
import { CreateLessonGroupDto, UpdateLessonGroupDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Lesson Groups')
@Controller('api')
export class LessonGroupsController {
  constructor(private lessonGroupsService: LessonGroupsService) {}

  @Get('courses/:courseId/groups')
  @ApiOperation({ summary: "Kurs bo'limlari" })
  @ApiResponse({ status: 200, description: "Bo'limlar ro'yxati" })
  async findAllByCourse(@Param('courseId') courseId: string) {
    return this.lessonGroupsService.findAllByCourse(courseId);
  }

  @Post('courses/:courseId/groups')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Yangi bo'lim yaratish" })
  @ApiResponse({ status: 201, description: "Bo'lim yaratildi" })
  async create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateLessonGroupDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonGroupsService.create(courseId, dto, userId, userRole);
  }

  @Put('groups/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Bo'limni yangilash" })
  @ApiResponse({ status: 200, description: "Bo'lim yangilandi" })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonGroupDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonGroupsService.update(id, dto, userId, userRole);
  }

  @Delete('groups/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Bo'limni o'chirish" })
  @ApiResponse({ status: 200, description: "Bo'lim o'chirildi" })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonGroupsService.remove(id, userId, userRole);
  }
}
