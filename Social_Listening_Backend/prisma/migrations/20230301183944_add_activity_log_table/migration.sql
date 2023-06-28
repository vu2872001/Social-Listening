-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "activityType" TEXT,
    "objName" TEXT,
    "objId" TEXT,
    "refName" TEXT,
    "refId" TEXT,
    "dateCreate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);
