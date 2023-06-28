import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class APIKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private authService: AuthService) {
    super(
      { header: 'Authorization', prefix: '' },
      true,
      async (apiKey, done) => {
        if ((await this.authService.validateAPIKey(apiKey)) !== null) {
          done(null, true);
        }
        done(new UnauthorizedException(), null);
      },
    );
  }
}
