import { Request } from 'express';
import { User } from 'src/modules/users/model/user.model';

interface UserExtend extends User {
  role: string;
  permission: string[];
}

export interface RequestWithUser extends Request {
  user: UserExtend;
}
