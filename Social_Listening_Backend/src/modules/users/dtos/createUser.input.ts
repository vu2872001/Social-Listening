import { CreateUserDTO } from './createUser.dto';

export class CreateUserInput extends CreateUserDTO {
  roleId: string;
  userName: string;
  fullName: string;
}
