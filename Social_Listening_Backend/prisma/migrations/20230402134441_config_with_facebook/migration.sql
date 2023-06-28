-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "tabId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "permalinkUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMessage" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,

    CONSTRAINT "SocialMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "SocialTab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
