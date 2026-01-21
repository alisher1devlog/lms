import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { UpdateActivityDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Activity')
@Controller('api/activity')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.STUDENT)
@ApiBearerAuth()
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get('last')
  @ApiOperation({ summary: "So'nggi faoliyat" })
  @ApiResponse({ status: 200, description: "So'nggi faoliyat ma'lumotlari" })
  async getLastActivity(@CurrentUser('id') userId: string) {
    return this.activityService.getLastActivity(userId);
  }

  @Post('update')
  @ApiOperation({ summary: 'Faoliyatni yangilash' })
  @ApiResponse({ status: 200, description: 'Faoliyat yangilandi' })
  async updateActivity(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.activityService.updateActivity(userId, dto);
  }
}
