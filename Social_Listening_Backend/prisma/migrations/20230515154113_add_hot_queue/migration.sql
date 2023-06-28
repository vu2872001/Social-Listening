-- CreateTable
CREATE TABLE "UserInHotQueue" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT,
    "delete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInHotQueue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserInHotQueue" ADD CONSTRAINT "UserInHotQueue_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "SocialSender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInHotQueue" ADD CONSTRAINT "UserInHotQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
