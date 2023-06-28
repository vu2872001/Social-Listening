/*
  Warnings:

  - You are about to drop the column `sender` on the `SocialMessage` table. All the data in the column will be lost.
  - Added the required column `senderId` to the `SocialMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SocialMessage" DROP COLUMN "sender",
ADD COLUMN     "senderId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SocialSender" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,

    CONSTRAINT "SocialSender_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SocialMessage" ADD CONSTRAINT "SocialMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "SocialSender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
