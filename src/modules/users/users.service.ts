import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QueryUserDto,
  QueryMentorDto,
  UpdateProfileDto,
  UpdatePasswordDto,
  UpdatePhoneDto,
  UpdateMentorProfileDto,
  UpdateLastActivityDto,
  CreateAdminDto,
  CreateMentorDto,
  CreateAssistantDto,
  UpdateMentorDto,
} from './dto';
import { UserRole, OTPType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMentors(query: QueryMentorDto) {
    const { offset = 0, limit = 8, search } = query;

    const where: any = { role: UserRole.MENTOR, isActive: true };

    if (search) {
      where.fullName = { contains: search, mode: 'insensitive' };
    }

    const [mentors, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: +offset,
        take: +limit,
        select: {
          id: true,
          phone: true,
          fullName: true,
          image: true,
          createdAt: true,
          mentorProfile: {
            select: {
              about: true,
              job: true,
              experience: true,
              telegram: true,
              instagram: true,
              linkedin: true,
              facebook: true,
              github: true,
              website: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      mentors,
      total,
      offset: +offset,
      limit: +limit,
    };
  }

  async getMentorById(id: string) {
    const mentor = await this.prisma.user.findFirst({
      where: { id, role: UserRole.MENTOR, isActive: true },
      select: {
        id: true,
        phone: true,
        fullName: true,
        image: true,
        createdAt: true,
        mentorProfile: {
          select: {
            about: true,
            job: true,
            experience: true,
            telegram: true,
            instagram: true,
            linkedin: true,
            facebook: true,
            github: true,
            website: true,
          },
        },
      },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor topilmadi');
    }

    return { mentor };
  }

  async findAll(query: QueryUserDto) {
    const { role, offset = 0, limit = 10, search } = query;

    const where: any = { isActive: true };

    if (role) where.role = role;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: +offset,
        take: +limit,
        select: {
          id: true,
          phone: true,
          fullName: true,
          role: true,
          image: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      offset: +offset,
      limit: +limit,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        fullName: true,
        role: true,
        image: true,
        createdAt: true,
        mentorProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    return { user };
  }

  async findByPhone(phone: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        phone: true,
        fullName: true,
        role: true,
        image: true,
        createdAt: true,
        mentorProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    return { user };
  }

  async createAdmin(dto: CreateAdminDto) {
    // Telefon band emasligini tekshirish
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existingPhone) {
      throw new ConflictException(
        "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
      );
    }

    // Email band emasligini tekshirish
    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingEmail) {
        throw new ConflictException("Bu email allaqachon ro'yxatdan o'tgan");
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const admin = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        fullName: dto.fullName,
        password: hashedPassword,
        email: dto.email,
        role: UserRole.ADMIN,
      },
      select: {
        id: true,
        phone: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: 'Admin muvaffaqiyatli yaratildi',
      user: admin,
    };
  }

  async createMentor(dto: CreateMentorDto) {
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existingPhone) {
      throw new ConflictException(
        "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
      );
    }

    // Email band emasligini tekshirish
    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingEmail) {
        throw new ConflictException("Bu email allaqachon ro'yxatdan o'tgan");
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const mentor = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        fullName: dto.fullName,
        password: hashedPassword,
        email: dto.email,
        role: UserRole.MENTOR,
        mentorProfile: {
          create: {
            about: dto.about,
            job: dto.job,
            experience: dto.experience ? parseInt(dto.experience) : 0,
            telegram: dto.telegram,
            instagram: dto.instagram,
            linkedin: dto.linkedin,
            facebook: dto.facebook,
            github: dto.github,
            website: dto.website,
          },
        },
      },
      select: {
        id: true,
        phone: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        mentorProfile: true,
      },
    });

    return {
      message: 'Mentor muvaffaqiyatli yaratildi',
      user: mentor,
    };
  }

  async createAssistant(dto: CreateAssistantDto) {
    // Telefon band emasligini tekshirish
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existingPhone) {
      throw new ConflictException(
        "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
      );
    }

    // Kurs mavjudligini tekshirish
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Transaction ichida assistant va assigned course yaratamiz
    const result = await this.prisma.$transaction(async (prisma) => {
      const assistant = await prisma.user.create({
        data: {
          phone: dto.phone,
          fullName: dto.fullName,
          password: hashedPassword,
          role: UserRole.ASSISTANT,
        },
        select: {
          id: true,
          phone: true,
          fullName: true,
          role: true,
          createdAt: true,
        },
      });

      // Assistant ni kursga biriktirish
      await prisma.assignedCourse.create({
        data: {
          userId: assistant.id,
          courseId: dto.courseId,
        },
      });

      return assistant;
    });

    return {
      message: 'Assistant muvaffaqiyatli yaratildi va kursga biriktirildi',
      user: result,
      courseId: dto.courseId,
    };
  }

  async updateMentor(id: string, dto: UpdateMentorDto) {
    const mentor = await this.prisma.user.findUnique({
      where: { id, role: UserRole.MENTOR },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor topilmadi');
    }

    // Email yangilansa tekshirish
    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException("Bu email allaqachon ro'yxatdan o'tgan");
      }
    }

    const updatedMentor = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.email && { email: dto.email }),
        ...(dto.image && { image: dto.image }),
        mentorProfile: {
          upsert: {
            create: {
              about: dto.about,
              job: dto.job,
              experience: dto.experience ? parseInt(dto.experience) : 0,
              telegram: dto.telegram,
              instagram: dto.instagram,
              linkedin: dto.linkedin,
              facebook: dto.facebook,
              github: dto.github,
              website: dto.website,
            },
            update: {
              ...(dto.about && { about: dto.about }),
              ...(dto.job && { job: dto.job }),
              ...(dto.experience && { experience: parseInt(dto.experience) }),
              ...(dto.telegram && { telegram: dto.telegram }),
              ...(dto.instagram && { instagram: dto.instagram }),
              ...(dto.linkedin && { linkedin: dto.linkedin }),
              ...(dto.facebook && { facebook: dto.facebook }),
              ...(dto.github && { github: dto.github }),
              ...(dto.website && { website: dto.website }),
            },
          },
        },
      },
      select: {
        id: true,
        phone: true,
        fullName: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        mentorProfile: true,
      },
    });

    return {
      message: 'Mentor muvaffaqiyatli yangilandi',
      user: updatedMentor,
    };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // Soft delete - foydalanuvchini inactive qilish
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: "Foydalanuvchi o'chirildi" };
  }

  // ==================== Profile Methods ====================

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    return { user };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    imageFile?: Express.Multer.File,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // Email yangilansa, uniqligi tekshirish
    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingEmail && existingEmail.id !== userId) {
        throw new ConflictException("Bu email allaqachon ro'yxatdan o'tgan");
      }
    }

    // Rasm yuklangan bo'lsa URL ga aylantirish
    let imageUrl: string | undefined;
    if (imageFile) {
      // TODO: Faylni storage ga yuklash va URL olish
      // Hozircha base64 yoki fayl nomini saqlaymiz
      imageUrl = `/uploads/profiles/${Date.now()}-${imageFile.originalname}`;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(imageUrl && { image: imageUrl }),
        ...(dto.email && { email: dto.email }),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: 'Profil muvaffaqiyatli yangilandi',
      user: updatedUser,
    };
  }

  async getLastActivity(userId: string) {
    const lastActivity = await this.prisma.lastActivity.findUnique({
      where: { userId },
    });

    if (!lastActivity) {
      return { lastActivityAt: null };
    }

    return { lastActivityAt: lastActivity.updatedAt };
  }

  async updateLastActivity(userId: string, dto: UpdateLastActivityDto) {
    const lastActivity = await this.prisma.lastActivity.upsert({
      where: { userId },
      update: {
        courseId: dto.courseId,
        groupId: dto.groupId,
        lessonId: dto.lessonId,
        url: dto.url,
        updatedAt: new Date(),
      },
      create: {
        userId,
        courseId: dto.courseId,
        groupId: dto.groupId,
        lessonId: dto.lessonId,
        url: dto.url,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Faoliyat vaqti yangilandi',
      lastActivityAt: lastActivity.updatedAt,
    };
  }

  async updatePhone(userId: string, dto: UpdatePhoneDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // OTP tekshirish
    const otpRecord = await this.prisma.oTP.findFirst({
      where: {
        phone: dto.newPhone,
        code: dto.otp,
        type: OTPType.PHONE_CHANGE,
        isUsed: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException(
        "Tasdiqlash kodi noto'g'ri yoki muddati o'tgan",
      );
    }

    // Yangi telefon band emasligini tekshirish
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: dto.newPhone },
    });

    if (existingPhone) {
      throw new ConflictException(
        "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
      );
    }

    // Telefon va OTP yangilash
    const [updatedUser] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { phone: dto.newPhone },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          role: true,
          createdAt: true,
        },
      }),
      this.prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      }),
    ]);

    return {
      message: 'Telefon raqam muvaffaqiyatli yangilandi',
      user: updatedUser,
    };
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Parollar mos kelmadi');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // Joriy parolni tekshirish
    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException("Joriy parol noto'g'ri");
    }

    // Yangi parolni hash qilish
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Parol muvaffaqiyatli yangilandi' };
  }

  async updateMentorProfile(userId: string, dto: UpdateMentorProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    if (user.role !== UserRole.MENTOR) {
      throw new ForbiddenException('Faqat mentor profili yangilashi mumkin');
    }

    const mentorProfile = await this.prisma.mentorProfile.upsert({
      where: { userId },
      update: {
        ...(dto.about && { about: dto.about }),
        ...(dto.job && { job: dto.job }),
        ...(dto.experience !== undefined && { experience: dto.experience }),
        ...(dto.telegram && { telegram: dto.telegram }),
      },
      create: {
        userId,
        about: dto.about || null,
        job: dto.job || null,
        experience: dto.experience || 0,
        telegram: dto.telegram || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      message: 'Mentor profili muvaffaqiyatli yangilandi',
      mentorProfile,
    };
  }
}
