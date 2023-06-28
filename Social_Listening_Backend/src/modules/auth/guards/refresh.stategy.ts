import { SettingService } from './../../setting/service/setting.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/modules/users/services/user.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(
    private readonly userService: UserService,
    private readonly settingService: SettingService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          const tokenSecret = (
            await settingService.getSettingByKeyAndGroup(
              'TOKEN_SECRET',
              'ACTIVATE_ACCOUNT',
            )
          )?.value;
          done(null, tokenSecret);
        } catch (error) {
          done(error);
        }
      },
    });
  }

  async validate(request: Request, payload) {
    const refresh = request.headers.authorization.split(' ')[1];
    return this.userService.getUserByToken(refresh, payload.id);
  }
}
