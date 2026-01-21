import {
  Controller,
  Get,
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
import { UsersService } from './users.service';
import { UpdateUserDto, QueryUserDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiOperation({ summary: "Barcha foydalanuvchilar ro'yxati" })
  @ApiResponse({ status: 200, description: "Foydalanuvchilar ro'yxati" })
  async findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: "Foydalanuvchi ma'lumotlarini olish" })
  @ApiResponse({ status: 200, description: "Foydalanuvchi ma'lumotlari" })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: "Foydalanuvchi ma'lumotlarini yangilash" })
  @ApiResponse({ status: 200, description: 'Yangilangan foydalanuvchi' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') currentUserRole: UserRole,
  ) {
    return this.usersService.update(id, dto, currentUserId, currentUserRole);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Foydalanuvchini o'chirish" })
  @ApiResponse({ status: 200, description: "Foydalanuvchi o'chirildi" })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
