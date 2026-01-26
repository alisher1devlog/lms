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
  CheckSubmissionDto,
  QuerySubmissionDto,
} from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class HomeworkService {
  constructor(private prisma: PrismaService) {}

  // Kurs vazifalarini olish
  async getHomeworksByCourse(
    courseId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    // Check access for mentor
    if (userRole === UserRole.MENTOR && course.mentorId !== userId) {
      throw new ForbiddenException("Bu kursga kirish huquqi yo'q");
    }

    // Check access for assistant
    if (userRole === UserRole.ASSISTANT) {
      const assigned = await this.prisma.assignedCourse.findFirst({
        where: { userId, courseId },
      });
      if (!assigned) {
        throw new ForbiddenException("Bu kursga kirish huquqi yo'q");
      }
    }

    const homeworks = await this.prisma.homework.findMany({
      where: {
        lesson: {
          group: {
            courseId,
          },
        },
      },
      include: {
        lesson: {
          select: {
            id: true,
            name: true,
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { homeworks };
  }

  // Vazifa detali
  async getHomeworkById(id: string, userId: string, userRole: UserRole) {
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
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!homework) {
      throw new NotFoundException('Vazifa topilmadi');
    }

    // Check access
    if (
      userRole === UserRole.MENTOR &&
      homework.lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Bu vazifani ko'rishga ruxsat yo'q");
    }

    if (userRole === UserRole.ASSISTANT) {
      const assigned = await this.prisma.assignedCourse.findFirst({
        where: { userId, courseId: homework.lesson.group.courseId },
      });
      if (!assigned) {
        throw new ForbiddenException("Bu vazifani ko'rishga ruxsat yo'q");
      }
    }

    return { homework };
  }

  // Vazifa yaratish
  async createHomework(
    dto: CreateHomeworkDto,
    userId: string,
    userRole: UserRole,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
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

    const { lessonId, ...homeworkData } = dto;
    const homework = await this.prisma.homework.create({
      data: {
        ...homeworkData,
        lessonId,
      },
    });

    return { homework };
  }

  // Vazifani yangilash
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

  // Vazifani o'chirish
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

  // STUDENT: Mening topshirig'im (dars bo'yicha)
  async getMySubmissionByLesson(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        homework: true,
        group: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    // Check access to course
    const hasAccess = await this.hasAccessToCourse(
      userId,
      lesson.group.courseId,
    );
    if (!hasAccess) {
      throw new ForbiddenException("Bu kursga kirish huquqi yo'q");
    }

    if (!lesson.homework) {
      return { homework: null, submission: null };
    }

    const submission = await this.prisma.homeworkSubmission.findFirst({
      where: {
        homeworkId: lesson.homework.id,
        userId,
      },
    });

    return {
      homework: lesson.homework,
      submission,
    };
  }

  // STUDENT: Vazifa topshirish
  async submitHomework(
    lessonId: string,
    dto: SubmitHomeworkDto,
    userId: string,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        homework: true,
        group: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    if (!lesson.homework) {
      throw new NotFoundException('Bu dars uchun vazifa mavjud emas');
    }

    // Check access to course
    const hasAccess = await this.hasAccessToCourse(
      userId,
      lesson.group.courseId,
    );
    if (!hasAccess) {
      throw new ForbiddenException("Bu kursga kirish huquqi yo'q");
    }

    // Check if already submitted
    const existingSubmission = await this.prisma.homeworkSubmission.findFirst({
      where: {
        homeworkId: lesson.homework.id,
        userId,
      },
    });

    if (existingSubmission) {
      // Update existing submission
      const updatedSubmission = await this.prisma.homeworkSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          ...dto,
          status: 'PENDING',
        },
      });
      return { submission: updatedSubmission };
    }

    const submission = await this.prisma.homeworkSubmission.create({
      data: {
        ...dto,
        homeworkId: lesson.homework.id,
        userId,
      },
    });

    return { submission };
  }

  // Barcha topshiriqlar
  async getAllSubmissions(
    query: QuerySubmissionDto,
    userId: string,
    userRole: UserRole,
  ) {
    const { status, offset = 0, limit = 10 } = query;

    const where: any = {};
    if (status) where.status = status;

    // Mentor faqat o'z kurslaridagi submissionlarni ko'radi
    if (userRole === UserRole.MENTOR) {
      where.homework = {
        lesson: {
          group: {
            course: {
              mentorId: userId,
            },
          },
        },
      };
    }

    // Assistant faqat tayinlangan kurslarni ko'radi
    if (userRole === UserRole.ASSISTANT) {
      const assignedCourses = await this.prisma.assignedCourse.findMany({
        where: { userId },
        select: { courseId: true },
      });
      where.homework = {
        lesson: {
          group: {
            courseId: { in: assignedCourses.map((c) => c.courseId) },
          },
        },
      };
    }

    const [submissions, total] = await Promise.all([
      this.prisma.homeworkSubmission.findMany({
        where,
        skip: +offset,
        take: +limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              image: true,
            },
          },
          homework: {
            select: {
              id: true,
              task: true,
              lesson: {
                select: {
                  id: true,
                  name: true,
                  group: {
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
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.homeworkSubmission.count({ where }),
    ]);

    return { total, data: submissions };
  }

  // Bitta topshiriq detali
  async getSubmissionById(id: string, userId: string, userRole: UserRole) {
    const submission = await this.prisma.homeworkSubmission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            image: true,
            phone: true,
          },
        },
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

    // Check access
    if (
      userRole === UserRole.MENTOR &&
      submission.homework.lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Bu topshiriqni ko'rishga ruxsat yo'q");
    }

    if (userRole === UserRole.ASSISTANT) {
      const assigned = await this.prisma.assignedCourse.findFirst({
        where: { userId, courseId: submission.homework.lesson.group.courseId },
      });
      if (!assigned) {
        throw new ForbiddenException("Bu topshiriqni ko'rishga ruxsat yo'q");
      }
    }

    return { submission };
  }

  // Topshiriqni tekshirish
  async checkSubmission(
    dto: CheckSubmissionDto,
    userId: string,
    userRole: UserRole,
  ) {
    const submission = await this.prisma.homeworkSubmission.findUnique({
      where: { id: dto.submissionId },
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

    // Check access
    if (
      userRole === UserRole.MENTOR &&
      submission.homework.lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Bu topshiriqni tekshirishga ruxsat yo'q");
    }

    if (userRole === UserRole.ASSISTANT) {
      const assigned = await this.prisma.assignedCourse.findFirst({
        where: { userId, courseId: submission.homework.lesson.group.courseId },
      });
      if (!assigned) {
        throw new ForbiddenException("Bu topshiriqni tekshirishga ruxsat yo'q");
      }
    }

    const updatedSubmission = await this.prisma.homeworkSubmission.update({
      where: { id: dto.submissionId },
      data: {
        status: dto.status,
        reason: dto.reason,
      },
    });

    return { submission: updatedSubmission };
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
