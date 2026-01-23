import {
  Controller,
  Get,
  Post,
  Put,
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
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, CreateAnswerDto, UpdateAnswerDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Questions')
@Controller('api')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Post('courses/:courseId/questions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Savol yaratish' })
  @ApiResponse({ status: 201, description: 'Savol yaratildi' })
  async createQuestion(
    @Param('courseId') courseId: string,
    @Body() dto: CreateQuestionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionsService.createQuestion(courseId, dto, userId);
  }

  @Get('courses/:courseId/questions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Kurs savollari' })
  @ApiResponse({ status: 200, description: "Savollar ro'yxati" })
  async getQuestionsByCourse(
    @Param('courseId') courseId: string,
    @Query('read') read?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') userRole?: UserRole,
  ) {
    const readBool =
      read === 'true' ? true : read === 'false' ? false : undefined;
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.questionsService.getQuestionsByCourse(
      courseId,
      userId,
      userRole,
      readBool,
      pageNum,
      limitNum,
    );
  }

  @Put('questions/:id/read')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiOperation({ summary: "Savolni o'qilgan deb belgilash" })
  @ApiResponse({ status: 200, description: 'Savol belgilandi' })
  async markAsRead(@Param('id') id: string) {
    return this.questionsService.markAsRead(id);
  }

  @Post('questions/:questionId/answer')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Savolga javob berish' })
  @ApiResponse({ status: 201, description: 'Javob berildi' })
  async answerQuestion(
    @Param('questionId') questionId: string,
    @Body() dto: CreateAnswerDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.questionsService.answerQuestion(
      questionId,
      dto,
      userId,
      userRole,
    );
  }

  @Put('answers/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Javobni yangilash' })
  @ApiResponse({ status: 200, description: 'Javob yangilandi' })
  async updateAnswer(
    @Param('id') id: string,
    @Body() dto: UpdateAnswerDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.questionsService.updateAnswer(id, dto, userId, userRole);
  }

  @Get('my-questions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Mening savollarim' })
  @ApiResponse({ status: 200, description: "Savollar ro'yxati" })
  async getMyQuestions(@CurrentUser('id') userId: string) {
    return this.questionsService.getMyQuestions(userId);
  }
}
