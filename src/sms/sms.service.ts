import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { OTPType } from '@prisma/client';

interface EskizTokenResponse {
  message: string;
  data: {
    token: string;
  };
  token_type: string;
}

interface EskizSmsResponse {
  id: string;
  status: string;
  message: string;
}

@Injectable()
export class SmsService implements OnModuleInit {
  private readonly logger = new Logger(SmsService.name);
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private tokenExpiresAt: Date | null = null;

  private readonly baseUrl = 'https://notify.eskiz.uz/api';
  private readonly login: string;
  private readonly password: string;
  private readonly from: string;

  constructor(private configService: ConfigService) {
    this.login = this.configService.get<string>('SMS_LOGIN') || '';
    this.password = this.configService.get<string>('SMS_PASSWORD') || '';
    this.from = this.configService.get<string>('SMS_FROM') || '4546';

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  async onModuleInit() {
    try {
      await this.authenticate();
      this.logger.log('Eskiz.uz SMS xizmati muvaffaqiyatli ulandi');
    } catch (error) {
      this.logger.error('Eskiz.uz SMS xizmatiga ulanishda xatolik', error);
    }
  }

  /**
   * Eskiz.uz API'dan token olish
   */
  private async authenticate(): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('email', this.login);
      formData.append('password', this.password);

      const response = await this.axiosInstance.post<EskizTokenResponse>(
        '/auth/login',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      this.token = response.data.data.token;
      // Token 30 kun amal qiladi, lekin xavfsizlik uchun 29 kunga belgilaymiz
      this.tokenExpiresAt = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000);

      this.logger.log('Eskiz.uz token muvaffaqiyatli olindi');
    } catch (error) {
      this.logger.error('Eskiz.uz autentifikatsiyada xatolik:', error);
      throw error;
    }
  }

  /**
   * Token yangilash kerakligini tekshirish
   */
  private async ensureToken(): Promise<void> {
    if (
      !this.token ||
      !this.tokenExpiresAt ||
      new Date() >= this.tokenExpiresAt
    ) {
      await this.authenticate();
    }
  }

  /**
   * SMS yuborish
   * @param phone - Telefon raqam (998XXXXXXXXX formatida)
   * @param message - SMS matni
   */
  async sendSms(phone: string, message: string): Promise<boolean> {
    try {
      await this.ensureToken();

      // Telefon raqamni formatlash (998 bilan boshlanishi kerak)
      const formattedPhone = this.formatPhone(phone);

      const formData = new FormData();
      formData.append('mobile_phone', formattedPhone);
      formData.append('message', message);
      formData.append('from', this.from);

      const response = await this.axiosInstance.post<EskizSmsResponse>(
        '/message/sms/send',
        formData,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      this.logger.log(
        `SMS yuborildi: ${formattedPhone}, Status: ${response.data.status}`,
      );
      return (
        response.data.status === 'waiting' || response.data.status === 'success'
      );
    } catch (error) {
      this.logger.error(`SMS yuborishda xatolik: ${phone}`, error);
      return false;
    }
  }

  /**
   * OTP kod yuborish
   * @param phone - Telefon raqam
   * @param code - OTP kod
   * @param type - OTP turi (REGISTRATION, PASSWORD_RESET, PHONE_CHANGE)
   */
  async sendOtp(
    phone: string,
    code: string,
    type: OTPType = OTPType.REGISTRATION,
  ): Promise<boolean> {
    let message: string;

    if (type === OTPType.REGISTRATION) {
      message = `Fixoo platformasidan ro'yxatdan o'tish uchun tasdiqlash kodi: ${code}. Kodni hech kimga bermang!`;
    } else if (type === OTPType.PASSWORD_RESET) {
      message = `Fixoo platformasida parolingizni tiklash uchun tasdiqlash kodi: ${code}. Kodni hech kimga bermang!`;
    } else if (type === OTPType.PHONE_CHANGE) {
      message = `Fixoo platformasida telefoningizni o'zgartirish uchun tasdiqlash kodi: ${code}. Kodni hech kimga bermang!`;
    } else {
      message = `Fixoo platformasi tasdiqlash kodi: ${code}. Kodni hech kimga bermang!`;
    }

    return this.sendSms(phone, message);
  }

  /**
   * Telefon raqamni formatlash
   * @param phone - Telefon raqam
   * @returns Formatlangan raqam (998XXXXXXXXX)
   */
  private formatPhone(phone: string): string {
    // Barcha belglarni olib tashlash
    let cleaned = phone.replace(/\D/g, '');

    // Agar 9 bilan boshlansa, 998 qo'shish
    if (cleaned.startsWith('9') && cleaned.length === 9) {
      cleaned = '998' + cleaned;
    }

    // Agar + bilan boshlangan bo'lsa, olib tashlash
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    return cleaned;
  }

  /**
   * Token balansini tekshirish
   */
  async getBalance(): Promise<number | null> {
    try {
      await this.ensureToken();

      const response = await this.axiosInstance.get('/auth/user', {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      return response.data.data?.balance || null;
    } catch (error) {
      this.logger.error('Balansni olishda xatolik:', error);
      return null;
    }
  }
}
