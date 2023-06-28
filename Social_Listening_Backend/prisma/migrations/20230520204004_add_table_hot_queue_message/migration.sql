-- CreateTable
CREATE TABLE "HotQueueMessage" (
    "id" TEXT NOT NULL,
    "tabId" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "delete" BOOLEAN NOT NULL DEFAULT false,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HotQueueMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HotQueueMessage" ADD CONSTRAINT "HotQueueMessage_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "SocialTab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotQueueMessage" ADD CONSTRAINT "HotQueueMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "SocialSender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotQueueMessage" ADD CONSTRAINT "HotQueueMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "SocialSender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
