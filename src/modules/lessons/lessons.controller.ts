import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import {
  CreateLessonDto,
  UpdateLessonDto,
  CreateLessonFileDto,
  LessonViewDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Lessons')
@Controller('api')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get('groups/:groupId/lessons')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Bo'lim darslari" })
  @ApiResponse({ status: 200, description: "Darslar ro'yxati" })
  async findAllByGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.lessonsService.findAllByGroup(groupId, userId);
  }

  @Get('lessons/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Dars ma'lumotlari" })
  @ApiResponse({ status: 200, description: "Dars ma'lumotlari" })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: number) {
    return this.lessonsService.findOne(id, userId);
  }

  @Post('groups/:groupId/lessons')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi dars yaratish' })
  @ApiResponse({ status: 201, description: 'Dars yaratildi' })
  async create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateLessonDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonsService.create(groupId, dto, userId, userRole);
  }

  @Put('lessons/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Darsni yangilash' })
  @ApiResponse({ status: 200, description: 'Dars yangilandi' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonsService.update(id, dto, userId, userRole);
  }

  @Delete('lessons/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Darsni o'chirish" })
  @ApiResponse({ status: 200, description: "Dars o'chirildi" })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonsService.remove(id, userId, userRole);
  }

  @Post('lessons/:id/view')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Darsni ko'rilgan deb belgilash" })
  @ApiResponse({ status: 200, description: 'Dars belgilandi' })
  async markAsViewed(
    @Param('id') id: string,
    @Body() dto: LessonViewDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.lessonsService.markAsViewed(id, userId, dto);
  }

  // Lesson Files
  @Get('lessons/:lessonId/files')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dars fayllari' })
  @ApiResponse({ status: 200, description: "Fayllar ro'yxati" })
  async getFiles(
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: number,
  ) {
    return this.lessonsService.getFiles(lessonId, userId);
  }

  @Post('lessons/:lessonId/files')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Darsga fayl qo'shish" })
  @ApiResponse({ status: 201, description: "Fayl qo'shildi" })
  async addFile(
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateLessonFileDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonsService.addFile(lessonId, dto, userId, userRole);
  }

  @Delete('files/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Faylni o'chirish" })
  @ApiResponse({ status: 200, description: "Fayl o'chirildi" })
  async removeFile(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonsService.removeFile(id, userId, userRole);
  }
}
