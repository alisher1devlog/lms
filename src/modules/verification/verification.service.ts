import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../../sms/sms.service';
import { OTPType } from '@prisma/client';
import { SendVerificationDto, VerifyOtpDto, VerificationType } from './dto';

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
  ) {}

  /**
   * VerificationType ni OTPType ga o'girish
   */
  private mapVerificationTypeToOTPType(type: VerificationType): OTPType {
    switch (type) {
      case VerificationType.REGISTER:
        return OTPType.REGISTRATION;
      case VerificationType.RESET_PASSWORD:
        return OTPType.PASSWORD_RESET;
      case VerificationType.EDIT_PHONE:
        return OTPType.PHONE_CHANGE;
      default:
        return OTPType.REGISTRATION;
    }
  }

  /**
   * OTP kod generatsiya qilish (6 xonali)
   */
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * OTP yuborish
   */
  async sendVerification(dto: SendVerificationDto) {
    const { phone, type } = dto;
    const otpType = this.mapVerificationTypeToOTPType(type);

    // Agar ro'yxatdan o'tish uchun bo'lsa, telefon band emasligini tekshirish
    if (type === VerificationType.REGISTER) {
      const existingUser = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (existingUser) {
        throw new ConflictException(
          "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
        );
      }
    }

    // Agar parol tiklash yoki telefon o'zgartirish uchun bo'lsa, foydalanuvchi borligini tekshirish
    if (type === VerificationType.RESET_PASSWORD) {
      const existingUser = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (!existingUser) {
        throw new NotFoundException(
          'Bu telefon raqam bilan foydalanuvchi topilmadi',
        );
      }
    }

    // Oxirgi 1 daqiqa ichida yuborilgan OTP borligini tekshirish (spam oldini olish)
    const recentOtp = await this.prisma.oTP.findFirst({
      where: {
        phone,
        type: otpType,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // 1 daqiqa
        },
      },
    });

    if (recentOtp) {
      throw new BadRequestException(
        "OTP yuborilgan. Iltimos, 1 daqiqadan so'ng qayta urinib ko'ring",
      );
    }

    // Eski OTP'larni o'chirish
    await this.prisma.oTP.deleteMany({
      where: {
        phone,
        type: otpType,
      },
    });

    // Yangi OTP yaratish
    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 daqiqa

    await this.prisma.oTP.create({
      data: {
        phone,
        code,
        type: otpType,
        expiresAt,
      },
    });

    // SMS yuborish
    const smsSent = await this.smsService.sendOtp(phone, code, otpType);

    if (!smsSent) {
      throw new BadRequestException('SMS yuborishda xatolik yuz berdi');
    }

    return {
      message: 'Tasdiqlash kodi yuborildi',
      phone,
      expiresIn: 300, // 5 daqiqa (sekundlarda)
    };
  }

  /**
   * OTP tasdiqlash
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const { phone, otp, type } = dto;
    const otpType = this.mapVerificationTypeToOTPType(type);

    // OTP ni topish
    const otpRecord = await this.prisma.oTP.findFirst({
      where: {
        phone,
        code: otp,
        type: otpType,
        isUsed: false,
      },
    });

    if (!otpRecord) {
      throw new BadRequestException("Noto'g'ri tasdiqlash kodi");
    }

    // Muddati o'tganligini tekshirish
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('Tasdiqlash kodi muddati tugagan');
    }

    // OTP ni ishlatilgan deb belgilash
    await this.prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    return {
      message: 'Tasdiqlash muvaffaqiyatli',
      phone,
      type,
      verified: true,
    };
  }
}
