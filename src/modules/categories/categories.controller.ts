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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from './dto';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Course Category')
@Controller('api/course-category')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get('all')
  @ApiOperation({ summary: 'Barcha kategoriyalar (Public)' })
  @ApiResponse({ status: 200, description: "Kategoriyalar ro'yxati" })
  async findAll(@Query() query: QueryCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get('single/:id')
  @ApiOperation({ summary: 'Bitta kategoriya (Public)' })
  @ApiResponse({ status: 200, description: "Kategoriya ma'lumotlari" })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi kategoriya yaratish (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Kategoriya yaratildi' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kategoriyani yangilash (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Kategoriya yangilandi' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Kategoriyani o'chirish (ADMIN)" })
  @ApiResponse({ status: 200, description: "Kategoriya o'chirildi" })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
