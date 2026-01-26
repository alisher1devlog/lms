import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExamDto, CreateManyExamsDto, UpdateExamDto, SubmitExamDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  // ADMIN, MENTOR: Bitta imtihon yaratish
  async createExam(dto: CreateExamDto, userId: string, userRole: UserRole) {
    const group = await this.prisma.lessonGroup.findUnique({
      where: { id: dto.lessonGroupId },
      include: { course: true },
    });

    if (!group) {
      throw new NotFoundException("Bo'lim topilmadi");
    }

    if (userRole !== UserRole.ADMIN && group.course.mentorId !== userId) {
      throw new ForbiddenException("Imtihon yaratishga ruxsat yo'q");
    }

    const { lessonGroupId, ...examData } = dto;
    const exam = await this.prisma.exam.create({
      data: {
        ...examData,
        lessonGroupId,
      },
    });

    return { exam };
  }

  // ADMIN, MENTOR: Ko'plab imtihon yaratish
  async createManyExams(dto: CreateManyExamsDto, userId: string, userRole: UserRole) {
    const group = await this.prisma.lessonGroup.findUnique({
      where: { id: dto.lessonGroupId },
      include: { course: true },
    });

    if (!group) {
      throw new NotFoundException("Bo'lim topilmadi");
    }

    if (userRole !== UserRole.ADMIN && group.course.mentorId !== userId) {
      throw new ForbiddenException("Imtihon yaratishga ruxsat yo'q");
    }

    const exams = await this.prisma.exam.createMany({
      data: dto.exams.map((exam) => ({
        ...exam,
        lessonGroupId: dto.lessonGroupId,
      })),
    });

    return { count: exams.count, message: `${exams.count} ta imtihon yaratildi` };
  }

  // ADMIN, MENTOR: Imtihonni yangilash
  async updateExam(id: string, dto: UpdateExamDto, userId: string, userRole: UserRole) {
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

    if (userRole !== UserRole.ADMIN && exam.lessonGroup.course.mentorId !== userId) {
      throw new ForbiddenException("Imtihonni yangilashga ruxsat yo'q");
    }

    const updatedExam = await this.prisma.exam.update({
      where: { id },
      data: dto,
    });

    return { exam: updatedExam };
  }

  // ADMIN, MENTOR: Bitta imtihon detali
  async getExamById(id: string, userId: string, userRole: UserRole) {
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

    if (userRole !== UserRole.ADMIN && exam.lessonGroup.course.mentorId !== userId) {
      throw new ForbiddenException("Imtihonni ko'rishga ruxsat yo'q");
    }

    return { exam };
  }

  // STUDENT: Bo'lim imtihon savollari (javobsiz)
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

  // ADMIN, MENTOR: Bo'lim imtihon savollari (javobli)
  async getExamsByGroupWithAnswers(groupId: string, userId: string, userRole: UserRole) {
    const group = await this.prisma.lessonGroup.findUnique({
      where: { id: groupId },
      include: { course: true },
    });

    if (!group) {
      throw new NotFoundException("Bo'lim topilmadi");
    }

    if (userRole !== UserRole.ADMIN && group.course.mentorId !== userId) {
      throw new ForbiddenException("Imtihonlarni ko'rishga ruxsat yo'q");
    }

    const exams = await this.prisma.exam.findMany({
      where: { lessonGroupId: groupId },
    });

    return { exams };
  }

  // STUDENT: Imtihon topshirish
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

  // ADMIN: Barcha imtihon natijalari
  async getAllResults() {
    const results = await this.prisma.examResult.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        lessonGroup: {
          select: {
            id: true,
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

  // MENTOR: Bo'lim bo'yicha imtihon natijalari
  async getResultsByLessonGroup(lessonGroupId: string, userId: string) {
    const group = await this.prisma.lessonGroup.findUnique({
      where: { id: lessonGroupId },
      include: { course: true },
    });

    if (!group) {
      throw new NotFoundException("Bo'lim topilmadi");
    }

    if (group.course.mentorId !== userId) {
      throw new ForbiddenException("Natijalarni ko'rishga ruxsat yo'q");
    }

    const results = await this.prisma.examResult.findMany({
      where: { lessonGroupId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { results };
  }

  // ADMIN, MENTOR: Imtihonni o'chirish
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
