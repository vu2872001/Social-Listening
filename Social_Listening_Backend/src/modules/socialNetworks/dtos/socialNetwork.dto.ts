import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConnectSocialNetworkDTO {
  @IsString()
  socialType: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  extendData: string;
}

export class UpdateSocialNetworkDTO {
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
