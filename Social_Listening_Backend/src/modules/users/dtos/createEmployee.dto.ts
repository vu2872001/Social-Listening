import { IsOptional, IsString } from 'class-validator';

export class CreateEmployeeDTO {
  @IsString()
  userName: string;

  @IsString()
  fullName: string;

  @IsString()
  password: string;

  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  roleId: string;

  @IsString()
  @IsOptional()
  gender: string;
}
