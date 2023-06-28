import { IsString } from 'class-validator';

export class UpdateRoleUserDTO {
  @IsString()
  userId: string;

  @IsString()
  tabId: string;

  @IsString()
  roleId: string;
}
