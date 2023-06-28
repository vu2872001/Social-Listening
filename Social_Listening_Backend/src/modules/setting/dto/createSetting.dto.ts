import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSettingDTO {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  group: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}
