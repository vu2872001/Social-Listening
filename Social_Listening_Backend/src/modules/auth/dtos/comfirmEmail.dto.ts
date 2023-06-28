import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmEmailDTO {
  @IsString()
  @IsNotEmpty()
  token: string;
}
