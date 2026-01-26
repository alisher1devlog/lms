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
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto, CreateAnswerDto, UpdateAnswerDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Questions & Answers')
@Controller('api/questions')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  // STUDENT: Mening savollarim
  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Mening savollarim - STUDENT' })
  @ApiResponse({ status: 200, description: "Savollar ro'yxati" })
  async getMyQuestions(@CurrentUser('id') userId: string) {
    return this.questionsService.getMyQuestions(userId);
  }

  // MENTOR, ADMIN, ASSISTANT: Kurs savollari
  @Get('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Kurs savollari - MENTOR, ADMIN, ASSISTANT' })
  @ApiResponse({ status: 200, description: "Savollar ro'yxati" })
  async getQuestionsByCourse(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.questionsService.getQuestionsByCourse(courseId, userId, userRole);
  }

  // MENTOR, ADMIN, ASSISTANT, STUDENT: Bitta savol detali
  @Get('single/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN, UserRole.ASSISTANT, UserRole.STUDENT)
  @ApiOperation({ summary: 'Savol detali - MENTOR, ADMIN, ASSISTANT, STUDENT' })
  @ApiResponse({ status: 200, description: 'Savol ma\'lumotlari' })
  async getQuestionById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.questionsService.getQuestionById(id, userId, userRole);
  }

  // MENTOR, ADMIN, ASSISTANT: Savolni o'qilgan deb belgilash
  @Post('read/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN, UserRole.ASSISTANT)
  @ApiOperation({ summary: "Savolni o'qilgan deb belgilash - MENTOR, ADMIN, ASSISTANT" })
  @ApiResponse({ status: 200, description: 'Savol belgilandi' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.questionsService.markAsRead(id, userId, userRole);
  }

  // STUDENT: Savol yaratish
  @Post('create/:courseId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Savol yaratish - STUDENT' })
  @ApiResponse({ status: 201, description: 'Savol yaratildi' })
  async createQuestion(
    @Param('courseId') courseId: string,
    @Body() dto: CreateQuestionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionsService.createQuestion(courseId, dto, userId);
  }

  // STUDENT: Savolni yangilash
  @Patch('update/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Savolni yangilash - STUDENT' })
  @ApiResponse({ status: 200, description: 'Savol yangilandi' })
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionsService.updateQuestion(id, dto, userId);
  }

  // MENTOR, ASSISTANT: Savolga javob berish
  @Post('answer/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Savolga javob berish - MENTOR, ASSISTANT' })
  @ApiResponse({ status: 201, description: 'Javob berildi' })
  async answerQuestion(
    @Param('id') questionId: string,
    @Body() dto: CreateAnswerDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.questionsService.answerQuestion(questionId, dto, userId, userRole);
  }

  // MENTOR, ASSISTANT, ADMIN: Javobni yangilash
  @Patch('answer/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Javobni yangilash - MENTOR, ASSISTANT, ADMIN' })
  @ApiResponse({ status: 200, description: 'Javob yangilandi' })
  async updateAnswer(
    @Param('id') id: string,
    @Body() dto: UpdateAnswerDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.questionsService.updateAnswer(id, dto, userId, userRole);
  }

  // MENTOR, ASSISTANT, ADMIN: Javobni o'chirish
  @Delete('answer/delete/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT, UserRole.ADMIN)
  @ApiOperation({ summary: "Javobni o'chirish - MENTOR, ASSISTANT, ADMIN" })
  @ApiResponse({ status: 200, description: "Javob o'chirildi" })
  async deleteAnswer(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.questionsService.deleteAnswer(id, userId, userRole);
  }

  // STUDENT: Savolni o'chirish
  @Delete('delete/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Savolni o'chirish - STUDENT" })
  @ApiResponse({ status: 200, description: "Savol o'chirildi" })
  async deleteQuestion(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionsService.deleteQuestion(id, userId);
  }
}
