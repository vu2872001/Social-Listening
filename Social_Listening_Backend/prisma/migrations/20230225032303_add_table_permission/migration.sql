-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "screen" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);
