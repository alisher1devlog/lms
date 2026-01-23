-- CreateEnum
CREATE TYPE "OTPType" AS ENUM ('REGISTRATION', 'PASSWORD_RESET', 'PHONE_CHANGE', 'EMAIL_VERIFICATION');

-- DropIndex
DROP INDEX "OTP_phone_code_key";

-- AlterTable
ALTER TABLE "OTP" ADD COLUMN "type" "OTPType" NOT NULL DEFAULT 'REGISTRATION';

-- CreateIndex
CREATE INDEX "OTP_phone_type_idx" ON "OTP"("phone", "type");

-- CreateIndex
CREATE UNIQUE INDEX "OTP_phone_code_type_key" ON "OTP"("phone", "code", "type");
