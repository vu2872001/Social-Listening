-- CreateTable
CREATE TABLE "Botflow" (
    "id" TEXT NOT NULL,
    "tabId" TEXT,
    "name" TEXT NOT NULL,
    "delete" BOOLEAN NOT NULL DEFAULT false,
    "extendData" TEXT,

    CONSTRAINT "Botflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotflowVariable" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "variableName" TEXT NOT NULL,
    "variableValue" TEXT NOT NULL,
    "variableDataType" TEXT NOT NULL,

    CONSTRAINT "BotflowVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotflowNode" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position_X" INTEGER NOT NULL,
    "position_Y" INTEGER NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "BotflowNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotflowEdge" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,

    CONSTRAINT "BotflowEdge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Botflow" ADD CONSTRAINT "Botflow_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "SocialTab"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotflowVariable" ADD CONSTRAINT "BotflowVariable_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Botflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotflowNode" ADD CONSTRAINT "BotflowNode_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Botflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotflowEdge" ADD CONSTRAINT "BotflowEdge_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Botflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
