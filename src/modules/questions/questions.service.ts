import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDto, UpdateQuestionDto, CreateAnswerDto, UpdateAnswerDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  // STUDENT: Mening savollarim
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

  // MENTOR, ADMIN, ASSISTANT: Kurs savollari
  async getQuestionsByCourse(courseId: string, userId: string, userRole: UserRole) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    // Check access
    if (userRole === UserRole.MENTOR && course.mentorId !== userId) {
      throw new ForbiddenException("Bu kurs savollarini ko'rishga ruxsat yo'q");
    }

    if (userRole === UserRole.ASSISTANT) {
      const assigned = await this.prisma.assignedCourse.findFirst({
        where: { userId, courseId },
      });
      if (!assigned) {
        throw new ForbiddenException("Bu kurs savollarini ko'rishga ruxsat yo'q");
      }
    }

    const questions = await this.prisma.question.findMany({
      where: { courseId },
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
    });

    return { questions };
  }

  // Bitta savol detali
  async getQuestionById(id: string, userId: string, userRole: UserRole) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        course: true,
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
    });

    if (!question) {
      throw new NotFoundException('Savol topilmadi');
    }

    // Student faqat o'z savollarini ko'radi
    if (userRole === UserRole.STUDENT && question.userId !== userId) {
      throw new ForbiddenException("Bu savolni ko'rishga ruxsat yo'q");
    }

    // Mentor faqat o'z kurslaridagi savollarni ko'radi
    if (userRole === UserRole.MENTOR && question.course.mentorId !== userId) {
      throw new ForbiddenException("Bu savolni ko'rishga ruxsat yo'q");
    }

    // Assistant faqat tayinlangan kurslarni ko'radi
    if (userRole === UserRole.ASSISTANT) {
      const assigned = await this.prisma.assignedCourse.findFirst({
        where: { userId, courseId: question.courseId },
      });
      if (!assigned) {
        throw new ForbiddenException("Bu savolni ko'rishga ruxsat yo'q");
      }
    }

    return { question };
  }

  // STUDENT: Savol yaratish
  async createQuestion(courseId: string, dto: CreateQuestionDto, userId: string) {
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

  // STUDENT: Savolni yangilash
  async updateQuestion(id: string, dto: UpdateQuestionDto, userId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Savol topilmadi');
    }

    if (question.userId !== userId) {
      throw new ForbiddenException("Bu savolni o'zgartirishga ruxsat yo'q");
    }

    const updatedQuestion = await this.prisma.question.update({
      where: { id },
      data: dto,
    });

    return { question: updatedQuestion };
  }

  // STUDENT: Savolni o'chirish
  async deleteQuestion(id: string, userId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Savol topilmadi');
    }

    if (question.userId !== userId) {
      throw new ForbiddenException("Bu savolni o'chirishga ruxsat yo'q");
    }

    await this.prisma.question.delete({ where: { id } });

    return { message: "Savol o'chirildi" };
  }

  // MENTOR, ADMIN, ASSISTANT: Savolni o'qilgan deb belgilash
  async markAsRead(id: string, userId: string, userRole: UserRole) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!question) {
      throw new NotFoundException('Savol topilmadi');
    }

    // Check access
    if (userRole === UserRole.MENTOR && question.course.mentorId !== userId) {
      throw new ForbiddenException("Bu savolni belgilashga ruxsat yo'q");
    }

    if (userRole === UserRole.ASSISTANT) {
      const assigned = await this.prisma.assignedCourse.findFirst({
        where: { userId, courseId: question.courseId },
      });
      if (!assigned) {
        throw new ForbiddenException("Bu savolni belgilashga ruxsat yo'q");
      }
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

  // MENTOR, ASSISTANT: Savolga javob berish
  async answerQuestion(questionId: string, dto: CreateAnswerDto, userId: string, userRole: UserRole) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { course: true },
    });

    if (!question) {
      throw new NotFoundException('Savol topilmadi');
    }

    // Check access
    if (userRole === UserRole.MENTOR && question.course.mentorId !== userId) {
      throw new ForbiddenException("Javob berishga ruxsat yo'q");
    }

    if (userRole === UserRole.ASSISTANT) {
      const assigned = await this.prisma.assignedCourse.findFirst({
        where: { userId, courseId: question.courseId },
      });
      if (!assigned) {
        throw new ForbiddenException("Javob berishga ruxsat yo'q");
      }
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

  // MENTOR, ASSISTANT, ADMIN: Javobni yangilash
  async updateAnswer(id: string, dto: UpdateAnswerDto, userId: string, userRole: UserRole) {
    const answer = await this.prisma.questionAnswer.findUnique({
      where: { id },
      include: {
        question: {
          include: { course: true },
        },
      },
    });

    if (!answer) {
      throw new NotFoundException('Javob topilmadi');
    }

    // ADMIN har qanday javobni yangilashi mumkin
    if (userRole === UserRole.ADMIN) {
      const updatedAnswer = await this.prisma.questionAnswer.update({
        where: { id },
        data: dto,
      });
      return { answer: updatedAnswer };
    }

    // Mentor va Assistant faqat o'z javoblarini yangilashi mumkin
    if (answer.userId !== userId) {
      throw new ForbiddenException("Javobni o'zgartirishga ruxsat yo'q");
    }

    const updatedAnswer = await this.prisma.questionAnswer.update({
      where: { id },
      data: dto,
    });

    return { answer: updatedAnswer };
  }

  // MENTOR, ASSISTANT, ADMIN: Javobni o'chirish
  async deleteAnswer(id: string, userId: string, userRole: UserRole) {
    const answer = await this.prisma.questionAnswer.findUnique({
      where: { id },
      include: {
        question: {
          include: { course: true },
        },
      },
    });

    if (!answer) {
      throw new NotFoundException('Javob topilmadi');
    }

    // ADMIN har qanday javobni o'chirishi mumkin
    if (userRole === UserRole.ADMIN) {
      await this.prisma.questionAnswer.delete({ where: { id } });
      return { message: "Javob o'chirildi" };
    }

    // Mentor va Assistant faqat o'z javoblarini o'chirishi mumkin
    if (answer.userId !== userId) {
      throw new ForbiddenException("Javobni o'chirishga ruxsat yo'q");
    }

    await this.prisma.questionAnswer.delete({ where: { id } });

    return { message: "Javob o'chirildi" };
  }

  private async hasAccessToCourse(userId: string, courseId: string): Promise<boolean> {
    const [purchased, assigned] = await Promise.all([
      this.prisma.purchasedCourse.findFirst({
        where: { userId, courseId },
      }),
      this.prisma.assignedCourse.findFirst({
        where: { userId, courseId },
      }),
    ]);

    return !!(purchased || assigned);
  }
}
