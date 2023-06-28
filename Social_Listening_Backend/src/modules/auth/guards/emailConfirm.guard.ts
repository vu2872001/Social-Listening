import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { RequestWithUser } from '../interface/requestWithUser.interface';

@Injectable()
export class EmailConfirmGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    if (!request.user?.isActive) {
      throw new BadRequestException('Confirm your email first');
    }

    return true;
  }
}
