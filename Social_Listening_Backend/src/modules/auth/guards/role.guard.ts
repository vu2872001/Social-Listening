import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { JWTAuthGuard } from './jwtAuth.guard';
import { RequestWithUser } from '../interface/requestWithUser.interface';

export const RoleGuard = (roleDisplayName: string): Type<CanActivate> => {
  class RoleGuardMixin extends JWTAuthGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;
      return user?.role.toString() === roleDisplayName;
    }
  }

  return mixin(RoleGuardMixin);
};
