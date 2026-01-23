import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { SendVerificationDto, VerifyOtpDto } from './dto';

@ApiTags('Verification')
@Controller('api/verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'OTP yuborish',
    description: 'Valid types: register, reset_password, edit_phone',
  })
  @ApiBody({
    type: SendVerificationDto,
    examples: {
      register: {
        summary: 'Registration',
        value: {
          type: 'register',
          phone: '+998902400025',
        },
      },
      reset_password: {
        summary: 'Reset Password',
        value: {
          type: 'reset_password',
          phone: '+998902400025',
        },
      },
      edit_phone: {
        summary: 'Edit Phone',
        value: {
          type: 'edit_phone',
          phone: '+998902400025',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'OTP muvaffaqiyatli yuborildi' })
  @ApiResponse({ status: 400, description: "Xato so'rov" })
  @ApiResponse({ status: 409, description: 'Telefon raqam band' })
  async send(@Body() dto: SendVerificationDto) {
    return this.verificationService.sendVerification(dto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'OTP tasdiqlash',
    description: 'Valid types: register, reset_password, edit_phone',
  })
  @ApiBody({
    type: VerifyOtpDto,
    examples: {
      register: {
        summary: 'Verify Registration',
        value: {
          type: 'register',
          phone: '+998902400025',
          otp: '000000',
        },
      },
      reset_password: {
        summary: 'Verify Reset Password',
        value: {
          type: 'reset_password',
          phone: '+998902400025',
          otp: '000000',
        },
      },
      edit_phone: {
        summary: 'Verify Edit Phone',
        value: {
          type: 'edit_phone',
          phone: '+998902400025',
          otp: '000000',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'OTP muvaffaqiyatli tasdiqlandi' })
  @ApiResponse({
    status: 400,
    description: "Noto'g'ri yoki muddati o'tgan kod",
  })
  async verify(@Body() dto: VerifyOtpDto) {
    return this.verificationService.verifyOtp(dto);
  }
}
