import { IsNotEmpty, IsString } from 'class-validator';
import { CreatePermissionDTO } from './createPermission.dto';

export class UpdatePermissionDTO extends CreatePermissionDTO {
  @IsString()
  @IsNotEmpty()
  id: string;
}
