import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/new-register.dto';
import { NewLoginDto } from './dto/new-login.dto';
import { NewResetPasswordDto } from './dto/new-reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tizimga kirish' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli kirish' })
  @ApiResponse({ status: 401, description: "Noto'g'ri ma'lumotlar" })
  async login(@Body() dto: NewLoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Ro'yxatdan o'tish",
    description: 'OTP verification',
  })
  @ApiResponse({
    status: 201,
    description: "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi",
  })
  @ApiResponse({
    status: 400,
    description: "OTP noto'g'ri yoki muddati o'tgan",
  })
  @ApiResponse({
    status: 409,
    description: 'Telefon yoki email allaqachon mavjud',
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.registerNew(dto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Access tokenni yangilash' })
  @ApiResponse({ status: 200, description: 'Yangi access token' })
  @ApiResponse({ status: 401, description: "Noto'g'ri refresh token" })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Parolni tiklash',
    description: 'OTP verification',
  })
  @ApiResponse({
    status: 200,
    description: 'Parol muvaffaqiyatli yangilandi',
  })
  @ApiResponse({
    status: 400,
    description: "OTP noto'g'ri yoki muddati o'tgan",
  })
  @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi' })
  async resetPassword(@Body() dto: NewResetPasswordDto) {
    return this.authService.resetPasswordNew(dto);
  }
}
