import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  QueryCourseDto,
  PurchaseCourseDto,
  AssignCourseDto,
} from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryCourseDto) {
    const {
      categoryId,
      level,
      published,
      search,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (categoryId) where.categoryId = categoryId;
    if (level) where.level = level;
    if (published !== undefined) where.published = published === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { about: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: +limit,
        include: {
          category: true,
          mentor: {
            select: {
              id: true,
              fullName: true,
              image: true,
            },
          },
          _count: {
            select: {
              ratings: true,
              purchasedCourses: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      courses,
      total,
      page: +page,
      limit: +limit,
    };
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        mentor: {
          select: {
            id: true,
            fullName: true,
            image: true,
            mentorProfile: true,
          },
        },
        lessonGroups: {
          include: {
            lessons: {
              select: {
                id: true,
                name: true,
                about: true,
              },
            },
          },
        },
        ratings: {
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
          take: 10,
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    // Calculate average rating
    const avgRating = await this.prisma.rating.aggregate({
      where: { courseId: id },
      _avg: { rate: true },
    });

    return {
      course,
      averageRating: avgRating._avg.rate || 0,
    };
  }

  async create(dto: CreateCourseDto, mentorId: number) {
    const course = await this.prisma.course.create({
      data: {
        ...dto,
        mentorId,
      },
      include: {
        category: true,
        mentor: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return { course };
  }

  async update(
    id: string,
    dto: UpdateCourseDto,
    userId: number,
    userRole: UserRole,
  ) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    if (userRole !== UserRole.ADMIN && course.mentorId !== userId) {
      throw new ForbiddenException("Bu kursni o'zgartirishga ruxsat yo'q");
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id },
      data: dto,
      include: {
        category: true,
        mentor: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return { course: updatedCourse };
  }

  async remove(id: string, userId: number, userRole: UserRole) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    if (userRole !== UserRole.ADMIN && course.mentorId !== userId) {
      throw new ForbiddenException("Bu kursni o'chirishga ruxsat yo'q");
    }

    await this.prisma.course.delete({ where: { id } });

    return { message: "Kurs o'chirildi" };
  }

  async getStudents(courseId: string, userId: number, userRole: UserRole) {
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
      throw new ForbiddenException("Ruxsat yo'q");
    }

    const [purchased, assigned] = await Promise.all([
      this.prisma.purchasedCourse.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              image: true,
            },
          },
        },
      }),
      this.prisma.assignedCourse.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              image: true,
            },
          },
        },
      }),
    ]);

    const students = [
      ...purchased.map((p) => ({
        ...p.user,
        type: 'purchased',
        date: p.purchasedAt,
      })),
      ...assigned.map((a) => ({
        ...a.user,
        type: 'assigned',
        date: a.createdAt,
      })),
    ];

    return { students };
  }

  async purchase(courseId: string, userId: number, dto: PurchaseCourseDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const existingPurchase = await this.prisma.purchasedCourse.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existingPurchase) {
      throw new ConflictException('Bu kurs allaqachon sotib olingan');
    }

    const existingAssignment = await this.prisma.assignedCourse.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('Bu kurs allaqachon sizga biriktirilgan');
    }

    const purchase = await this.prisma.purchasedCourse.create({
      data: {
        courseId,
        userId,
        amount: dto.amount || course.price,
        paidVia: dto.paidVia,
      },
      include: {
        course: {
          select: {
            name: true,
            banner: true,
          },
        },
      },
    });

    return { purchase };
  }

  async assign(courseId: string, dto: AssignCourseDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const existingAssignment = await this.prisma.assignedCourse.findUnique({
      where: {
        userId_courseId: { userId: dto.userId, courseId },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('Bu kurs allaqachon biriktirilgan');
    }

    const existingPurchase = await this.prisma.purchasedCourse.findUnique({
      where: {
        userId_courseId: { userId: dto.userId, courseId },
      },
    });

    if (existingPurchase) {
      throw new ConflictException('Bu kurs allaqachon sotib olingan');
    }

    const assignment = await this.prisma.assignedCourse.create({
      data: {
        courseId,
        userId: dto.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
        course: {
          select: {
            name: true,
          },
        },
      },
    });

    return { assignment };
  }

  async getMyCourses(userId: number) {
    const [purchased, assigned] = await Promise.all([
      this.prisma.purchasedCourse.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              category: true,
              mentor: {
                select: {
                  id: true,
                  fullName: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  lessonGroups: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.assignedCourse.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              category: true,
              mentor: {
                select: {
                  id: true,
                  fullName: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  lessonGroups: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const courses = [
      ...purchased.map((p) => ({ ...p.course, type: 'purchased' })),
      ...assigned.map((a) => ({ ...a.course, type: 'assigned' })),
    ];

    return { courses };
  }

  async hasAccessToCourse(userId: number, courseId: string): Promise<boolean> {
    const [purchased, assigned, course] = await Promise.all([
      this.prisma.purchasedCourse.findUnique({
        where: { userId_courseId: { userId, courseId } },
      }),
      this.prisma.assignedCourse.findUnique({
        where: { userId_courseId: { userId, courseId } },
      }),
      this.prisma.course.findUnique({
        where: { id: courseId },
        select: { mentorId: true },
      }),
    ]);

    return !!(purchased || assigned || course?.mentorId === userId);
  }
}
