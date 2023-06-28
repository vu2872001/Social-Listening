import { IsOptional, IsString, Matches } from 'class-validator';

export class EditEmployeeDTO {
  @IsString()
  id: string;

  @IsString()
  userName: string;

  @IsString()
  fullName: string;

  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  @Matches(/(0)+([3|5|7|8|9])+([0-9]{8})\b/)
  phoneNumber: string;

  @IsString()
  @IsOptional()
  gender: string;
}
