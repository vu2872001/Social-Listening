-- CreateTable
CREATE TABLE "WorkflowData" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "WorkflowData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkflowData" ADD CONSTRAINT "WorkflowData_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
