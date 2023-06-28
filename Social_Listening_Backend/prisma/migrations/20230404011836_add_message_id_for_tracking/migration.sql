/*
  Warnings:

  - Added the required column `messageId` to the `SocialMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SocialMessage" ADD COLUMN     "messageId" TEXT NOT NULL;
