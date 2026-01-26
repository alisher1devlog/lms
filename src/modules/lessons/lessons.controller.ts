import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto, LessonViewDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Lessons')
@Controller('api/lessons')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  // ===================== STUDENT ENDPOINTS =====================

  @Get('single/:lessonId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Darsni ko'rish - STUDENT" })
  @ApiResponse({ status: 200, description: "Dars ma'lumotlari" })
  async getSingleLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.lessonsService.getSingleLesson(lessonId, userId);
  }

  @Put('view/:lessonId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Darsni ko'rilgan deb belgilash - STUDENT" })
  @ApiResponse({ status: 200, description: 'Dars belgilandi' })
  async markAsViewed(
    @Param('lessonId') lessonId: string,
    @Body() dto: LessonViewDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.lessonsService.markAsViewed(lessonId, dto, userId);
  }

  // ===================== ADMIN & MENTOR ENDPOINTS =====================

  @Get('detail/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Dars tafsilotlari - ADMIN, MENTOR' })
  @ApiResponse({ status: 200, description: "Dars ma'lumotlari" })
  async getLessonDetail(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonsService.getLessonDetail(id, userId, userRole);
  }

  @Post('create')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @UseInterceptors(FileInterceptor('video'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Yangi dars yaratish - ADMIN, MENTOR' })
  @ApiResponse({ status: 201, description: 'Dars yaratildi' })
  async create(
    @Body() dto: CreateLessonDto,
    @UploadedFile() video: Express.Multer.File,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonsService.create(dto, video, userId, userRole);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @UseInterceptors(FileInterceptor('video'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Darsni yangilash - ADMIN, MENTOR' })
  @ApiResponse({ status: 200, description: 'Dars yangilandi' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
    @UploadedFile() video: Express.Multer.File,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonsService.update(id, dto, video, userId, userRole);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: "Darsni o'chirish - ADMIN, MENTOR" })
  @ApiResponse({ status: 200, description: "Dars o'chirildi" })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonsService.remove(id, userId, userRole);
  }
}
