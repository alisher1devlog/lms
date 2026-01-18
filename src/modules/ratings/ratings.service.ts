import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRatingDto, UpdateRatingDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async createRating(courseId: string, dto: CreateRatingDto, userId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    // Check if user has purchased or assigned course
    const hasAccess = await this.hasAccessToCourse(userId, courseId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'Faqat kursni sotib olgan foydalanuvchilar baho bera oladi',
      );
    }

    // Check if user already rated
    const existingRating = await this.prisma.rating.findFirst({
      where: { courseId, userId },
    });

    if (existingRating) {
      throw new ConflictException('Siz allaqachon baho bergansiz');
    }

    const rating = await this.prisma.rating.create({
      data: {
        ...dto,
        courseId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            image: true,
          },
        },
      },
    });

    return { rating };
  }

  async getRatingsByCourse(courseId: string, page = 1, limit = 10) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const skip = (page - 1) * limit;

    const [ratings, total, avgRating] = await Promise.all([
      this.prisma.rating.findMany({
        where: { courseId },
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
      this.prisma.rating.count({ where: { courseId } }),
      this.prisma.rating.aggregate({
        where: { courseId },
        _avg: { rate: true },
      }),
    ]);

    return {
      ratings,
      total,
      average: avgRating._avg.rate || 0,
    };
  }

  async updateRating(id: number, dto: UpdateRatingDto, userId: number) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException('Baho topilmadi');
    }

    if (rating.userId !== userId) {
      throw new ForbiddenException("Faqat o'z bahongizni o'zgartira olasiz");
    }

    const updatedRating = await this.prisma.rating.update({
      where: { id },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            image: true,
          },
        },
      },
    });

    return { rating: updatedRating };
  }

  async deleteRating(id: number, userId: number, userRole: UserRole) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException('Baho topilmadi');
    }

    if (userRole !== UserRole.ADMIN && rating.userId !== userId) {
      throw new ForbiddenException("Bu bahoni o'chirishga ruxsat yo'q");
    }

    await this.prisma.rating.delete({ where: { id } });

    return { message: "Baho o'chirildi" };
  }

  private async hasAccessToCourse(
    userId: number,
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
