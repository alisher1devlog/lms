import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContactDto) {
    // TODO: Store contact in database if Contact model exists
    // For now, we'll just log it and return success

    this.logger.log(
      `New contact message from ${dto.name} (${dto.phone}): ${dto.message}`,
    );

    // TODO: Send notification to admin (email, telegram, etc.)

    return {
      message:
        "Xabaringiz muvaffaqiyatli yuborildi. Tez orada siz bilan bog'lanamiz!",
    };
  }
}
