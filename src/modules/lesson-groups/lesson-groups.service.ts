import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateLessonGroupDto,
  UpdateLessonGroupDto,
  QueryLessonGroupDto,
} from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class LessonGroupsService {
  constructor(private prisma: PrismaService) {}

  // ===================== PUBLIC METHODS =====================

  async getAllByCourse(courseId: string, query: QueryLessonGroupDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const offset = parseInt(query.offset || '0', 10);
    const limit = parseInt(query.limit || '10', 10);
    const includeLessons = query.include_lessons === true;

    const [total, groups] = await Promise.all([
      this.prisma.lessonGroup.count({ where: { courseId } }),
      this.prisma.lessonGroup.findMany({
        where: { courseId },
        select: includeLessons
          ? {
              id: true,
              name: true,
              lessons: {
                select: {
                  id: true,
                  name: true,
                },
                orderBy: { createdAt: 'asc' },
              },
            }
          : {
              id: true,
              name: true,
            },
        orderBy: { createdAt: 'asc' },
        skip: offset,
        take: limit,
      }),
    ]);

    return { total, data: groups };
  }

  async getDetail(id: string) {
    const group = await this.prisma.lessonGroup.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        lessons: {
          select: {
            id: true,
            name: true,
            about: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        exams: {
          select: {
            id: true,
            question: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            exams: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException("Bo'lim topilmadi");
    }

    return { group };
  }

  // ===================== STUDENT METHODS =====================

  async getMineAllByCourse(courseId: string, userId: string) {
    // Student kursni sotib olganmi tekshirish
    const purchased = await this.prisma.purchasedCourse.findFirst({
      where: { userId, courseId },
    });

    if (!purchased) {
      throw new ForbiddenException("Bu kursga kirish huquqi yo'q");
    }

    const groups = await this.prisma.lessonGroup.findMany({
      where: { courseId },
      include: {
        lessons: {
          select: {
            id: true,
            name: true,
            about: true,
            video: true,
            createdAt: true,
            lessonViews: {
              where: { userId },
              select: { view: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            lessons: true,
            exams: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Har bir darsga viewed field qo'shish
    const groupsWithProgress = groups.map((group) => ({
      ...group,
      lessons: group.lessons.map((lesson) => ({
        ...lesson,
        viewed: lesson.lessonViews.length > 0 && lesson.lessonViews[0].view,
        lessonViews: undefined,
      })),
    }));

    return { groups: groupsWithProgress };
  }

  // ===================== MENTOR & ADMIN METHODS =====================

  async create(dto: CreateLessonGroupDto, userId: string, userRole: UserRole) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    if (userRole !== UserRole.ADMIN && course.mentorId !== userId) {
      throw new ForbiddenException("Bu kursga bo'lim qo'shishga ruxsat yo'q");
    }

    const group = await this.prisma.lessonGroup.create({
      data: {
        name: dto.name,
        courseId: dto.courseId,
      },
    });

    return { group };
  }

  async update(
    id: string,
    dto: UpdateLessonGroupDto,
    userId: string,
    userRole: UserRole,
  ) {
    const group = await this.prisma.lessonGroup.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!group) {
      throw new NotFoundException("Bo'lim topilmadi");
    }

    if (userRole !== UserRole.ADMIN && group.course.mentorId !== userId) {
      throw new ForbiddenException("Bu bo'limni o'zgartirishga ruxsat yo'q");
    }

    const updatedGroup = await this.prisma.lessonGroup.update({
      where: { id },
      data: { name: dto.name },
    });

    return { group: updatedGroup };
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const group = await this.prisma.lessonGroup.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!group) {
      throw new NotFoundException("Bo'lim topilmadi");
    }

    if (userRole !== UserRole.ADMIN && group.course.mentorId !== userId) {
      throw new ForbiddenException("Bu bo'limni o'chirishga ruxsat yo'q");
    }

    await this.prisma.lessonGroup.delete({ where: { id } });

    return { message: "Bo'lim o'chirildi" };
  }
}
