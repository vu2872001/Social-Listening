/*
  Warnings:

  - Added the required column `groupId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "groupId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SocialGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
