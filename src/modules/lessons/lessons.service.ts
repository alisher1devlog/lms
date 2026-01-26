import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../../upload/upload.service';
import { CreateLessonDto, UpdateLessonDto, LessonViewDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  // ===================== STUDENT METHODS =====================

  async getSingleLesson(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        group: {
          include: { course: true },
        },
        lessonFiles: true,
        homework: true,
        lessonViews: {
          where: { userId },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    // Student faqat sotib olgan kurslarni ko'ra oladi
    const purchased = await this.prisma.purchasedCourse.findFirst({
      where: { userId, courseId: lesson.group.courseId },
    });

    if (!purchased) {
      throw new ForbiddenException("Bu darsga kirish huquqi yo'q");
    }

    return {
      lesson: {
        ...lesson,
        viewed: lesson.lessonViews.length > 0 && lesson.lessonViews[0].view,
      },
      files: lesson.lessonFiles,
      homework: lesson.homework,
    };
  }

  async markAsViewed(lessonId: string, dto: LessonViewDto, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        group: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    // Student faqat sotib olgan kurslarni belgilay oladi
    const purchased = await this.prisma.purchasedCourse.findFirst({
      where: { userId, courseId: lesson.group.courseId },
    });

    if (!purchased) {
      throw new ForbiddenException("Bu darsga kirish huquqi yo'q");
    }

    const lessonView = await this.prisma.lessonView.upsert({
      where: {
        lessonId_userId: {
          lessonId,
          userId,
        },
      },
      update: { view: dto.view },
      create: {
        lessonId,
        userId,
        view: dto.view,
      },
    });

    return { lessonView };
  }

  // ===================== ADMIN & MENTOR METHODS =====================

  async getLessonDetail(id: string, userId: string, userRole: UserRole) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        group: {
          include: { course: true },
        },
        lessonFiles: true,
        homework: true,
        _count: {
          select: {
            lessonViews: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    // MENTOR faqat o'z kurslariga kirish huquqiga ega
    if (
      userRole !== UserRole.ADMIN &&
      lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Bu darsga kirish huquqi yo'q");
    }

    return {
      lesson,
      files: lesson.lessonFiles,
      homework: lesson.homework,
    };
  }

  async create(
    dto: CreateLessonDto,
    videoFile: Express.Multer.File,
    userId: string,
    userRole: UserRole,
  ) {
    const group = await this.prisma.lessonGroup.findUnique({
      where: { id: dto.groupId },
      include: { course: true },
    });

    if (!group) {
      throw new NotFoundException("Bo'lim topilmadi");
    }

    if (userRole !== UserRole.ADMIN && group.course.mentorId !== userId) {
      throw new ForbiddenException("Bu bo'limga dars qo'shishga ruxsat yo'q");
    }

    // Video URL ni aniqlash
    let videoUrl = dto.videoUrl || null;

    // Agar video fayl yuklangan bo'lsa
    if (videoFile) {
      const uploaded = await this.uploadService.uploadFile(videoFile, 'videos');
      videoUrl = uploaded.url;
    }

    const lesson = await this.prisma.lesson.create({
      data: {
        name: dto.name,
        about: dto.about,
        video: videoUrl,
        groupId: dto.groupId,
      },
    });

    return { lesson };
  }

  async update(
    id: string,
    dto: UpdateLessonDto,
    videoFile: Express.Multer.File,
    userId: string,
    userRole: UserRole,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        group: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Bu darsni o'zgartirishga ruxsat yo'q");
    }

    // Video URL ni aniqlash - fayl ustuvorlikda
    let videoUrl: string | undefined = undefined;

    // Agar video fayl yuklangan bo'lsa - fayl ustuvorlik oladi
    if (videoFile) {
      const uploaded = await this.uploadService.uploadFile(videoFile, 'videos');
      videoUrl = uploaded.url;
    } else if (dto.videoUrl) {
      // Fayl yo'q bo'lsa, videoUrl ishlatiladi
      videoUrl = dto.videoUrl;
    }

    const updatedLesson = await this.prisma.lesson.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.about && { about: dto.about }),
        ...(videoUrl && { video: videoUrl }),
      },
    });

    return { lesson: updatedLesson };
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        group: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Bu darsni o'chirishga ruxsat yo'q");
    }

    await this.prisma.lesson.delete({ where: { id } });

    return { message: "Dars o'chirildi" };
  }
}
