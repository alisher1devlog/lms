import {
  Controller,
  Get,
  Post,
  Patch,
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
import { ExamsService } from './exams.service';
import { CreateExamDto, CreateManyExamsDto, UpdateExamDto, SubmitExamDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Exams')
@Controller('api/exams')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ExamsController {
  constructor(private examsService: ExamsService) {}

  // STUDENT: Bo'lim imtihon savollari (javobsiz)
  @Get('lesson-group/:lessonGroupId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Bo'lim imtihon savollari - STUDENT" })
  @ApiResponse({ status: 200, description: "Savollar ro'yxati" })
  async getExamsByLessonGroup(
    @Param('lessonGroupId') lessonGroupId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.examsService.getExamsByGroup(lessonGroupId, userId);
  }

  // STUDENT: Imtihon topshirish
  @Post('pass')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Imtihon topshirish - STUDENT' })
  @ApiResponse({ status: 200, description: 'Imtihon natijasi' })
  async submitExam(
    @Body() dto: SubmitExamDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.examsService.submitExam(dto, userId);
  }

  // ADMIN, MENTOR: Bo'lim imtihon savollari (javobli)
  @Get('lesson-group/details/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  @ApiOperation({ summary: "Bo'lim imtihon savollari (javobli) - MENTOR, ADMIN" })
  @ApiResponse({ status: 200, description: "Savollar ro'yxati" })
  async getLessonGroupExamsWithAnswers(
    @Param('id') lessonGroupId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.examsService.getExamsByGroupWithAnswers(lessonGroupId, userId, userRole);
  }

  // ADMIN, MENTOR: Bitta imtihon detali
  @Get('detail/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Imtihon detali - ADMIN, MENTOR' })
  @ApiResponse({ status: 200, description: 'Imtihon ma\'lumotlari' })
  async getExamDetail(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.examsService.getExamById(id, userId, userRole);
  }

  // ADMIN, MENTOR: Imtihon yaratish
  @Post('create')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Imtihon savoli yaratish - ADMIN, MENTOR' })
  @ApiResponse({ status: 201, description: 'Imtihon yaratildi' })
  async createExam(
    @Body() dto: CreateExamDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.examsService.createExam(dto, userId, userRole);
  }

  // ADMIN, MENTOR: Ko'plab imtihon yaratish
  @Post('create/many')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: "Ko'plab imtihon savollari yaratish - ADMIN, MENTOR" })
  @ApiResponse({ status: 201, description: 'Imtihonlar yaratildi' })
  async createManyExams(
    @Body() dto: CreateManyExamsDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.examsService.createManyExams(dto, userId, userRole);
  }

  // ADMIN, MENTOR: Imtihonni yangilash
  @Patch('update/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Imtihonni yangilash - ADMIN, MENTOR' })
  @ApiResponse({ status: 200, description: 'Imtihon yangilandi' })
  async updateExam(
    @Param('id') id: string,
    @Body() dto: UpdateExamDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.examsService.updateExam(id, dto, userId, userRole);
  }

  // ADMIN, MENTOR: Imtihonni o'chirish
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: "Imtihonni o'chirish - ADMIN, MENTOR" })
  @ApiResponse({ status: 200, description: "Imtihon o'chirildi" })
  async deleteExam(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.examsService.deleteExam(id, userId, userRole);
  }

  // ADMIN: Barcha imtihon natijalari
  @Get('results')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Barcha imtihon natijalari - ADMIN' })
  @ApiResponse({ status: 200, description: "Natijalar ro'yxati" })
  async getAllResults() {
    return this.examsService.getAllResults();
  }

  // MENTOR: Bo'lim bo'yicha imtihon natijalari
  @Get('results/lesson-group/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: "Bo'lim bo'yicha imtihon natijalari - MENTOR" })
  @ApiResponse({ status: 200, description: "Natijalar ro'yxati" })
  async getResultsByLessonGroup(
    @Param('id') lessonGroupId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.examsService.getResultsByLessonGroup(lessonGroupId, userId);
  }
}
