import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../../upload/upload.service';
import { CreateLessonFileDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class LessonFilesService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async getFilesByLesson(lessonId: string, userId: string, userRole: UserRole) {
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

    // MENTOR faqat o'z kurslariga kirish huquqiga ega
    if (
      userRole !== UserRole.ADMIN &&
      lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Bu darsga kirish huquqi yo'q");
    }

    const files = await this.prisma.lessonFile.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'desc' },
    });

    return { files };
  }

  async create(
    dto: CreateLessonFileDto,
    file: Express.Multer.File,
    userId: string,
    userRole: UserRole,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
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
      throw new ForbiddenException("Bu darsga fayl qo'shishga ruxsat yo'q");
    }

    // File URL ni aniqlash
    let fileUrl: string | undefined = undefined;

    if (file) {
      const uploaded = await this.uploadService.uploadFile(file, 'files');
      fileUrl = uploaded.url;
    } else if (dto.fileUrl) {
      fileUrl = dto.fileUrl;
    }

    if (!fileUrl) {
      throw new BadRequestException('Fayl yoki fayl URL kiritilishi shart');
    }

    const lessonFile = await this.prisma.lessonFile.create({
      data: {
        file: fileUrl,
        note: dto.note,
        lessonId: dto.lessonId,
      },
    });

    return { file: lessonFile };
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const file = await this.prisma.lessonFile.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            group: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException('Fayl topilmadi');
    }

    if (
      userRole !== UserRole.ADMIN &&
      file.lesson.group.course.mentorId !== userId
    ) {
      throw new ForbiddenException("Bu faylni o'chirishga ruxsat yo'q");
    }

    await this.prisma.lessonFile.delete({ where: { id } });

    return { message: "Fayl o'chirildi" };
  }
}
