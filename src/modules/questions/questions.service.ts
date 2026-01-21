import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDto, CreateAnswerDto, UpdateAnswerDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async createQuestion(
    courseId: string,
    dto: CreateQuestionDto,
    userId: string,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const hasAccess = await this.hasAccessToCourse(userId, courseId);
    if (!hasAccess) {
      throw new ForbiddenException("Bu kursga kirish huquqi yo'q");
    }

    const question = await this.prisma.question.create({
      data: {
        ...dto,
        courseId,
        userId,
      },
    });

    return { question };
  }

  async getQuestionsByCourse(
    courseId: string,
    userId: string,
    userRole: UserRole,
    read?: boolean,
    page: number = 1,
    limit: number = 10,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.ASSISTANT &&
      course.mentorId !== userId
    ) {
      throw new ForbiddenException("Savollarni ko'rishga ruxsat yo'q");
    }

    const skip = (page - 1) * limit;

    const where: any = { courseId };
    if (read !== undefined) where.read = read;

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              image: true,
            },
          },
          answer: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.question.count({ where }),
    ]);

    return { questions, total };
  }

  async markAsRead(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Savol topilmadi');
    }

    const updatedQuestion = await this.prisma.question.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return { question: updatedQuestion };
  }

  async answerQuestion(
    questionId: string,
    dto: CreateAnswerDto,
    userId: string,
    userRole: UserRole,
  ) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { course: true },
    });

    if (!question) {
      throw new NotFoundException('Savol topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.ASSISTANT &&
      question.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Javob berishga ruxsat yo'q");
    }

    const answer = await this.prisma.questionAnswer.create({
      data: {
        ...dto,
        questionId,
        userId,
      },
    });

    // Mark question as read
    await this.prisma.question.update({
      where: { id: questionId },
      data: { read: true, readAt: new Date() },
    });

    return { answer };
  }

  async updateAnswer(
    id: string,
    dto: UpdateAnswerDto,
    userId: string,
    userRole: UserRole,
  ) {
    const answer = await this.prisma.questionAnswer.findUnique({
      where: { id },
    });

    if (!answer) {
      throw new NotFoundException('Javob topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.ASSISTANT &&
      answer.userId !== userId
    ) {
      throw new ForbiddenException("Javobni o'zgartirishga ruxsat yo'q");
    }

    const updatedAnswer = await this.prisma.questionAnswer.update({
      where: { id },
      data: dto,
    });

    return { answer: updatedAnswer };
  }

  async getMyQuestions(userId: string) {
    const questions = await this.prisma.question.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        answer: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { questions };
  }

  private async hasAccessToCourse(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    const [purchased, assigned] = await Promise.all([
      this.prisma.purchasedCourse.findUnique({
        where: { userId_courseId: { userId, courseId } },
      }),
      this.prisma.assignedCourse.findUnique({
        where: { userId_courseId: { userId, courseId } },
      }),
    ]);

    return !!(purchased || assigned);
  }
}
