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
import { HomeworkService } from './homework.service';
import {
  CreateHomeworkDto,
  UpdateHomeworkDto,
  SubmitHomeworkDto,
  UpdateSubmissionStatusDto,
  QuerySubmissionDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Homework')
@Controller('api')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class HomeworkController {
  constructor(private homeworkService: HomeworkService) {}

  @Post('lessons/:lessonId/homework')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Darsga vazifa yaratish' })
  @ApiResponse({ status: 201, description: 'Vazifa yaratildi' })
  async createHomework(
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateHomeworkDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.homeworkService.createHomework(lessonId, dto, userId, userRole);
  }

  @Put('homework/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Vazifani yangilash' })
  @ApiResponse({ status: 200, description: 'Vazifa yangilandi' })
  async updateHomework(
    @Param('id') id: string,
    @Body() dto: UpdateHomeworkDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.homeworkService.updateHomework(id, dto, userId, userRole);
  }

  @Delete('homework/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: "Vazifani o'chirish" })
  @ApiResponse({ status: 200, description: "Vazifa o'chirildi" })
  async deleteHomework(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.homeworkService.deleteHomework(id, userId, userRole);
  }

  @Post('homework/:homeworkId/submit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Vazifani topshirish' })
  @ApiResponse({ status: 201, description: 'Vazifa topshirildi' })
  async submitHomework(
    @Param('homeworkId') homeworkId: string,
    @Body() dto: SubmitHomeworkDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.homeworkService.submitHomework(homeworkId, dto, userId);
  }

  @Get('homework/:homeworkId/submissions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Vazifa topshiriqlari' })
  @ApiResponse({ status: 200, description: "Topshiriqlar ro'yxati" })
  async getSubmissions(
    @Param('homeworkId') homeworkId: string,
    @Query() query: QuerySubmissionDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.homeworkService.getSubmissions(
      homeworkId,
      query,
      userId,
      userRole,
    );
  }

  @Put('submissions/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiOperation({ summary: "Topshiriq statusini o'zgartirish" })
  @ApiResponse({ status: 200, description: "Status o'zgartirildi" })
  async updateSubmissionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSubmissionStatusDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.homeworkService.updateSubmissionStatus(
      id,
      dto,
      userId,
      userRole,
    );
  }

  @Get('my-submissions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Mening topshiriqlarim' })
  @ApiResponse({ status: 200, description: "Topshiriqlar ro'yxati" })
  async getMySubmissions(@CurrentUser('id') userId: string) {
    return this.homeworkService.getMySubmissions(userId);
  }
}
