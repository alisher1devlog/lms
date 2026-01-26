import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateLessonDto,
  UpdateLessonDto,
  CreateLessonFileDto,
  LessonViewDto,
} from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findAllByGroup(groupId: string, userId: string) {
    const group = await this.prisma.lessonGroup.findUnique({
      where: { id: groupId },
      include: { course: true },
    });

    if (!group) {
      throw new NotFoundException("Bo'lim topilmadi");
    }

    // Check access
    const hasAccess = await this.hasAccessToCourse(userId, group.courseId);
    if (!hasAccess) {
      throw new ForbiddenException("Bu kursga kirish huquqi yo'q");
    }

    const lessons = await this.prisma.lesson.findMany({
      where: { groupId },
      include: {
        lessonViews: {
          where: { userId },
        },
        homework: {
          select: {
            id: true,
            task: true,
          },
        },
        _count: {
          select: {
            lessonFiles: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      lessons: lessons.map((lesson) => ({
        ...lesson,
        viewed: lesson.lessonViews.length > 0 && lesson.lessonViews[0].view,
      })),
    };
  }

  async findOne(id: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        group: {
          include: { course: true },
        },
        lessonFiles: true,
        homework: true,
        lessonViews: {
          where: { userId },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    const hasAccess = await this.hasAccessToCourse(
      userId,
      lesson.group.courseId,
    );
    if (!hasAccess) {
      throw new ForbiddenException("Bu darsga kirish huquqi yo'q");
    }

    return {
      lesson: {
        ...lesson,
        viewed: lesson.lessonViews.length > 0 && lesson.lessonViews[0].view,
      },
      files: lesson.lessonFiles,
      homework: lesson.homework,
    };
  }

  async create(
    groupId: string,
    dto: CreateLessonDto,
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
      throw new ForbiddenException("Bu bo'limga dars qo'shishga ruxsat yo'q");
    }

    const lesson = await this.prisma.lesson.create({
      data: {
        ...dto,
        groupId,
      },
    });

    return { lesson };
  }

  async update(
    id: string,
    dto: UpdateLessonDto,
    userId: string,
    userRole: UserRole,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        group: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Bu darsni o'zgartirishga ruxsat yo'q");
    }

    const updatedLesson = await this.prisma.lesson.update({
      where: { id },
      data: dto,
    });

    return { lesson: updatedLesson };
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        group: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Bu darsni o'chirishga ruxsat yo'q");
    }

    await this.prisma.lesson.delete({ where: { id } });

    return { message: "Dars o'chirildi" };
  }

  async markAsViewed(id: string, userId: string, dto: LessonViewDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        group: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    const hasAccess = await this.hasAccessToCourse(
      userId,
      lesson.group.courseId,
    );
    if (!hasAccess) {
      throw new ForbiddenException("Bu darsga kirish huquqi yo'q");
    }

    const lessonView = await this.prisma.lessonView.upsert({
      where: {
        lessonId_userId: {
          lessonId: id,
          userId,
        },
      },
      update: { view: dto.view },
      create: {
        lessonId: id,
        userId,
        view: dto.view,
      },
    });

    return { lessonView };
  }

  // Lesson Files
  async getFiles(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        group: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    const hasAccess = await this.hasAccessToCourse(
      userId,
      lesson.group.courseId,
    );
    if (!hasAccess) {
      throw new ForbiddenException("Bu darsga kirish huquqi yo'q");
    }

    const files = await this.prisma.lessonFile.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'desc' },
    });

    return { files };
  }

  async addFile(
    lessonId: string,
    dto: CreateLessonFileDto,
    userId: string,
    userRole: UserRole,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        group: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Bu darsga fayl qo'shishga ruxsat yo'q");
    }

    const file = await this.prisma.lessonFile.create({
      data: {
        ...dto,
        lessonId,
      },
    });

    return { file };
  }

  async removeFile(fileId: string, userId: string, userRole: UserRole) {
    const file = await this.prisma.lessonFile.findUnique({
      where: { id: fileId },
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

    if (!file) {
      throw new NotFoundException('Fayl topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      file.lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Bu faylni o'chirishga ruxsat yo'q");
    }

    await this.prisma.lessonFile.delete({ where: { id: fileId } });

    return { message: "Fayl o'chirildi" };
  }

  private async hasAccessToCourse(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role === UserRole.ADMIN || user?.role === UserRole.ASSISTANT) {
      return true;
    }

    const [purchased, assigned, course] = await Promise.all([
      this.prisma.purchasedCourse.findFirst({
        where: { userId, courseId },
      }),
      this.prisma.assignedCourse.findFirst({
        where: { userId, courseId },
      }),
      this.prisma.course.findUnique({
        where: { id: courseId },
        select: { mentorId: true },
      }),
    ]);

    return !!(purchased || assigned || course?.mentorId === userId);
  }
}
