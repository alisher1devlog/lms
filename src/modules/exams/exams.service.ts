import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExamDto, SubmitExamDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async createExam(
    groupId: string,
    dto: CreateExamDto,
    userId: string,
    userRole: UserRole,
  ) {
    const group = await this.prisma.lessonGroup.findUnique({
      where: { id: groupId },
      include: { course: true },
    });

    if (!group) {
      throw new NotFoundException("Bo'lim topilmadi");
    }

    if (userRole !== UserRole.ADMIN && group.course.mentorId !== userId) {
      throw new ForbiddenException("Imtihon yaratishga ruxsat yo'q");
    }

    const exam = await this.prisma.exam.create({
      data: {
        ...dto,
        lessonGroupId: groupId,
      },
    });

    return { exam };
  }

  async getExamsByGroup(groupId: string, userId: string) {
    const group = await this.prisma.lessonGroup.findUnique({
      where: { id: groupId },
      include: { course: true },
    });

    if (!group) {
      throw new NotFoundException("Bo'lim topilmadi");
    }

    const hasAccess = await this.hasAccessToCourse(userId, group.courseId);
    if (!hasAccess) {
      throw new ForbiddenException("Bu kursga kirish huquqi yo'q");
    }

    const exams = await this.prisma.exam.findMany({
      where: { lessonGroupId: groupId },
      select: {
        id: true,
        question: true,
        variantA: true,
        variantB: true,
        variantC: true,
        variantD: true,
        // answer is hidden for students
      },
    });

    return { exams };
  }

  async submitExam(dto: SubmitExamDto, userId: string) {
    const group = await this.prisma.lessonGroup.findUnique({
      where: { id: dto.lessonGroupId },
      include: { course: true },
    });

    if (!group) {
      throw new NotFoundException("Bo'lim topilmadi");
    }

    const hasAccess = await this.hasAccessToCourse(userId, group.courseId);
    if (!hasAccess) {
      throw new ForbiddenException("Bu kursga kirish huquqi yo'q");
    }

    // Get exams with answers
    const exams = await this.prisma.exam.findMany({
      where: { lessonGroupId: dto.lessonGroupId },
    });

    // Calculate results
    let corrects = 0;
    let wrongs = 0;

    for (const answer of dto.answers) {
      const exam = exams.find((e) => e.id === answer.examId);
      if (exam) {
        if (exam.answer === answer.answer) {
          corrects++;
        } else {
          wrongs++;
        }
      }
    }

    const passed = corrects >= exams.length * 0.6; // 60% to pass

    await this.prisma.examResult.create({
      data: {
        lessonGroupId: dto.lessonGroupId,
        userId,
        passed,
        corrects,
        wrongs,
      },
    });

    return {
      result: {
        passed,
        corrects,
        wrongs,
        total: exams.length,
        percentage: Math.round((corrects / exams.length) * 100),
      },
    };
  }

  async getResults(userId: string, courseId?: string, groupId?: string) {
    const where: any = { userId };

    if (groupId) {
      where.lessonGroupId = groupId;
    } else if (courseId) {
      where.lessonGroup = {
        courseId,
      };
    }

    const results = await this.prisma.examResult.findMany({
      where,
      include: {
        lessonGroup: {
          select: {
            name: true,
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { results };
  }

  async deleteExam(id: string, userId: string, userRole: UserRole) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        lessonGroup: {
          include: { course: true },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Imtihon topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      exam.lessonGroup.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Imtihonni o'chirishga ruxsat yo'q");
    }

    await this.prisma.exam.delete({ where: { id } });

    return { message: "Imtihon o'chirildi" };
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
