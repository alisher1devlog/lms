import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379',
    });

    this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.on('connect', () => console.log('Redis Client Connected'));

    await this.client.connect();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  /**
   * OTP saqlash (10 minut TTL)
   */
  async setOTP(
    phone: string,
    type: string,
    code: string,
    ttl: number = 600,
  ): Promise<void> {
    const key = `otp:${phone}:${type}`;
    const value = JSON.stringify({ code, createdAt: new Date() });
    await this.client.setEx(key, ttl, value);
  }

  /**
   * OTP olish
   */
  async getOTP(phone: string, type: string): Promise<any> {
    const key = `otp:${phone}:${type}`;
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * OTP o'chirish
   */
  async deleteOTP(phone: string, type: string): Promise<void> {
    const key = `otp:${phone}:${type}`;
    await this.client.del(key);
  }

  /**
   * OTP urinishlarni tracking qilish
   */
  async incAttempts(phone: string, type: string): Promise<number> {
    const key = `otp:attempts:${phone}:${type}`;
    const attempts = await this.client.incr(key);

    // Birinchi urinish bo'lsa 15 minutlik TTL qo'yamiz
    if (attempts === 1) {
      await this.client.expire(key, 15 * 60);
    }

    return attempts;
  }

  /**
   * OTP urinishlar sonini olish
   */
  async getAttempts(phone: string, type: string): Promise<number> {
    const key = `otp:attempts:${phone}:${type}`;
    const value = await this.client.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  /**
   * OTP urinishlarni reset qilish
   */
  async resetAttempts(phone: string, type: string): Promise<void> {
    const key = `otp:attempts:${phone}:${type}`;
    await this.client.del(key);
  }

  /**
   * Oddiy set qilish
   */
  async set(key: string, value: string, ttl: number = 600): Promise<void> {
    await this.client.setEx(key, ttl, value);
  }

  /**
   * Oddiy get qilish
   */
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  /**
   * Oddiy delete qilish
   */
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}
