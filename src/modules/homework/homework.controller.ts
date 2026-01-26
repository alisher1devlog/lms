import {
  Controller,
  Get,
  Post,
  Patch,
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
  ApiQuery,
} from '@nestjs/swagger';
import { HomeworkService } from './homework.service';
import {
  CreateHomeworkDto,
  UpdateHomeworkDto,
  SubmitHomeworkDto,
  CheckSubmissionDto,
  QuerySubmissionDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Homework')
@Controller('api/homework')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class HomeworkController {
  constructor(private homeworkService: HomeworkService) {}

  // MENTOR, ADMIN, ASSISTANT: Kurs vazifalarini olish
  @Get('course/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN, UserRole.ASSISTANT)
  @ApiOperation({
    summary: 'Kurs vazifalarini olish - MENTOR, ADMIN, ASSISTANT',
  })
  @ApiResponse({ status: 200, description: "Vazifalar ro'yxati" })
  async getHomeworksByCourse(
    @Param('id') courseId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.homeworkService.getHomeworksByCourse(
      courseId,
      userId,
      userRole,
    );
  }

  // MENTOR, ADMIN, ASSISTANT: Vazifa detali
  @Get('detail/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Vazifa detali - MENTOR, ADMIN, ASSISTANT' })
  @ApiResponse({ status: 200, description: "Vazifa ma'lumotlari" })
  async getHomeworkDetail(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.homeworkService.getHomeworkById(id, userId, userRole);
  }

  // MENTOR, ADMIN: Vazifa yaratish
  @Post('create')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Vazifa yaratish - MENTOR, ADMIN' })
  @ApiResponse({ status: 201, description: 'Vazifa yaratildi' })
  async createHomework(
    @Body() dto: CreateHomeworkDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.homeworkService.createHomework(dto, userId, userRole);
  }

  // MENTOR, ADMIN: Vazifani yangilash
  @Patch('update/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Vazifani yangilash - MENTOR, ADMIN' })
  @ApiResponse({ status: 200, description: 'Vazifa yangilandi' })
  async updateHomework(
    @Param('id') id: string,
    @Body() dto: UpdateHomeworkDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.homeworkService.updateHomework(id, dto, userId, userRole);
  }

  // MENTOR, ADMIN: Vazifani o'chirish
  @Delete('delete/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: "Vazifani o'chirish - MENTOR, ADMIN" })
  @ApiResponse({ status: 200, description: "Vazifa o'chirildi" })
  async deleteHomework(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.homeworkService.deleteHomework(id, userId, userRole);
  }

  // STUDENT: Mening topshirig'im (dars bo'yicha)
  @Get('submission/mine/:lessonId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Mening topshirig'im (dars bo'yicha) - STUDENT" })
  @ApiResponse({ status: 200, description: "Topshiriq ma'lumotlari" })
  async getMySubmissionByLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.homeworkService.getMySubmissionByLesson(lessonId, userId);
  }

  // STUDENT: Vazifa topshirish
  @Post('submission/submit/:lessonId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Vazifa topshirish - STUDENT' })
  @ApiResponse({ status: 201, description: 'Vazifa topshirildi' })
  async submitHomework(
    @Param('lessonId') lessonId: string,
    @Body() dto: SubmitHomeworkDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.homeworkService.submitHomework(lessonId, dto, userId);
  }

  // MENTOR, ADMIN, ASSISTANT: Barcha topshiriqlar
  @Get('submissions/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Barcha topshiriqlar - MENTOR, ADMIN, ASSISTANT' })
  @ApiResponse({ status: 200, description: "Topshiriqlar ro'yxati" })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllSubmissions(
    @Query() query: QuerySubmissionDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.homeworkService.getAllSubmissions(query, userId, userRole);
  }

  // MENTOR, ADMIN, ASSISTANT: Bitta topshiriq detali
  @Get('submissions/single/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Topshiriq detali - MENTOR, ADMIN, ASSISTANT' })
  @ApiResponse({ status: 200, description: "Topshiriq ma'lumotlari" })
  async getSubmissionDetail(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.homeworkService.getSubmissionById(id, userId, userRole);
  }

  // MENTOR, ADMIN, ASSISTANT: Topshiriqni tekshirish
  @Post('submission/check')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiOperation({
    summary: 'Topshiriqni tekshirish - MENTOR, ADMIN, ASSISTANT',
  })
  @ApiResponse({ status: 200, description: 'Topshiriq tekshirildi' })
  async checkSubmission(
    @Body() dto: CheckSubmissionDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.homeworkService.checkSubmission(dto, userId, userRole);
  }
}
