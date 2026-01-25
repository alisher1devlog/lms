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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  QueryCourseDto,
  AssignAssistantDto,
  UnassignAssistantDto,
  UpdateCourseMentorDto,
} from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Courses')
@Controller('api/courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: "Barcha kurslar ro'yxati (Public)" })
  @ApiResponse({ status: 200, description: "Kurslar ro'yxati" })
  async findAll(@Query() query: QueryCourseDto) {
    return this.coursesService.findAll(query);
  }

  @Get('single/:id')
  @ApiOperation({ summary: "Kurs ma'lumotlarini olish (Public)" })
  @ApiResponse({ status: 200, description: "Kurs ma'lumotlari" })
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Get('single-full/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin, Mentor, Assistant' })
  @ApiResponse({ status: 200, description: "Kursning to'liq ma'lumotlari" })
  async findOneFull(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.coursesService.findOneFull(id, userId, userRole);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin - Barcha kurslar' })
  @ApiResponse({ status: 200, description: "Barcha kurslar ro'yxati" })
  async findAllAdmin(@Query() query: QueryCourseDto) {
    return this.coursesService.findAllAdmin(query);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mentor, Admin' })
  @ApiResponse({ status: 200, description: '' })
  async getMyCourses(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.coursesService.getMyCourses(userId, userRole);
  }

  @Get('mentor/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin - Mentor kurslari' })
  @ApiResponse({ status: 200, description: 'Mentor kurslari' })
  async getMentorCourses(
    @Param('id') mentorId: string,
    @Query() query: QueryCourseDto,
  ) {
    return this.coursesService.getMentorCourses(mentorId, query);
  }

  @Get('my/assigned')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ASSISTANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assistant' })
  @ApiResponse({ status: 200, description: 'Biriktirilgan kurslar' })
  async getMyAssignedCourses(@CurrentUser('id') userId: string) {
    return this.coursesService.getAssignedCourses(userId);
  }

  @Get(':courseId/assistants')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kurs assistantlari' })
  @ApiResponse({ status: 200, description: "Assistantlar ro'yxati" })
  async getCourseAssistants(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.coursesService.getCourseAssistants(courseId, userId, userRole);
  }

  @Post('assign-assistant')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assistantni kursga biriktirish' })
  @ApiResponse({ status: 201, description: 'Assistant biriktirildi' })
  async assignAssistant(
    @Body() dto: AssignAssistantDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.coursesService.assignAssistant(dto, userId, userRole);
  }

  @Post('unassign-assistant')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assistantni kursdan chiqarish' })
  @ApiResponse({ status: 200, description: 'Assistant chiqarildi' })
  async unassignAssistant(
    @Body() dto: UnassignAssistantDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.coursesService.unassignAssistant(dto, userId, userRole);
  }

  @Post('create')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'introVideo', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Yangi kurs yaratish' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'about', 'price', 'level', 'categoryId', 'banner'],
      properties: {
        name: {
          type: 'string',
          example: "Nimadir yozsangiz kurs nomini qoysangiz bo'ladi",
        },
        about: { type: 'string', example: "Kurs haqida qisqacha ma'lumot" },
        price: { type: 'string', example: 'Narx yozish kerak' },
        level: {
          type: 'string',
          enum: [
            'BEGINNER',
            'PRE_INTERMEDIATE',
            'INTERMEDIATE',
            'UPPER_INTERMEDIATE',
            'ADVANCED',
          ],
        },
        categoryId: { type: 'string', example: 'uuid-category-id' },
        banner: { type: 'string', format: 'binary' },
        introVideo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Kurs yaratildi' })
  async create(
    @Body() dto: CreateCourseDto,
    @CurrentUser('id') userId: string,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      introVideo?: Express.Multer.File[];
    },
  ) {
    return this.coursesService.create(
      dto,
      userId,
      files?.banner?.[0],
      files?.introVideo?.[0],
    );
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kursni yangilash' })
  @ApiResponse({ status: 200, description: 'Kurs yangilandi' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.coursesService.update(id, dto, userId, userRole);
  }

  @Patch('update-mentor')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kurs mentorini almashtirish' })
  @ApiResponse({ status: 200, description: 'Mentor almashtirildi' })
  async updateMentor(@Body() dto: UpdateCourseMentorDto) {
    return this.coursesService.updateMentor(dto);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Kursni o'chirish" })
  @ApiResponse({ status: 200, description: "Kurs o'chirildi" })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.coursesService.remove(id, userId, userRole);
  }
}
