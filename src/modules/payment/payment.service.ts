import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckoutDto } from './dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async checkout(dto: CheckoutDto, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    // Check if already purchased
    const existingPurchase = await this.prisma.purchasedCourse.findFirst({
      where: {
        userId,
        courseId: dto.courseId,
      },
    });

    if (existingPurchase) {
      throw new BadRequestException('Bu kurs allaqachon sotib olingan');
    }

    // TODO: Integrate with payment gateway (Click, Payme, etc.)
    // For now, we'll create a purchase record

    const purchase = await this.prisma.purchasedCourse.create({
      data: {
        user: { connect: { id: userId } },
        course: { connect: { id: dto.courseId } },
        paidVia: dto.paidVia,
        amount: dto.amount || course.price,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    return {
      message: "To'lov muvaffaqiyatli amalga oshirildi",
      purchase,
    };
  }
}
