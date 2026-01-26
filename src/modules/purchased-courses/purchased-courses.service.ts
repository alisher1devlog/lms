import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PurchaseCourseDto,
  CreatePurchasedCourseDto,
  QueryPurchasedCourseDto,
  QueryCourseStudentsDto,
} from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class PurchasedCoursesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Student o'z sotib olgan kurslarini ko'radi
   */
  async getMyPurchasedCourses(userId: string, query: QueryPurchasedCourseDto) {
    const { offset = 0, limit = 8, search, category_id, level } = query;

    const courseWhere: any = {};
    if (search) {
      courseWhere.name = { contains: search, mode: 'insensitive' };
    }
    if (category_id) {
      courseWhere.categoryId = String(category_id);
    }
    if (level) {
      courseWhere.level = level;
    }

    const where: any = {
      userId,
      course: courseWhere,
    };

    const [purchases, total] = await Promise.all([
      this.prisma.purchasedCourse.findMany({
        where,
        skip: +offset,
        take: +limit,
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
        orderBy: { purchasedAt: 'desc' },
      }),
      this.prisma.purchasedCourse.count({ where }),
    ]);

    const courses = purchases.map((p) => ({
      ...p.course,
      purchasedAt: p.purchasedAt,
      paidVia: p.paidVia,
      amount: p.amount,
    }));

    return {
      courses,
      total,
      offset: +offset,
      limit: +limit,
    };
  }

  /**
   * Student ma'lum bir kursni sotib olganmi tekshirish
   */
  async getMyPurchasedCourse(userId: string, courseId: string) {
    const purchase = await this.prisma.purchasedCourse.findFirst({
      where: { userId, courseId },
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
            lessonGroups: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Siz bu kursni sotib olmagansiz');
    }

    return {
      purchased: true,
      purchasedAt: purchase.purchasedAt,
      paidVia: purchase.paidVia,
      amount: purchase.amount,
      course: purchase.course,
    };
  }

  /**
   * Student kurs sotib oladi
   */
  async purchaseCourse(dto: PurchaseCourseDto, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    // Check if already purchased
    const existingPurchase = await this.prisma.purchasedCourse.findFirst({
      where: { userId, courseId: dto.courseId },
    });

    if (existingPurchase) {
      throw new ConflictException('Siz bu kursni allaqachon sotib olgansiz');
    }

    const purchase = await this.prisma.purchasedCourse.create({
      data: {
        courseId: dto.courseId,
        userId,
        paidVia: 'CASH',
        amount: course.price,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Kurs muvaffaqiyatli sotib olindi',
      purchase,
    };
  }

  /**
   * Kursni sotib olgan studentlar ro'yxati (MENTOR, ADMIN)
   */
  async getCourseStudents(
    courseId: string,
    userId: string,
    userRole: UserRole,
    query: QueryCourseStudentsDto,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    // Mentor faqat o'z kurslarini ko'ra oladi
    if (userRole === UserRole.MENTOR && course.mentorId !== userId) {
      throw new ForbiddenException("Bu kursga ruxsat yo'q");
    }

    const { offset = 0, limit = 8, search } = query;

    const userWhere: any = {};
    if (search) {
      userWhere.fullName = { contains: search, mode: 'insensitive' };
    }

    const where: any = {
      courseId,
      user: userWhere,
    };

    const [purchases, total] = await Promise.all([
      this.prisma.purchasedCourse.findMany({
        where,
        skip: +offset,
        take: +limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { purchasedAt: 'desc' },
      }),
      this.prisma.purchasedCourse.count({ where }),
    ]);

    const students = purchases.map((p) => ({
      ...p.user,
      purchasedAt: p.purchasedAt,
      paidVia: p.paidVia,
      amount: p.amount,
    }));

    return {
      students,
      total,
      offset: +offset,
      limit: +limit,
    };
  }

  /**
   * Admin tomonidan student uchun kurs yaratish
   */
  async createPurchasedCourse(dto: CreatePurchasedCourseDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const user = await this.prisma.user.findFirst({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    if (user.role !== UserRole.STUDENT) {
      throw new BadRequestException('Faqat studentlarga kurs biriktiriladi');
    }

    // Check if already purchased
    const existingPurchase = await this.prisma.purchasedCourse.findFirst({
      where: { userId: user.id, courseId: dto.courseId },
    });

    if (existingPurchase) {
      throw new ConflictException(
        'Bu student allaqachon bu kursni sotib olgan',
      );
    }

    const purchase = await this.prisma.purchasedCourse.create({
      data: {
        courseId: dto.courseId,
        userId: user.id,
        paidVia: 'CASH',
        amount: course.price,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return {
      message: 'Kurs studentga biriktirildi',
      purchase,
    };
  }
}
