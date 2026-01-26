import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  QueryUserDto,
  QueryMentorDto,
  CreateAdminDto,
  CreateMentorDto,
  CreateAssistantDto,
  UpdateMentorDto,
} from './dto';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('mentors')
  @ApiOperation({ summary: "Barcha mentorlar ro'yxati" })
  @ApiResponse({ status: 200, description: "Mentorlar ro'yxati" })
  async getMentors(@Query() query: QueryMentorDto) {
    return this.usersService.getMentors(query);
  }

  @Get('mentors/:id')
  @ApiOperation({ summary: "Mentor ma'lumotlarini olish" })
  @ApiResponse({ status: 200, description: "Mentor ma'lumotlari" })
  async getMentorById(@Param('id') id: string) {
    return this.usersService.getMentorById(id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Barcha foydalanuvchilar ro'yxati(Admin)" })
  @ApiResponse({ status: 200, description: "Foydalanuvchilar ro'yxati" })
  async findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get('single/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Foydalanuvchi ma'lumotlarini olish(Admin)" })
  @ApiResponse({ status: 200, description: "Foydalanuvchi ma'lumotlari" })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('by-phone/:phone')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Telefon raqam bo'yicha foydalanuvchi qidirish(Admin, Mentor)",
  })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi topildi' })
  async findByPhone(@Param('phone') phone: string) {
    return this.usersService.findByPhone(phone);
  }

  @Post('create/admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi admin yaratish (Admin)' })
  @ApiResponse({ status: 201, description: 'Admin yaratildi' })
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.usersService.createAdmin(dto);
  }

  @Post('create/mentor')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi mentor yaratish (Admin)' })
  @ApiResponse({ status: 201, description: 'Mentor yaratildi' })
  async createMentor(@Body() dto: CreateMentorDto) {
    return this.usersService.createMentor(dto);
  }

  @Post('create/assistant')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi assistant yaratish (Admin, Mentor)' })
  @ApiResponse({ status: 201, description: 'Assistant yaratildi' })
  async createAssistant(@Body() dto: CreateAssistantDto) {
    return this.usersService.createAssistant(dto);
  }

  @Patch('update/mentor/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mentor ma'lumotlarini yangilash (Admin)" })
  @ApiResponse({ status: 200, description: 'Mentor yangilandi' })
  async updateMentor(@Param('id') id: string, @Body() dto: UpdateMentorDto) {
    return this.usersService.updateMentor(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Foydalanuvchini o'chirish (Admin)" })
  @ApiResponse({
    status: 200,
    description: "Foydalanuvchi o'chirildi",
  })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
