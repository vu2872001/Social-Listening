import {
  CanActivate,
  ExecutionContext,
  mixin,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import { JWTAuthGuard } from './jwtAuth.guard';
import { RequestWithUser } from '../interface/requestWithUser.interface';

export const PermissionGuard = (permission: string): Type<CanActivate> => {
  class PermissionGuardMixin extends JWTAuthGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      let request;
      try {
        request = context.switchToHttp().getRequest<RequestWithUser>();
      } catch (error) {
        throw new UnauthorizedException(`You mush log in to system`);
      }
      const user = request.user;
      return user?.permissions && user?.permissions.indexOf(permission) !== -1;
    }
  }

  return mixin(PermissionGuardMixin);
};
