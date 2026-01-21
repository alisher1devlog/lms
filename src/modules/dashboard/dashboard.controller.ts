import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Dashboard')
@Controller('api/dashboard')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin dashboard' })
  @ApiResponse({ status: 200, description: 'Admin statistikasi' })
  async getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('mentor')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Mentor dashboard' })
  @ApiResponse({ status: 200, description: 'Mentor statistikasi' })
  async getMentorDashboard(@CurrentUser('id') mentorId: string) {
    return this.dashboardService.getMentorDashboard(mentorId);
  }

  @Get('student')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Student dashboard' })
  @ApiResponse({ status: 200, description: 'Student statistikasi' })
  async getStudentDashboard(@CurrentUser('id') studentId: string) {
    return this.dashboardService.getStudentDashboard(studentId);
  }
}
