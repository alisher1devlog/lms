import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto';

@ApiTags('Contact')
@Controller('api/contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: "Bog'lanish uchun xabar yuborish" })
  @ApiResponse({ status: 201, description: 'Xabar yuborildi' })
  async create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }
}
