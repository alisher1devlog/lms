import {
  Controller,
  Get,
  Post,
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
import { LessonFilesService } from './lesson-files.service';
import { CreateLessonFileDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Lesson Files')
@Controller('api/lesson-files')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class LessonFilesController {
  constructor(private lessonFilesService: LessonFilesService) {}

  @Get('lesson/:lesson_id')
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Dars fayllari - ADMIN, MENTOR' })
  @ApiResponse({ status: 200, description: "Fayllar ro'yxati" })
  async getFilesByLesson(
    @Param('lesson_id') lessonId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonFilesService.getFilesByLesson(lessonId, userId, userRole);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: "Darsga fayl qo'shish - ADMIN, MENTOR" })
  @ApiResponse({ status: 201, description: "Fayl qo'shildi" })
  async create(
    @Body() dto: CreateLessonFileDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonFilesService.create(dto, file, userId, userRole);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: "Faylni o'chirish - ADMIN, MENTOR" })
  @ApiResponse({ status: 200, description: "Fayl o'chirildi" })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.lessonFilesService.remove(id, userId, userRole);
  }
}
