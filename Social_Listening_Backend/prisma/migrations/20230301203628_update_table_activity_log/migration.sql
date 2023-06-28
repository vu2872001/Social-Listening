/*
  Warnings:

  - Added the required column `userName` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "userName" TEXT NOT NULL;
