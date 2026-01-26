import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../../upload/upload.service';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  // Public file - no auth required
  async getPublicFile(name: string) {
    // Return the public file URL from storage
    const fileUrl = this.uploadService.getFileUrl('banners', name);
    return { url: fileUrl };
  }

  // Private lesson file - requires auth and course access
  async getLessonFile(lessonId: string, name: string, userId: string) {
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

    // Check access to course
    const hasAccess = await this.hasAccessToCourse(
      userId,
      lesson.group.courseId,
    );
    if (!hasAccess) {
      throw new ForbiddenException("Bu faylga kirish huquqi yo'q");
    }

    const fileUrl = this.uploadService.getFileUrl('files', name);
    return { url: fileUrl };
  }

  // Private video file - requires auth and course access
  async getVideoFile(lessonId: string, hlsf: string, userId: string) {
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

    // Check access to course
    const hasAccess = await this.hasAccessToCourse(
      userId,
      lesson.group.courseId,
    );
    if (!hasAccess) {
      throw new ForbiddenException("Bu videoga kirish huquqi yo'q");
    }

    const fileUrl = this.uploadService.getFileUrl('videos', hlsf);
    return { url: fileUrl };
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
