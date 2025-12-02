/*
  Warnings:

  - You are about to drop the column `create_at` on the `EmailVerificationToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmailVerificationToken" DROP COLUMN "create_at",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
