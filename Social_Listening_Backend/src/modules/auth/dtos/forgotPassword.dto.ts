import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordDTO {
  @IsString()
  @IsEmail()
  email: string;
}
