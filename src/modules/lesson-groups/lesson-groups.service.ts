import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLessonGroupDto, UpdateLessonGroupDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class LessonGroupsService {
  constructor(private prisma: PrismaService) {}

  async findAllByCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const groups = await this.prisma.lessonGroup.findMany({
      where: { courseId },
      include: {
        lessons: {
          select: {
            id: true,
            name: true,
            about: true,
            createdAt: true,
          },
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

    return { groups };
  }

  async create(
    courseId: string,
    dto: CreateLessonGroupDto,
    userId: string,
    userRole: UserRole,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    if (userRole !== UserRole.ADMIN && course.mentorId !== userId) {
      throw new ForbiddenException("Bu kursga bo'lim qo'shishga ruxsat yo'q");
    }

    const group = await this.prisma.lessonGroup.create({
      data: {
        ...dto,
        courseId,
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
      data: dto,
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
