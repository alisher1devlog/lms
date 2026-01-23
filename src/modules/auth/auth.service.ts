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
import { LoginDto, RegisterDto, ResetPasswordDto } from './dto';
import { UserRole, OTPType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Login
   */
  async login(dto: LoginDto) {
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

    // lastActivity ni yangilash
    await this.prisma.lastActivity.upsert({
      where: { userId: user.id },
      update: { updatedAt: new Date() },
      create: { userId: user.id },
    });

    const tokens = this.generateTokens(user.id, user.phone);

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  /**
   * Register (OTP bilan)
   */
  async register(dto: RegisterDto) {
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
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          phone,
          password: hashedPassword,
          fullName,
          role: UserRole.STUDENT,
        },
      });

      await tx.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      // lastActivity yaratish
      await tx.lastActivity.create({
        data: { userId: newUser.id },
      });

      return newUser;
    });

    const tokens = this.generateTokens(user.id, user.phone);

    return {
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  /**
   * Parolni tiklash (OTP bilan)
   */
  async resetPassword(dto: ResetPasswordDto) {
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
    } catch {
      throw new UnauthorizedException(
        "Noto'g'ri yoki muddati o'tgan refresh token",
      );
    }
  }

  /**
   * Joriy foydalanuvchi ma'lumotlarini olish
   */
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

  private excludePassword(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
