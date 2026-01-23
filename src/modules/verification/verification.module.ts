import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SmsModule } from '../../sms/sms.module';

@Module({
  imports: [PrismaModule, SmsModule],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
