/*
  Warnings:

  - You are about to drop the `SocialTabSettingg` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SocialTabSettingg" DROP CONSTRAINT "SocialTabSettingg_tabId_fkey";

-- DropTable
DROP TABLE "SocialTabSettingg";

-- CreateTable
CREATE TABLE "SocialTabSetting" (
    "id" SERIAL NOT NULL,
    "tabId" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SocialTabSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SocialTabSetting" ADD CONSTRAINT "SocialTabSetting_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "SocialTab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
