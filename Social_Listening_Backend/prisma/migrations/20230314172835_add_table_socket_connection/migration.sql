-- CreateTable
CREATE TABLE "SocketConnection" (
    "userId" TEXT NOT NULL,
    "socketToken" TEXT NOT NULL,

    CONSTRAINT "SocketConnection_pkey" PRIMARY KEY ("userId")
);
