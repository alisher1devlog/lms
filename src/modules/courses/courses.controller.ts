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
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  QueryCourseDto,
  PurchaseCourseDto,
  AssignCourseDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Courses')
@Controller('api/courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: "Barcha kurslar ro'yxati" })
  @ApiResponse({ status: 200, description: "Kurslar ro'yxati" })
  async findAll(@Query() query: QueryCourseDto) {
    return this.coursesService.findAll(query);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mening kurslarim' })
  @ApiResponse({
    status: 200,
    description: 'Sotib olingan va biriktirilgan kurslar',
  })
  async getMyCourses(@CurrentUser('id') userId: number) {
    return this.coursesService.getMyCourses(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Kurs ma'lumotlarini olish" })
  @ApiResponse({ status: 200, description: "Kurs ma'lumotlari" })
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi kurs yaratish' })
  @ApiResponse({ status: 201, description: 'Kurs yaratildi' })
  async create(
    @Body() dto: CreateCourseDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.coursesService.create(dto, userId);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kursni yangilash' })
  @ApiResponse({ status: 200, description: 'Kurs yangilandi' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.coursesService.update(id, dto, userId, userRole);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Kursni o'chirish" })
  @ApiResponse({ status: 200, description: "Kurs o'chirildi" })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.coursesService.remove(id, userId, userRole);
  }

  @Get(':id/students')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kurs talabalari' })
  @ApiResponse({ status: 200, description: "Talabalar ro'yxati" })
  async getStudents(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.coursesService.getStudents(id, userId, userRole);
  }

  @Post(':id/purchase')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kursni sotib olish' })
  @ApiResponse({ status: 201, description: 'Kurs sotib olindi' })
  async purchase(
    @Param('id') id: string,
    @Body() dto: PurchaseCourseDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.coursesService.purchase(id, userId, dto);
  }

  @Post(':id/assign')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSISTANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kursni talabaga biriktirish' })
  @ApiResponse({ status: 201, description: 'Kurs biriktirildi' })
  async assign(@Param('id') id: string, @Body() dto: AssignCourseDto) {
    return this.coursesService.assign(id, dto);
  }
}
