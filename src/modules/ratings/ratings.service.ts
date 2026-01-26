import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRatingDto } from './dto';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async getLatestRatings(limit: number = 10) {
    const ratings = await this.prisma.rating.findMany({
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            image: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            banner: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { ratings };
  }

  async createRating(dto: CreateRatingDto, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    // Check if user has purchased or assigned course
    const hasAccess = await this.hasAccessToCourse(userId, dto.courseId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'Faqat kursni sotib olgan foydalanuvchilar baho bera oladi',
      );
    }

    // Check if user already rated
    const existingRating = await this.prisma.rating.findFirst({
      where: { courseId: dto.courseId, userId },
    });

    if (existingRating) {
      throw new ConflictException('Siz allaqachon baho bergansiz');
    }

    const rating = await this.prisma.rating.create({
      data: {
        rate: dto.rate,
        comment: dto.comment,
        courseId: dto.courseId,
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

  async getRatingsByCourse(
    courseId: string,
    offset: number = 0,
    limit: number = 8,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const [ratings, total, avgRating] = await Promise.all([
      this.prisma.rating.findMany({
        where: { courseId },
        skip: offset,
        take: limit,
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
      offset,
      limit,
      average: avgRating._avg.rate || 0,
    };
  }

  async getRatingAnalytics(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const [total, avgRating, distribution] = await Promise.all([
      this.prisma.rating.count({ where: { courseId } }),
      this.prisma.rating.aggregate({
        where: { courseId },
        _avg: { rate: true },
      }),
      this.prisma.rating.groupBy({
        by: ['rate'],
        where: { courseId },
        _count: { rate: true },
      }),
    ]);

    // Format distribution
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    distribution.forEach((d) => {
      ratingDistribution[d.rate] = d._count.rate;
    });

    return {
      courseId,
      totalRatings: total,
      averageRating: avgRating._avg.rate || 0,
      distribution: ratingDistribution,
    };
  }

  async deleteRating(id: string) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException('Baho topilmadi');
    }

    await this.prisma.rating.delete({ where: { id } });

    return { message: "Baho o'chirildi" };
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
