import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}
