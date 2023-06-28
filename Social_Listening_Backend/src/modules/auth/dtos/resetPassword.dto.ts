import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDTO {
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}
