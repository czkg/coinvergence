/*
  Warnings:

  - You are about to drop the column `created_at` on the `EmailVerificationToken` table. All the data in the column will be lost.
  - You are about to drop the column `sent_at` on the `EmailVerificationToken` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `EmailVerificationToken` table. All the data in the column will be lost.
  - Added the required column `userId` to the `EmailVerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EmailVerificationToken" DROP CONSTRAINT "EmailVerificationToken_user_id_fkey";

-- AlterTable
ALTER TABLE "EmailVerificationToken" DROP COLUMN "created_at",
DROP COLUMN "sent_at",
DROP COLUMN "user_id",
ADD COLUMN     "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
