import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateActivityDto } from './dto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async getLastActivity(userId: string) {
    const activity = await this.prisma.lastActivity.findUnique({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            banner: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        lesson: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { activity };
  }

  async updateActivity(userId: string, dto: UpdateActivityDto) {
    const activity = await this.prisma.lastActivity.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        lesson: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { activity };
  }
}
