-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReplied" (
    "messageId" TEXT NOT NULL,
    "messageRepliedId" TEXT NOT NULL,

    CONSTRAINT "MessageReplied_pkey" PRIMARY KEY ("messageId","messageRepliedId")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "SocialSender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReplied" ADD CONSTRAINT "MessageReplied_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReplied" ADD CONSTRAINT "MessageReplied_messageRepliedId_fkey" FOREIGN KEY ("messageRepliedId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
