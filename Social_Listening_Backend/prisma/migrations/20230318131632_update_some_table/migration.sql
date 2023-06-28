/*
  Warnings:

  - You are about to drop the column `managerId` on the `SocialTab` table. All the data in the column will be lost.
  - Added the required column `extendData` to the `SocialTab` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SocialTab" DROP CONSTRAINT "SocialTab_managerId_fkey";

-- AlterTable
ALTER TABLE "SocialTab" DROP COLUMN "managerId",
ADD COLUMN     "extendData" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'Other';

-- AlterTable
ALTER TABLE "UserInGroup" ADD COLUMN     "joinAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "UserInTab" (
    "userId" TEXT NOT NULL,
    "tabId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "joinAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserInTab_pkey" PRIMARY KEY ("userId","tabId")
);

-- AddForeignKey
ALTER TABLE "UserInTab" ADD CONSTRAINT "UserInTab_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInTab" ADD CONSTRAINT "UserInTab_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "SocialTab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInTab" ADD CONSTRAINT "UserInTab_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
