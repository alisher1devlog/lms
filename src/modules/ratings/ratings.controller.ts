import {
  Controller,
  Get,
  Post,
  Put,
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
  ApiQuery,
} from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { CreateRatingDto, UpdateRatingDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Course Rating')
@Controller('api/course-rating')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Eng yangi baholar' })
  @ApiResponse({ status: 200, description: 'Eng yangi baholar' })
  async getLatestRatings() {
    return this.ratingsService.getLatestRatings();
  }

  @Get('list/:course_id')
  @ApiOperation({ summary: 'Kurs baholari' })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiQuery({ name: 'limit', required: false, example: 8 })
  @ApiResponse({ status: 200, description: "Baholar ro'yxati" })
  async getRatingsByCourse(
    @Param('course_id') courseId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ratingsService.getRatingsByCourse(
      courseId,
      offset ? parseInt(offset) : 0,
      limit ? parseInt(limit) : 8,
    );
  }

  @Get('analytics/:course_id')
  @ApiOperation({ summary: 'Kurs baho analitikasi' })
  @ApiResponse({ status: 200, description: 'Baho analitikasi' })
  async getRatingAnalytics(@Param('course_id') courseId: string) {
    return this.ratingsService.getRatingAnalytics(courseId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kursga baho berish, STUDENT' })
  @ApiResponse({ status: 201, description: 'Baho berildi' })
  async createRating(
    @Body() dto: CreateRatingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.ratingsService.createRating(dto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Bahoni o'chirish, ADMIN" })
  @ApiResponse({ status: 200, description: "Baho o'chirildi" })
  async deleteRating(@Param('id') id: string) {
    return this.ratingsService.deleteRating(id);
  }
}
