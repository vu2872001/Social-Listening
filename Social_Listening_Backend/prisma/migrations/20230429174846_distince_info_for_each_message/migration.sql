/*
  Warnings:

  - Added the required column `messageId` to the `WorkflowData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkflowData" ADD COLUMN     "messageId" TEXT NOT NULL;
