export class RolePermissionDTO {
  roleId: string;
  listPermission: string[];
}

export class RemoveRolePermissionDTO {
  roleId: string;
  permissionId: string;
}

export class RemoveListRolePermissionDTO {
  listRolePermission: RemoveRolePermissionDTO[];
}
