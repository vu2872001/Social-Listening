-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "UserInGroup" ADD COLUMN     "delete" BOOLEAN NOT NULL DEFAULT false;
