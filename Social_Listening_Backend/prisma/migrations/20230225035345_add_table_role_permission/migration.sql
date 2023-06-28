-- CreateTable
CREATE TABLE "Role_Permission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "Role_Permission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- AddForeignKey
ALTER TABLE "Role_Permission" ADD CONSTRAINT "Role_Permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role_Permission" ADD CONSTRAINT "Role_Permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
