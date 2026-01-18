import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MentorsService } from './mentors.service';
import { CreateMentorProfileDto, UpdateMentorProfileDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Mentors')
@Controller('api/mentors')
export class MentorsController {
  constructor(private mentorsService: MentorsService) {}

  @Get()
  @ApiOperation({ summary: "Barcha mentorlar ro'yxati" })
  @ApiResponse({ status: 200, description: "Mentorlar ro'yxati" })
  async findAll() {
    return this.mentorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mentor profili va kurslari' })
  @ApiResponse({ status: 200, description: "Mentor ma'lumotlari" })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mentorsService.findOne(id);
  }

  @Post('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mentor profili yaratish' })
  @ApiResponse({ status: 201, description: 'Profil yaratildi' })
  async createProfile(
    @Body() dto: CreateMentorProfileDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.mentorsService.createProfile(userId, dto);
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mentor profilini yangilash' })
  @ApiResponse({ status: 200, description: 'Profil yangilandi' })
  async updateProfile(
    @Body() dto: UpdateMentorProfileDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.mentorsService.updateProfile(userId, dto);
  }
}
