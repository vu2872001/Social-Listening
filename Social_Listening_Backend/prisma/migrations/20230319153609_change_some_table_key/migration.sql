/*
  Warnings:

  - The primary key for the `UserInGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserInTab` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "UserInGroup" DROP CONSTRAINT "UserInGroup_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "UserInGroup_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserInTab" DROP CONSTRAINT "UserInTab_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "UserInTab_pkey" PRIMARY KEY ("id");
