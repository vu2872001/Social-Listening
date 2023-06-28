-- AlterTable
ALTER TABLE "WorkflowVariable" ALTER COLUMN "variableValue" DROP NOT NULL,
ALTER COLUMN "variableDataType" DROP NOT NULL;
