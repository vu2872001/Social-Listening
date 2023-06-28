import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDTO {
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  permission: string;

  @IsString()
  @IsNotEmpty()
  screen: string;
}
