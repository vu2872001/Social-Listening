/*
  Warnings:

  - Added the required column `dateExpires` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "dateExpires" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;
