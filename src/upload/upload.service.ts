import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { lookup } from 'mime-types';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimeType: string;
}

export type FileCategory =
  | 'banners'
  | 'videos'
  | 'avatars'
  | 'lessons'
  | 'homework'
  | 'files';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly region: string;
  private readonly logger = new Logger(UploadService.name);

  // Allowed file types
  private readonly allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  private readonly allowedVideoTypes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
  ];
  private readonly allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed',
  ];

  // Max file sizes (in bytes)
  private readonly maxImageSize = 10 * 1024 * 1024; // 10MB
  private readonly maxVideoSize = 500 * 1024 * 1024; // 500MB
  private readonly maxDocumentSize = 50 * 1024 * 1024; // 50MB

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('DO_SPACES_BUCKET');
    this.endpoint = this.configService.get<string>('DO_SPACES_ENDPOINT');
    this.region = this.configService.get<string>('DO_SPACES_REGION');

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('DO_SPACES_KEY'),
        secretAccessKey: this.configService.get<string>('DO_SPACES_SECRET'),
      },
      forcePathStyle: false,
    });

    this.logger.log(
      `DigitalOcean Spaces initialized: ${this.bucket} (${this.region})`,
    );
  }

  /**
   * Upload a single file to DigitalOcean Spaces
   */
  async uploadFile(
    file: Express.Multer.File,
    category: FileCategory,
    subfolder?: string,
  ): Promise<UploadResult> {
    this.validateFile(file, category);

    const fileExtension = this.getFileExtension(file.originalname);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const key = subfolder
      ? `${category}/${subfolder}/${uniqueFileName}`
      : `${category}/${uniqueFileName}`;

    const mimeType =
      file.mimetype || lookup(file.originalname) || 'application/octet-stream';

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: mimeType,
        ACL: 'public-read',
        CacheControl: 'max-age=31536000', // 1 year cache
      });

      await this.s3Client.send(command);

      const url = this.getPublicUrl(key);

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        url,
        key,
        bucket: this.bucket,
        size: file.size,
        mimeType,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new BadRequestException(`Fayl yuklashda xatolik: ${error.message}`);
    }
  }

  /**
   * Upload image (banner, avatar)
   */
  async uploadImage(
    file: Express.Multer.File,
    category: FileCategory = 'banners',
    subfolder?: string,
  ): Promise<UploadResult> {
    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Rasm formati qo'llab-quvvatlanmaydi. Ruxsat etilgan formatlar: ${this.allowedImageTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxImageSize) {
      throw new BadRequestException(
        `Rasm hajmi ${this.maxImageSize / (1024 * 1024)}MB dan oshmasligi kerak`,
      );
    }

    return this.uploadFile(file, category, subfolder);
  }

  /**
   * Upload video (intro, lesson videos)
   */
  async uploadVideo(
    file: Express.Multer.File,
    category: FileCategory = 'videos',
    subfolder?: string,
  ): Promise<UploadResult> {
    if (!this.allowedVideoTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Video formati qo'llab-quvvatlanmaydi. Ruxsat etilgan formatlar: ${this.allowedVideoTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxVideoSize) {
      throw new BadRequestException(
        `Video hajmi ${this.maxVideoSize / (1024 * 1024)}MB dan oshmasligi kerak`,
      );
    }

    return this.uploadFile(file, category, subfolder);
  }

  /**
   * Upload document (PDF, Word, etc.)
   */
  async uploadDocument(
    file: Express.Multer.File,
    category: FileCategory = 'files',
    subfolder?: string,
  ): Promise<UploadResult> {
    const allAllowedTypes = [
      ...this.allowedImageTypes,
      ...this.allowedVideoTypes,
      ...this.allowedDocumentTypes,
    ];

    if (!allAllowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Fayl formati qo'llab-quvvatlanmaydi`);
    }

    if (file.size > this.maxDocumentSize) {
      throw new BadRequestException(
        `Fayl hajmi ${this.maxDocumentSize / (1024 * 1024)}MB dan oshmasligi kerak`,
      );
    }

    return this.uploadFile(file, category, subfolder);
  }

  /**
   * Delete file from DigitalOcean Spaces
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new BadRequestException(
        `Faylni o'chirishda xatolik: ${error.message}`,
      );
    }
  }

  /**
   * Delete file by URL
   */
  async deleteFileByUrl(url: string): Promise<void> {
    const key = this.getKeyFromUrl(url);
    if (key) {
      await this.deleteFile(key);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    // DigitalOcean Spaces URL format
    return `https://${this.bucket}.${this.region}.digitaloceanspaces.com/${key}`;
  }

  /**
   * Extract key from URL
   */
  getKeyFromUrl(url: string): string | null {
    try {
      const baseUrl = `https://${this.bucket}.${this.region}.digitaloceanspaces.com/`;
      if (url.startsWith(baseUrl)) {
        return url.replace(baseUrl, '');
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Validate file based on category
   */
  private validateFile(
    file: Express.Multer.File,
    category: FileCategory,
  ): void {
    if (!file) {
      throw new BadRequestException('Fayl topilmadi');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException("Fayl bo'sh");
    }

    // Validate based on category
    switch (category) {
      case 'banners':
      case 'avatars':
        if (!this.allowedImageTypes.includes(file.mimetype)) {
          throw new BadRequestException('Faqat rasm fayllari ruxsat etilgan');
        }
        if (file.size > this.maxImageSize) {
          throw new BadRequestException(
            `Rasm hajmi ${this.maxImageSize / (1024 * 1024)}MB dan oshmasligi kerak`,
          );
        }
        break;

      case 'videos':
      case 'lessons':
        if (!this.allowedVideoTypes.includes(file.mimetype)) {
          throw new BadRequestException('Faqat video fayllari ruxsat etilgan');
        }
        if (file.size > this.maxVideoSize) {
          throw new BadRequestException(
            `Video hajmi ${this.maxVideoSize / (1024 * 1024)}MB dan oshmasligi kerak`,
          );
        }
        break;

      case 'homework':
      case 'files':
        // Allow all types for homework/files
        break;
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.substring(lastDot).toLowerCase();
  }
}
