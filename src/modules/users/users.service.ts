import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto, QueryUserDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryUserDto) {
    const { role, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = role ? { role } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
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
      page: +page,
      limit: +limit,
    };
  }

  async findOne(id: number) {
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

  async update(
    id: number,
    dto: UpdateUserDto,
    currentUserId: number,
    currentUserRole: UserRole,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // Faqat o'zi yoki admin o'zgartira oladi
    if (currentUserRole !== UserRole.ADMIN && currentUserId !== id) {
      throw new ForbiddenException("Ruxsat yo'q");
    }

    const updateData: any = {};

    if (dto.fullName) updateData.fullName = dto.fullName;
    if (dto.image) updateData.image = dto.image;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.password) updateData.password = await bcrypt.hash(dto.password, 10);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        phone: true,
        fullName: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    return { user: updatedUser };
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: "Foydalanuvchi o'chirildi" };
  }
}
