/*
  Warnings:

  - You are about to drop the column `doba` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "doba",
ADD COLUMN     "dob" TIMESTAMP(3);
