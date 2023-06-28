/*
  Warnings:

  - Added the required column `messageType` to the `UserInHotQueue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserInHotQueue" ADD COLUMN     "messageType" TEXT NOT NULL;
