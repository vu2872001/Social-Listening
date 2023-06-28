import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSocialGroupDTO {
  name: string;
  managerId: string;
  extendData?: string = null;
}

export class EditSocialGroupDTO {
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  extendData?: string = null;
}
