import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryCategoryDto) {
    const { offset = 0, limit = 10, search } = query;

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [categories, total] = await Promise.all([
      this.prisma.courseCategory.findMany({
        where,
        skip: +offset,
        take: +limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { courses: true },
          },
        },
      }),
      this.prisma.courseCategory.count({ where }),
    ]);

    return {
      categories,
      total,
      offset: +offset,
      limit: +limit,
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true },
        },
        courses: {
          where: { published: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            banner: true,
            price: true,
            level: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategoriya topilmadi');
    }

    return { category };
  }

  async create(dto: CreateCategoryDto) {
    // Bir xil nomli kategoriya mavjudligini tekshirish
    const existing = await this.prisma.courseCategory.findFirst({
      where: { name: { equals: dto.name, mode: 'insensitive' } },
    });

    if (existing) {
      throw new ConflictException('Bu nomli kategoriya allaqachon mavjud');
    }

    const category = await this.prisma.courseCategory.create({
      data: dto,
    });

    return { category };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Kategoriya topilmadi');
    }

    // Bir xil nomli boshqa kategoriya mavjudligini tekshirish
    if (dto.name) {
      const existing = await this.prisma.courseCategory.findFirst({
        where: {
          name: { equals: dto.name, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Bu nomli kategoriya allaqachon mavjud');
      }
    }

    const updatedCategory = await this.prisma.courseCategory.update({
      where: { id },
      data: dto,
    });

    return { category: updatedCategory };
  }

  async remove(id: string) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategoriya topilmadi');
    }

    // Kategoriya o'chirilganda kurslar qoladi (categoryId = null bo'ladi)
    await this.prisma.courseCategory.delete({ where: { id } });

    return {
      message: "Kategoriya o'chirildi",
      affectedCourses: category._count.courses,
    };
  }
}
