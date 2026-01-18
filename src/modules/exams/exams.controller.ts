import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
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
import { ExamsService } from './exams.service';
import { CreateExamDto, SubmitExamDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Exams')
@Controller('api')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ExamsController {
  constructor(private examsService: ExamsService) {}

  @Post('groups/:groupId/exams')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Imtihon savoli yaratish' })
  @ApiResponse({ status: 201, description: 'Imtihon yaratildi' })
  async createExam(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateExamDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.examsService.createExam(groupId, dto, userId, userRole);
  }

  @Get('groups/:groupId/exams')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Bo'lim imtihon savollari" })
  @ApiResponse({ status: 200, description: "Savollar ro'yxati" })
  async getExamsByGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.examsService.getExamsByGroup(groupId, userId);
  }

  @Post('exams/submit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Imtihon topshirish' })
  @ApiResponse({ status: 200, description: 'Imtihon natijasi' })
  async submitExam(
    @Body() dto: SubmitExamDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.examsService.submitExam(dto, userId);
  }

  @Get('exams/results')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Imtihon natijalari' })
  @ApiResponse({ status: 200, description: "Natijalar ro'yxati" })
  async getResults(
    @Query('courseId') courseId?: string,
    @Query('groupId') groupId?: number,
    @CurrentUser('id') userId?: number,
  ) {
    return this.examsService.getResults(userId, courseId, groupId);
  }

  @Delete('exams/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: "Imtihonni o'chirish" })
  @ApiResponse({ status: 200, description: "Imtihon o'chirildi" })
  async deleteExam(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.examsService.deleteExam(id, userId, userRole);
  }
}
