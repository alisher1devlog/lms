import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  UpdatePasswordDto,
  UpdatePhoneDto,
  UpdateMentorProfileDto,
  UpdateLastActivityDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Profile')
@Controller('api/my')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProfileController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: "Profil ma'lumotlarini olish" })
  @ApiResponse({ status: 200, description: "Profil ma'lumotlari" })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: "Profil ma'lumotlarini yangilash" })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', example: 'John Doe' },
        image: { type: 'string', format: 'binary' },
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Yangilangan profil' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(userId, dto, image);
  }

  @Get('last-activity')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Student' })
  @ApiResponse({ status: 200, description: 'Oxirgi faoliyat vaqtini olish' })
  async getLastActivity(@CurrentUser('id') userId: string) {
    return this.usersService.getLastActivity(userId);
  }

  @Put('last-activity')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Student' })
  @ApiResponse({ status: 200, description: 'Yangilangan faoliyat vaqti' })
  async updateLastActivity(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateLastActivityDto,
  ) {
    return this.usersService.updateLastActivity(userId, dto);
  }

  @Post('phone/update')
  @ApiOperation({
    summary: 'Telefon raqamni yangilash',
    description: 'OTP verification',
  })
  @ApiResponse({ status: 200, description: 'Telefon raqam yangilandi' })
  async updatePhone(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePhoneDto,
  ) {
    return this.usersService.updatePhone(userId, dto);
  }

  @Patch('password/update')
  @ApiOperation({ summary: 'Parolni yangilash' })
  @ApiResponse({ status: 200, description: 'Parol yangilandi' })
  async updatePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(userId, dto);
  }

  @Patch('mentor-profile')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Mentor' })
  @ApiResponse({ status: 200, description: 'Mentor profili yangilandi' })
  async updateMentorProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateMentorProfileDto,
  ) {
    return this.usersService.updateMentorProfile(userId, dto);
  }
}
