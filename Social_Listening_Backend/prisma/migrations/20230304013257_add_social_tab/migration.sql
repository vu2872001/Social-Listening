-- CreateTable
CREATE TABLE "SocialGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "extendData" TEXT NOT NULL,

    CONSTRAINT "SocialGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialTab" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,

    CONSTRAINT "SocialTab_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialGroup_managerId_key" ON "SocialGroup"("managerId");

-- AddForeignKey
ALTER TABLE "SocialGroup" ADD CONSTRAINT "SocialGroup_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialTab" ADD CONSTRAINT "SocialTab_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SocialGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialTab" ADD CONSTRAINT "SocialTab_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
