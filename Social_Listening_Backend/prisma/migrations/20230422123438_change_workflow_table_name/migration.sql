/*
  Warnings:

  - You are about to drop the `Botflow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BotflowEdge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BotflowNode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BotflowVariable` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Botflow" DROP CONSTRAINT "Botflow_tabId_fkey";

-- DropForeignKey
ALTER TABLE "BotflowEdge" DROP CONSTRAINT "BotflowEdge_flowId_fkey";

-- DropForeignKey
ALTER TABLE "BotflowNode" DROP CONSTRAINT "BotflowNode_flowId_fkey";

-- DropForeignKey
ALTER TABLE "BotflowVariable" DROP CONSTRAINT "BotflowVariable_flowId_fkey";

-- DropTable
DROP TABLE "Botflow";

-- DropTable
DROP TABLE "BotflowEdge";

-- DropTable
DROP TABLE "BotflowNode";

-- DropTable
DROP TABLE "BotflowVariable";

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "tabId" TEXT,
    "name" TEXT NOT NULL,
    "delete" BOOLEAN NOT NULL DEFAULT false,
    "extendData" TEXT,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowVariable" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "variableName" TEXT NOT NULL,
    "variableValue" TEXT NOT NULL,
    "variableDataType" TEXT NOT NULL,

    CONSTRAINT "WorkflowVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowNode" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position_X" INTEGER NOT NULL,
    "position_Y" INTEGER NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "WorkflowNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowEdge" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,

    CONSTRAINT "WorkflowEdge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "SocialTab"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowVariable" ADD CONSTRAINT "WorkflowVariable_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowNode" ADD CONSTRAINT "WorkflowNode_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowEdge" ADD CONSTRAINT "WorkflowEdge_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
