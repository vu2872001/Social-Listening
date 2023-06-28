-- CreateTable
CREATE TABLE "SocialTabSettingg" (
    "id" SERIAL NOT NULL,
    "tabId" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SocialTabSettingg_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SocialTabSettingg" ADD CONSTRAINT "SocialTabSettingg_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "SocialTab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
