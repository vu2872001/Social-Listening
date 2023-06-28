import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDTO {
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  newPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  oldPassword: string;
}
