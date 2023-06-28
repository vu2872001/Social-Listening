/*
  Warnings:

  - A unique constraint covering the columns `[socialId]` on the table `SocialTab` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `socialId` to the `SocialTab` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SocialTab" ADD COLUMN     "socialId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SocialNetwork" (
    "id" TEXT NOT NULL,
    "socialType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "extendData" TEXT,
    "delete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SocialNetwork_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialTab_socialId_key" ON "SocialTab"("socialId");

-- AddForeignKey
ALTER TABLE "SocialTab" ADD CONSTRAINT "SocialTab_socialId_fkey" FOREIGN KEY ("socialId") REFERENCES "SocialNetwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
