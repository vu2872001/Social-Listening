-- CreateTable
CREATE TABLE "SocialTabLog" (
    "id" SERIAL NOT NULL,
    "tabId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "extendData" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialTabLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SocialTabLog" ADD CONSTRAINT "SocialTabLog_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "SocialTab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
