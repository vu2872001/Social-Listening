import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateAccountDTO {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  userName: string;

  @IsString()
  fullName: string;

  @IsString()
  @IsOptional()
  @Matches(/(0)+([3|5|7|8|9])+([0-9]{8})\b/)
  phoneNumber: string;

  @IsString()
  gender: string;
}
