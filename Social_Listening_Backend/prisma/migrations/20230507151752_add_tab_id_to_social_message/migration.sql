/*
  Warnings:

  - Added the required column `tabId` to the `SocialMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SocialMessage" ADD COLUMN     "tabId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "SocialMessage" ADD CONSTRAINT "SocialMessage_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "SocialTab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
