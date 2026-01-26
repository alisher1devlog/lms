/*
  Warnings:

  - The primary key for the `AssignedCourse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PurchasedCourse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `AssignedCourse` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `PurchasedCourse` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "AssignedCourse" DROP CONSTRAINT "AssignedCourse_courseId_fkey";

-- DropForeignKey
ALTER TABLE "PurchasedCourse" DROP CONSTRAINT "PurchasedCourse_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_courseId_fkey";

-- AlterTable
ALTER TABLE "AssignedCourse" DROP CONSTRAINT "AssignedCourse_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "courseId" DROP NOT NULL,
ADD CONSTRAINT "AssignedCourse_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PurchasedCourse" DROP CONSTRAINT "PurchasedCourse_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "courseId" DROP NOT NULL,
ADD CONSTRAINT "PurchasedCourse_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "courseId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Rating" ALTER COLUMN "courseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AssignedCourse" ADD CONSTRAINT "AssignedCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchasedCourse" ADD CONSTRAINT "PurchasedCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
