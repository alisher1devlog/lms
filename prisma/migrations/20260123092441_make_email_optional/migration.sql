-- DropIndex
DROP INDEX "OTP_phone_idx";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
