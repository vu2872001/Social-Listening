-- AlterTable
ALTER TABLE "SocialMessage" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "SocialMessage_isRead_idx" ON "SocialMessage"("isRead");

-- CreateIndex
CREATE INDEX "SocialMessage_parentId_idx" ON "SocialMessage"("parentId");

-- CreateIndex
CREATE INDEX "SocialPost_tabId_idx" ON "SocialPost"("tabId");
