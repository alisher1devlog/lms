import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { CreateRatingDto, UpdateRatingDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Ratings')
@Controller('api')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post('courses/:courseId/ratings')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kursga baho berish' })
  @ApiResponse({ status: 201, description: 'Baho berildi' })
  async createRating(
    @Param('courseId') courseId: string,
    @Body() dto: CreateRatingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.ratingsService.createRating(courseId, dto, userId);
  }

  @Get('courses/:courseId/ratings')
  @ApiOperation({ summary: 'Kurs baholari' })
  @ApiResponse({ status: 200, description: "Baholar ro'yxati" })
  async getRatingsByCourse(
    @Param('courseId') courseId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.ratingsService.getRatingsByCourse(courseId, pageNum, limitNum);
  }

  @Put('ratings/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bahoni yangilash' })
  @ApiResponse({ status: 200, description: 'Baho yangilandi' })
  async updateRating(
    @Param('id') id: string,
    @Body() dto: UpdateRatingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.ratingsService.updateRating(id, dto, userId);
  }

  @Delete('ratings/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Bahoni o'chirish" })
  @ApiResponse({ status: 200, description: "Baho o'chirildi" })
  async deleteRating(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.ratingsService.deleteRating(id, userId, userRole);
  }
}
