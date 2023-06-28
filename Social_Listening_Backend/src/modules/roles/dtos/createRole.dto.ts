import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateRoleDTO {
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @IsNumber()
  @IsOptional()
  level: number;
}
