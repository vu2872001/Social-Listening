import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserModule } from '../users/user.module';
import { QueueModule } from '../queue/queue.module';
import { SettingModule } from '../setting/setting.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './guards/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { SettingService } from '../setting/service/setting.service';
import { JwtStrategy } from './guards/jwt.stategy';
import { JwtRefreshStrategy } from './guards/refresh.stategy';
import { TokenModule } from '../token/token.module';
import { LogModule } from '../activityLogs/log.module';
import { SocialGroupModule } from '../socialGroups/socialGroup.module';
import { APIKeyStrategy } from './guards/apiKey.strategy';

@Module({
  imports: [
    PassportModule,
    forwardRef(() => UserModule),
    forwardRef(() => QueueModule),
    SettingModule,
    TokenModule,
    LogModule,
    JwtModule.registerAsync({
      imports: [SettingModule],
      inject: [SettingService],
      useFactory: async (settingService: SettingService) => {
        const tokenSecret = (
          await settingService.getSettingByKeyAndGroup(
            'TOKEN_SECRET',
            'ACTIVATE_ACCOUNT',
          )
        )?.value;
        const tokenExpireTime = (
          await settingService.getSettingByKeyAndGroup(
            'TOKEN_EXPIRATION_TIME',
            'ACTIVATE_ACCOUNT',
          )
        )?.value;

        return {
          secret: tokenSecret,
          signOptions: {
            expiresIn: `${tokenExpireTime}s`,
          },
        };
      },
    }),
    SocialGroupModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    APIKeyStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
