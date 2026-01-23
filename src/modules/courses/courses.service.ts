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
  AssignAssistantDto,
  UnassignAssistantDto,
  UpdateCourseMentorDto,
} from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryCourseDto) {
    const {
      category_id,
      mentor_id,
      level,
      search,
      price_min,
      price_max,
      offset = 0,
      limit = 8,
    } = query;

    const where: any = {
      published: true, // Public endpoint faqat published kurslarni ko'rsatadi
    };

    if (category_id) where.categoryId = category_id;
    if (mentor_id) where.mentorId = mentor_id;
    if (level) where.level = level;
    if (price_min !== undefined || price_max !== undefined) {
      where.price = {};
      if (price_min !== undefined) where.price.gte = price_min;
      if (price_max !== undefined) where.price.lte = price_max;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { about: { contains: search, mode: 'insensitive' } },
      ];
    }

    const courses = await this.prisma.course.findMany({
      where,
      skip: +offset,
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
    });

    // Hech narsa topilmasa bo'sh array qaytaradi
    return courses;
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

  /**
   * To'liq kurs ma'lumotlari (ADMIN, MENTOR, ASSISTANT)
   */
  async findOneFull(id: string, userId: string, userRole: UserRole) {
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
        assignedCourses: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
        lessonGroups: {
          include: {
            lessons: true,
          },
        },
        purchasedCourses: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
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
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    // Mentor faqat o'z kurslarini ko'ra oladi
    if (userRole === UserRole.MENTOR && course.mentorId !== userId) {
      throw new ForbiddenException("Bu kursga ruxsat yo'q");
    }

    // Assistant faqat biriktirilgan kurslarni ko'ra oladi
    if (userRole === UserRole.ASSISTANT) {
      const isAssigned = course.assignedCourses.some(
        (ac) => ac.user.id === userId && ac.user.role === UserRole.ASSISTANT,
      );
      if (!isAssigned) {
        throw new ForbiddenException("Bu kursga ruxsat yo'q");
      }
    }

    const avgRating = await this.prisma.rating.aggregate({
      where: { courseId: id },
      _avg: { rate: true },
    });

    return {
      course,
      averageRating: avgRating._avg.rate || 0,
    };
  }

  /**
   * Barcha kurslar (ADMIN) - published/unpublished hammasi
   */
  async findAllAdmin(query: QueryCourseDto) {
    const {
      category_id,
      mentor_id,
      level,
      published,
      search,
      price_min,
      price_max,
      offset = 0,
      limit = 8,
    } = query;

    const where: any = {};

    if (category_id) where.categoryId = category_id;
    if (mentor_id) where.mentorId = mentor_id;
    if (level) where.level = level;
    if (published !== undefined) where.published = published === 'true';
    if (price_min !== undefined || price_max !== undefined) {
      where.price = {};
      if (price_min !== undefined) where.price.gte = price_min;
      if (price_max !== undefined) where.price.lte = price_max;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { about: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip: +offset,
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
              assignedCourses: true,
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
      offset: +offset,
      limit: +limit,
    };
  }

  async create(
    dto: CreateCourseDto,
    mentorId: string,
    bannerFile?: Express.Multer.File,
    introVideoFile?: Express.Multer.File,
  ) {
    // TODO: Fayllarni saqlash logikasi (S3, local storage va h.k.)
    // Hozircha placeholder URL
    const bannerUrl = bannerFile
      ? `/uploads/courses/banners/${Date.now()}-${bannerFile.originalname}`
      : 'https://placeholder.com/banner.jpg';
    const introVideoUrl = introVideoFile
      ? `/uploads/courses/videos/${Date.now()}-${introVideoFile.originalname}`
      : undefined;

    const course = await this.prisma.course.create({
      data: {
        name: dto.name,
        about: dto.about,
        price: dto.price,
        level: dto.level,
        categoryId: dto.categoryId,
        banner: bannerUrl,
        introVideo: introVideoUrl,
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

  /**
   * Kursni nashr qilish (ADMIN)
   */
  async publish(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id },
      data: { published: true },
    });

    return {
      message: 'Kurs nashr qilindi',
      course: updatedCourse,
    };
  }

  /**
   * Kursni nashrdan olish (ADMIN)
   */
  async unpublish(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id },
      data: { published: false },
    });

    return {
      message: 'Kurs nashrdan olindi',
      course: updatedCourse,
    };
  }

  /**
   * Kurs mentorini almashtirish (ADMIN)
   */
  async updateMentor(dto: UpdateCourseMentorDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const mentor = await this.prisma.user.findUnique({
      where: { id: dto.mentorId },
    });

    if (!mentor || mentor.role !== UserRole.MENTOR) {
      throw new NotFoundException('Mentor topilmadi');
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id: dto.courseId },
      data: { mentorId: dto.mentorId },
      include: {
        mentor: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return {
      message: 'Kurs mentori almashtirildi',
      course: updatedCourse,
    };
  }

  async update(
    id: string,
    dto: UpdateCourseDto,
    userId: string,
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

  async remove(id: string, userId: string, userRole: UserRole) {
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

  async getMyCourses(userId: string, userRole: UserRole) {
    // Mentor o'z kurslarini ko'radi
    if (userRole === UserRole.MENTOR) {
      const courses = await this.prisma.course.findMany({
        where: { mentorId: userId },
        include: {
          category: true,
          _count: {
            select: {
              lessonGroups: true,
              purchasedCourses: true,
              assignedCourses: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return { courses };
    }

    // Admin barcha kurslarni ko'radi
    if (userRole === UserRole.ADMIN) {
      const courses = await this.prisma.course.findMany({
        include: {
          category: true,
          mentor: {
            select: {
              id: true,
              fullName: true,
            },
          },
          _count: {
            select: {
              lessonGroups: true,
              purchasedCourses: true,
              assignedCourses: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return { courses };
    }

    return { courses: [] };
  }

  /**
   * Mentor kurslari (ADMIN)
   */
  async getMentorCourses(mentorId: string) {
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
    });

    if (!mentor || mentor.role !== UserRole.MENTOR) {
      throw new NotFoundException('Mentor topilmadi');
    }

    const courses = await this.prisma.course.findMany({
      where: { mentorId },
      include: {
        category: true,
        _count: {
          select: {
            lessonGroups: true,
            purchasedCourses: true,
            assignedCourses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { courses, mentor: { id: mentor.id, fullName: mentor.fullName } };
  }

  /**
   * Assistant biriktirilgan kurslar (ASSISTANT)
   */
  async getAssignedCourses(userId: string) {
    const assignments = await this.prisma.assignedCourse.findMany({
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
                purchasedCourses: true,
              },
            },
          },
        },
      },
    });

    const courses = assignments.map((a) => ({
      ...a.course,
      assignedAt: a.createdAt,
    }));

    return { courses };
  }

  /**
   * Kurs assistantlari (MENTOR, ADMIN)
   */
  async getCourseAssistants(
    courseId: string,
    userId: string,
    userRole: UserRole,
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

    const assignments = await this.prisma.assignedCourse.findMany({
      where: {
        courseId,
        user: {
          role: UserRole.ASSISTANT,
        },
      },
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
    });

    const assistants = assignments.map((a) => ({
      ...a.user,
      assignedAt: a.createdAt,
    }));

    return { assistants };
  }

  /**
   * Assistantni kursga biriktirish (MENTOR, ADMIN)
   */
  async assignAssistant(
    dto: AssignAssistantDto,
    userId: string,
    userRole: UserRole,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    // Mentor faqat o'z kurslariga assistant biriktira oladi
    if (userRole === UserRole.MENTOR && course.mentorId !== userId) {
      throw new ForbiddenException("Bu kursga ruxsat yo'q");
    }

    const assistant = await this.prisma.user.findUnique({
      where: { id: dto.assistantId },
    });

    if (!assistant || assistant.role !== UserRole.ASSISTANT) {
      throw new NotFoundException('Assistant topilmadi');
    }

    const existingAssignment = await this.prisma.assignedCourse.findUnique({
      where: {
        userId_courseId: {
          userId: dto.assistantId,
          courseId: dto.courseId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('Bu assistant allaqachon biriktirilgan');
    }

    const assignment = await this.prisma.assignedCourse.create({
      data: {
        userId: dto.assistantId,
        courseId: dto.courseId,
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

    return {
      message: 'Assistant biriktirildi',
      assignment,
    };
  }

  /**
   * Assistantni kursdan chiqarish (MENTOR, ADMIN)
   */
  async unassignAssistant(
    dto: UnassignAssistantDto,
    userId: string,
    userRole: UserRole,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    // Mentor faqat o'z kurslaridan assistant chiqara oladi
    if (userRole === UserRole.MENTOR && course.mentorId !== userId) {
      throw new ForbiddenException("Bu kursga ruxsat yo'q");
    }

    const assignment = await this.prisma.assignedCourse.findUnique({
      where: {
        userId_courseId: {
          userId: dto.assistantId,
          courseId: dto.courseId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Bu assistant kursga biriktirilmagan');
    }

    await this.prisma.assignedCourse.delete({
      where: {
        userId_courseId: {
          userId: dto.assistantId,
          courseId: dto.courseId,
        },
      },
    });

    return { message: 'Assistant kursdan chiqarildi' };
  }

  async hasAccessToCourse(userId: string, courseId: string): Promise<boolean> {
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
