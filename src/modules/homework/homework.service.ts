import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateHomeworkDto,
  UpdateHomeworkDto,
  SubmitHomeworkDto,
  UpdateSubmissionStatusDto,
  QuerySubmissionDto,
} from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class HomeworkService {
  constructor(private prisma: PrismaService) {}

  async createHomework(
    lessonId: string,
    dto: CreateHomeworkDto,
    userId: string,
    userRole: UserRole,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        group: {
          include: { course: true },
        },
        homework: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    if (lesson.homework) {
      throw new ConflictException('Bu dars uchun vazifa allaqachon mavjud');
    }

    if (
      userRole !== UserRole.ADMIN &&
      lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Vazifa yaratishga ruxsat yo'q");
    }

    const homework = await this.prisma.homework.create({
      data: {
        ...dto,
        lessonId,
      },
    });

    return { homework };
  }

  async updateHomework(
    id: string,
    dto: UpdateHomeworkDto,
    userId: string,
    userRole: UserRole,
  ) {
    const homework = await this.prisma.homework.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            group: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!homework) {
      throw new NotFoundException('Vazifa topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      homework.lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Vazifani o'zgartirishga ruxsat yo'q");
    }

    const updatedHomework = await this.prisma.homework.update({
      where: { id },
      data: dto,
    });

    return { homework: updatedHomework };
  }

  async deleteHomework(id: string, userId: string, userRole: UserRole) {
    const homework = await this.prisma.homework.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            group: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!homework) {
      throw new NotFoundException('Vazifa topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      homework.lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Vazifani o'chirishga ruxsat yo'q");
    }

    await this.prisma.homework.delete({ where: { id } });

    return { message: "Vazifa o'chirildi" };
  }

  async submitHomework(
    homeworkId: string,
    dto: SubmitHomeworkDto,
    userId: string,
  ) {
    const homework = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
      include: {
        lesson: {
          include: {
            group: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!homework) {
      throw new NotFoundException('Vazifa topilmadi');
    }

    // Check access to course
    const hasAccess = await this.hasAccessToCourse(
      userId,
      homework.lesson.group.courseId,
    );

    if (!hasAccess) {
      throw new ForbiddenException("Bu kursga kirish huquqi yo'q");
    }

    const submission = await this.prisma.homeworkSubmission.create({
      data: {
        ...dto,
        homeworkId,
        userId,
      },
      include: {
        homework: {
          select: {
            task: true,
          },
        },
      },
    });

    return { submission };
  }

  async getSubmissions(
    homeworkId: string,
    query: QuerySubmissionDto,
    userId: string,
    userRole: UserRole,
  ) {
    const homework = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
      include: {
        lesson: {
          include: {
            group: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!homework) {
      throw new NotFoundException('Vazifa topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.ASSISTANT &&
      homework.lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Topshiriqlarni ko'rishga ruxsat yo'q");
    }

    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { homeworkId };
    if (status) where.status = status;

    const [submissions, total] = await Promise.all([
      this.prisma.homeworkSubmission.findMany({
        where,
        skip,
        take: +limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.homeworkSubmission.count({ where }),
    ]);

    return { submissions, total };
  }

  async updateSubmissionStatus(
    id: string,
    dto: UpdateSubmissionStatusDto,
    userId: string,
    userRole: UserRole,
  ) {
    const submission = await this.prisma.homeworkSubmission.findUnique({
      where: { id },
      include: {
        homework: {
          include: {
            lesson: {
              include: {
                group: {
                  include: { course: true },
                },
              },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Topshiriq topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.ASSISTANT &&
      submission.homework.lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Statusni o'zgartirishga ruxsat yo'q");
    }

    const updatedSubmission = await this.prisma.homeworkSubmission.update({
      where: { id },
      data: dto,
    });

    return { submission: updatedSubmission };
  }

  async getMySubmissions(userId: string) {
    const submissions = await this.prisma.homeworkSubmission.findMany({
      where: { userId },
      include: {
        homework: {
          include: {
            lesson: {
              select: {
                id: true,
                name: true,
                group: {
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
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { submissions };
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
