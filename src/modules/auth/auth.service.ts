import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../../sms/sms.service';
import {
  LoginDto,
  SendOtpDto,
  VerifyOtpDto,
  RegisterWithOtpDto,
  ResetPasswordDto,
} from './dto';
import { RegisterDto as NewRegisterDto } from './dto/new-register.dto';
import { NewLoginDto } from './dto/new-login.dto';
import { NewResetPasswordDto } from './dto/new-reset-password.dto';
import { UserRole, OTPType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private smsService: SmsService,
    private configService: ConfigService,
  ) {}

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(dto: SendOtpDto) {
    const { phone, type = OTPType.REGISTRATION } = dto;

    if (type === OTPType.REGISTRATION) {
      const existingUser = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (existingUser) {
        throw new ConflictException(
          "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
        );
      }
    }

    if (type === OTPType.PASSWORD_RESET) {
      const existingUser = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (!existingUser) {
        throw new NotFoundException(
          'Bu telefon raqam bilan foydalanuvchi topilmadi',
        );
      }
    }

    const recentOtp = await this.prisma.oTP.findFirst({
      where: {
        phone,
        type,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000),
        },
      },
    });

    if (recentOtp) {
      throw new BadRequestException(
        "OTP yuborilgan. Iltimos, 1 daqiqadan so'ng qayta urinib ko'ring",
      );
    }

    await this.prisma.oTP.deleteMany({
      where: {
        phone,
        type,
      },
    });

    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 daqiqa

    await this.prisma.oTP.create({
      data: {
        phone,
        code,
        type,
        expiresAt,
      },
    });

    const smsSent = await this.smsService.sendOtp(phone, code, type);

    if (!smsSent) {
      throw new BadRequestException('SMS yuborishda xatolik yuz berdi');
    }

    return {
      message: 'Tasdiqlash kodi yuborildi',
      phone,
      expiresIn: 300,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const { phone, code, type = OTPType.REGISTRATION } = dto;

    const otp = await this.prisma.oTP.findFirst({
      where: {
        phone,
        code,
        type,
        isUsed: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otp) {
      throw new BadRequestException(
        "Tasdiqlash kodi noto'g'ri yoki muddati o'tgan",
      );
    }

    return {
      message: "Tasdiqlash kodi to'g'ri",
      verified: true,
    };
  }

  async registerWithOtp(dto: RegisterWithOtpDto) {
    const { phone, code, email, fullName, password } = dto;

    // OTP tekshirish
    const otp = await this.prisma.oTP.findFirst({
      where: {
        phone,
        code,
        type: OTPType.REGISTRATION,
        isUsed: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otp) {
      throw new BadRequestException(
        "Tasdiqlash kodi noto'g'ri yoki muddati o'tgan",
      );
    }

    const existingUserByPhone = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUserByPhone) {
      throw new ConflictException(
        "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
      );
    }

    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new ConflictException("Bu email allaqachon ro'yxatdan o'tgan");
    }

    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash(password, 10);

    // Foydalanuvchi yaratish va OTP'ni ishlatilgan deb belgilash
    const [user] = await this.prisma.$transaction([
      this.prisma.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          fullName,
          role: UserRole.STUDENT,
        },
      }),
      this.prisma.oTP.update({
        where: { id: otp.id },
        data: { isUsed: true },
      }),
    ]);

    const token = this.generateToken(user.id, user.phone);

    return {
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
      user: this.excludePassword(user),
      token,
    };
  }

  /**
   * Parolni tiklash
   */
  async resetPassword(dto: ResetPasswordDto) {
    const { phone, code, newPassword } = dto;

    // OTP tekshirish
    const otp = await this.prisma.oTP.findFirst({
      where: {
        phone,
        code,
        type: OTPType.PASSWORD_RESET,
        isUsed: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otp) {
      throw new BadRequestException(
        "Tasdiqlash kodi noto'g'ri yoki muddati o'tgan",
      );
    }

    // Foydalanuvchini topish
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // Yangi parolni hash qilish
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Parolni yangilash va OTP'ni ishlatilgan deb belgilash
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      this.prisma.oTP.update({
        where: { id: otp.id },
        data: { isUsed: true },
      }),
    ]);

    return {
      message: 'Parol muvaffaqiyatli yangilandi',
    };
  }

  /**
   * Login
   */
  async login(dto: NewLoginDto | LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException("Telefon raqam yoki parol noto'g'ri");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Telefon raqam yoki parol noto'g'ri");
    }

    const tokens = this.generateTokens(user.id, user.phone);

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        mentorProfile: true,
      },
    });

    return { user: this.excludePassword(user) };
  }

  private generateToken(userId: string, phone: string): string {
    return this.jwtService.sign({ sub: userId, phone });
  }

  private generateRefreshToken(userId: string, phone: string): string {
    return this.jwtService.sign(
      { sub: userId, phone, type: 'refresh' },
      { expiresIn: '7d' },
    );
  }

  private generateTokens(userId: string, phone: string) {
    return {
      accessToken: this.generateToken(userId, phone),
      refreshToken: this.generateRefreshToken(userId, phone),
    };
  }

  /**
   * Refresh token orqali yangi access token olish
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException("Noto'g'ri refresh token");
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Foydalanuvchi topilmadi');
      }

      const tokens = this.generateTokens(user.id, user.phone);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException(
        "Noto'g'ri yoki muddati o'tgan refresh token",
      );
      console.error(error);
    }
  }

  /**
   * Yangi register (OTP bilan)
   */
  async registerNew(dto: NewRegisterDto) {
    const { phone, otp, fullName, password } = dto;

    // OTP tekshirish
    const otpRecord = await this.prisma.oTP.findFirst({
      where: {
        phone,
        code: otp,
        type: OTPType.REGISTRATION,
        isUsed: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException(
        "Tasdiqlash kodi noto'g'ri yoki muddati o'tgan",
      );
    }

    // Telefon raqam band emasligini tekshirish
    const existingUserByPhone = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUserByPhone) {
      throw new ConflictException(
        "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
      );
    }

    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash(password, 10);

    // Foydalanuvchi yaratish va OTP'ni ishlatilgan deb belgilash
    const [user] = await this.prisma.$transaction([
      this.prisma.user.create({
        data: {
          phone,
          password: hashedPassword,
          fullName,
          role: UserRole.STUDENT,
        },
      }),
      this.prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      }),
    ]);

    const tokens = this.generateTokens(user.id, user.phone);

    return {
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  /**
   * Yangi parolni tiklash (OTP bilan)
   */
  async resetPasswordNew(dto: NewResetPasswordDto) {
    const { phone, otp, newPassword } = dto;

    // OTP tekshirish
    const otpRecord = await this.prisma.oTP.findFirst({
      where: {
        phone,
        code: otp,
        type: OTPType.PASSWORD_RESET,
        isUsed: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException(
        "Tasdiqlash kodi noto'g'ri yoki muddati o'tgan",
      );
    }

    // Foydalanuvchini topish
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // Yangi parolni hash qilish
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Parolni yangilash va OTP'ni ishlatilgan deb belgilash
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      this.prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      }),
    ]);

    return {
      message: 'Parol muvaffaqiyatli yangilandi',
    };
  }

  private excludePassword(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
