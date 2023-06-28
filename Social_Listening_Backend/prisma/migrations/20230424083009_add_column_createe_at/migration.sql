/*
  Warnings:

  - Added the required column `createAt` to the `Workflow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL;
