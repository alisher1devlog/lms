import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  // Public file - no auth required
  @Get('public/:name')
  @ApiOperation({ summary: 'Public fayl olish' })
  @ApiResponse({ status: 200, description: 'Fayl URL' })
  async getPublicFile(@Param('name') name: string) {
    return this.filesService.getPublicFile(name);
  }

  // Private lesson file - requires auth
  @Get('private/lesson-file/:lessonId/:name')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dars faylini olish - STUDENT' })
  @ApiResponse({ status: 200, description: 'Fayl URL' })
  async getLessonFile(
    @Param('lessonId') lessonId: string,
    @Param('name') name: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.filesService.getLessonFile(lessonId, name, userId);
  }

  // Private video file - requires auth
  @Get('private/video/:lessonId/:hlsf')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dars videosini olish - STUDENT' })
  @ApiResponse({ status: 200, description: 'Video URL' })
  async getVideoFile(
    @Param('lessonId') lessonId: string,
    @Param('hlsf') hlsf: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.filesService.getVideoFile(lessonId, hlsf, userId);
  }
}
