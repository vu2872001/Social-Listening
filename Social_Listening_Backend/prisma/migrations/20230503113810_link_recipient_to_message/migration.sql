/*
  Warnings:

  - Added the required column `recipientId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "recipientId" TEXT NOT NULL,
ADD COLUMN     "socialSenderId" TEXT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "SocialSender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
