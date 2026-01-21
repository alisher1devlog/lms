import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existingUser) {
      throw new ConflictException(
        "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        password: hashedPassword,
        fullName: dto.fullName,
        role: dto.role,
      },
    });

    const token = this.generateToken(user.id, user.phone);

    return {
      user: this.excludePassword(user),
      token,
    };
  }

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

    const token = this.generateToken(user.id, user.phone);

    return {
      user: this.excludePassword(user),
      token,
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        mentorProfile: true,
      },
    });

    return { user: this.excludePassword(user) };
  }

  private generateToken(userId: number, phone: string): string {
    return this.jwtService.sign({ sub: userId, phone });
  }

  private excludePassword(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
