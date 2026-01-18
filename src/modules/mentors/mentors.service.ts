import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMentorProfileDto, UpdateMentorProfileDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class MentorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const mentors = await this.prisma.user.findMany({
      where: { role: UserRole.MENTOR },
      select: {
        id: true,
        fullName: true,
        image: true,
        mentorProfile: true,
      },
    });

    return { mentors };
  }

  async findOne(id: number) {
    const mentor = await this.prisma.user.findFirst({
      where: { id, role: UserRole.MENTOR },
      select: {
        id: true,
        fullName: true,
        image: true,
        mentorProfile: true,
        courses: {
          where: { published: true },
          select: {
            id: true,
            name: true,
            about: true,
            price: true,
            banner: true,
            level: true,
            category: true,
          },
        },
      },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor topilmadi');
    }

    return {
      mentor: {
        id: mentor.id,
        fullName: mentor.fullName,
        image: mentor.image,
      },
      profile: mentor.mentorProfile,
      courses: mentor.courses,
    };
  }

  async createProfile(userId: number, dto: CreateMentorProfileDto) {
    const existingProfile = await this.prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return this.updateProfile(userId, dto);
    }

    const profile = await this.prisma.mentorProfile.create({
      data: {
        ...dto,
        userId,
      },
    });

    return { profile };
  }

  async updateProfile(userId: number, dto: UpdateMentorProfileDto) {
    const profile = await this.prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profil topilmadi');
    }

    const updatedProfile = await this.prisma.mentorProfile.update({
      where: { userId },
      data: dto,
    });

    return { profile: updatedProfile };
  }
}
