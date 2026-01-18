import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.courseCategory.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    return { categories };
  }

  async create(dto: CreateCategoryDto) {
    const category = await this.prisma.courseCategory.create({
      data: dto,
    });

    return { category };
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Kategoriya topilmadi');
    }

    const updatedCategory = await this.prisma.courseCategory.update({
      where: { id },
      data: dto,
    });

    return { category: updatedCategory };
  }

  async remove(id: number) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Kategoriya topilmadi');
    }

    await this.prisma.courseCategory.delete({ where: { id } });

    return { message: "Kategoriya o'chirildi" };
  }
}
