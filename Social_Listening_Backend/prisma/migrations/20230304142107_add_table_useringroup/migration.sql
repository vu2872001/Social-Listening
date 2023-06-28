-- CreateTable
CREATE TABLE "UserInGroup" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "UserInGroup_pkey" PRIMARY KEY ("userId","groupId")
);

-- AddForeignKey
ALTER TABLE "UserInGroup" ADD CONSTRAINT "UserInGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInGroup" ADD CONSTRAINT "UserInGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SocialGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
