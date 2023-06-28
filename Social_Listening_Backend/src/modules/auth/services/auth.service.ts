import { UserInGroupService } from './../../users/services/userInGroup.service';
import { UpdateAccountDTO } from './../dtos/updateAccount.dto';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { UserService } from 'src/modules/users/services/user.service';
import { RegisterDTO } from '../dtos/register.dto';
import { EmailQueueService } from 'src/modules/queue/services/email.queue.service';
import { VerificationTokenPayload } from '../dtos/verificationToken.payload';
import { SettingService } from 'src/modules/setting/service/setting.service';
import { JwtService } from '@nestjs/jwt';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { User } from 'src/modules/users/model/user.model';
import { comparePassword } from 'src/utils/hashPassword';
import { excludeData } from 'src/utils/excludeData';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { UpdatePasswordDTO } from '../dtos/updatePassword.dto';
import { RecoveryPasswordPayload } from '../dtos/recoveryPassword.payload';
import { TokenService } from 'src/modules/token/services/token.service';
import { SocialGroupService } from 'src/modules/socialGroups/services/socialGroup.service';
import { UserInTabService } from './../../users/services/userInTab.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly settingService: SettingService,
    private readonly emailQueueService: EmailQueueService,
    private readonly socialGroupService: SocialGroupService,
    private readonly userInGroupService: UserInGroupService,
  ) { }

  async register(registerData: RegisterDTO) {
    let result = new ReturnResult<User>();
    try {
      registerData.email = registerData.email.toLowerCase();

      const userExist = await this.userService.getUserByEmail(
        registerData.email,
      );
      if (userExist) {
        throw new BadRequestException(
          `Email: ${registerData.email} exists. Try with another email`,
        );
      }

      const user = await this.userService.createUser(registerData);
      if (user.result) {
        await this.sendVerificationLink(user.result?.email);
        const group = await this.socialGroupService.createSocailGroup({
          name: user.result.email,
          managerId: user.result.id,
        });
        await this.userInGroupService.addUserToGroup(user.result?.id, group.id);
      }
      result = user;
    } catch (error) {
      this.logger.error(`Function: registerAccount, Error: ${error.message}`);
      result.message = error.message;
    }
    return result;
  }

  async decodeToken(token: string) {
    try {
      const tokenSecretSetting =
        await this.settingService.getSettingByKeyAndGroup(
          'TOKEN_SECRET',
          'ACTIVATE_ACCOUNT',
        );
      const payload = await this.jwtService.verify(token, {
        secret: tokenSecretSetting.value,
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }

  async confirmEmail(email: string) {
    const user = await this.userService.getUserByEmail(email);
    if (user.isActive) {
      throw new BadRequestException('Email already confirmed');
    }
    return await this.userService.activeAccount(user.id);
  }

  async getAuthenticatedUser(email: string, hashedPassword: string) {
    const result = new ReturnResult<User>();
    try {
      const user = await this.userService.getUserByEmail(email);
      const isPasswordMatching = await comparePassword(
        hashedPassword,
        user.password,
      );

      if (!isPasswordMatching) throw new Error('Wrong credentials provided');
      
      const userInfo = await this.userService.getUserInfo(user.id);
      const checkActive = await this.userInGroupService.checkActivate(user.id);

      if (!checkActive && userInfo.role !== 'ADMIN')
        throw new Error('Your account have been deactivated or deleted');

      result.result = excludeData(user, [
        'password',
        'createdAt',
        'updatedAt',
        'roleId',
        'deleteAt',
        'refreshToken',
      ]);
    } catch (error) {
      this.logger.log(`Email ${email} login account fail`);
      result.message = error.message;
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
    return result;
  }

  async getJwtToken(userId: string, type = 'ACCESS_TOKEN') {
    const tokenSecretSetting =
      await this.settingService.getSettingByKeyAndGroup(
        'TOKEN_SECRET',
        'ACTIVATE_ACCOUNT',
      );
    const tokenExpireTime = await this.settingService.getSettingByKeyAndGroup(
      type === 'ACCESS'
        ? 'TOKEN_EXPIRATION_TIME'
        : 'REFRESH_TOKEN_EXPIRATION_TIME',
      'ACTIVATE_ACCOUNT',
    );

    let userData = null
    // const userData = await this.getUserInfo(userId);
    const role = await this.userService.getUserInfo(userId);
    if (role.role === 'ADMIN')  userData = role;
    else {
      const roleInfo = await this.userService.getRoleOfUser(userId);
      // console.log(roleInfo);
      const dataReturn = await this.userService.getRoleAndPermission(userId, roleInfo);
      userData = dataReturn;
    }

    const payload = userData;
    const token = this.jwtService.sign(payload, {
      secret: tokenSecretSetting.value,
      expiresIn: `${tokenExpireTime.value}s`,
    });
    return token;
  }

  async resendConfirmationLink(userId: string) {
    const result = new ReturnResult<boolean>();
    try {
      const user = await this.userService.getUserById(userId);
      if (user.isActive) throw new Error();

      result.result = true;
      await this.sendVerificationLink(user.email);
    } catch (error) {
      result.message = 'Email already confirmed';
    }
    return result;
  }

  async setRefreshToken(refreshToken: string, userId: string) {
    return await this.userService.setRefreshToken(refreshToken, userId);
  }

  async removeToken(userId: string) {
    let result = new ReturnResult<boolean>();
    try {
      result = await this.userService.removeToken(userId);
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  async updatePassword(userId: string, data: UpdatePasswordDTO) {
    return await this.userService.updatePassword(userId, data);
  }

  async updateAccount(userId: string, data: UpdateAccountDTO) {
    return await this.userService.updateAccount(userId, data);
  }

  async forgotPassword(email: string) {
    const result = new ReturnResult<boolean>();
    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user) throw new Error();

      await this.sendRecoveyPasswordLink(user);
      result.result = true;
    } catch (error) {
      result.message = `Email ${email} is not found`;
    }
    return result;
  }

  async decodeResetToken(token: string) {
    const result = new ReturnResult<string>();
    try {
      const tokenSecretSetting =
        await this.settingService.getSettingByKeyAndGroup(
          'TOKEN_SECRET',
          'ACTIVATE_ACCOUNT',
        );
      const payload = await this.jwtService.verify(token, {
        secret: tokenSecretSetting.value,
      });

      if (typeof payload === 'object' && 'id' in payload)
        result.result = payload.id;
      else throw new Error();
    } catch (error) {
      if (error?.name === 'TokenExpiredError')
        result.message = 'Reset password token expired';
      else result.message = 'Wrong reset password token';
    }
    return result;
  }

  async resetPassword(userId: string, password: string) {
    return await this.userService.resetPassword(userId, password);
  }

  async getUserFromAuthToken(token: string) {
    try {
      const tokenSecretSetting =
        await this.settingService.getSettingByKeyAndGroup(
          'TOKEN_SECRET',
          'ACTIVATE_ACCOUNT',
        );
      const payload = await this.jwtService.verify(token, {
        secret: tokenSecretSetting.value,
      });

      if (payload.id) return payload.id;
    } catch (error) {
      return null;
    }
  }

  async validateAPIKey(apiKey: string) {
    const APIKey = await this.settingService.getSettingByKeyAndGroup(
      'APIKEY',
      'AUTH',
    );
    if (!APIKey?.value || (APIKey?.value && APIKey.value.length === 0)) {
      return null;
    } else {
      const listAPIKey = APIKey.value.split(',');
      return listAPIKey.find((key) => apiKey === key);
    }
  }

  private async sendRecoveyPasswordLink(user: User) {
    const payload: RecoveryPasswordPayload = { id: user.id };
    const tokenSecretSetting =
      await this.settingService.getSettingByKeyAndGroup(
        'TOKEN_SECRET',
        'ACTIVATE_ACCOUNT',
      );
    const tokenExpireTime = await this.settingService.getSettingByKeyAndGroup(
      'TOKEN_EXPIRATION_TIME',
      'ACTIVATE_ACCOUNT',
    );
    const URLRecovery = await this.settingService.getSettingByKeyAndGroup(
      'RECOVERY_PASSWORD_URL',
      'DOMAIN',
    );

    const token = this.jwtService.sign(payload, {
      secret: tokenSecretSetting.value,
      expiresIn: `${tokenExpireTime.value}s`,
    });
    const tokenSecret = await this.tokenService.createToken(token);

    const recoveryURL = `${URLRecovery.value}/?token=${tokenSecret.id}`;

    return this.emailQueueService.addEmailToQueue({
      to: user.email,
      subject: 'Recovery Password',
      template: './recoverryPassword',
      context: {
        recoveryURL: recoveryURL,
        userName: user.userName,
      },
    });
  }

  private async sendVerificationLink(email: string | null) {
    if (!email) return;

    const payload: VerificationTokenPayload = { email };
    const tokenSecretSetting =
      await this.settingService.getSettingByKeyAndGroup(
        'TOKEN_SECRET',
        'ACTIVATE_ACCOUNT',
      );
    const tokenExpireTime = await this.settingService.getSettingByKeyAndGroup(
      'TOKEN_EXPIRATION_TIME',
      'ACTIVATE_ACCOUNT',
    );
    const URLConfirm = await this.settingService.getSettingByKeyAndGroup(
      'EMAIL_CONFIRMATION_URL',
      'DOMAIN',
    );

    const token = this.jwtService.sign(payload, {
      secret: tokenSecretSetting.value,
      expiresIn: `${tokenExpireTime.value}s`,
    });

    const tokenSecret = await this.tokenService.createToken(token);

    const activateUrl = `${URLConfirm.value}/?token=${tokenSecret.id}`;

    return this.emailQueueService.addEmailToQueue({
      to: email,
      subject: 'Welcome to My App!',
      template: './welcome',
      context: {
        activateUrl,
      },
    });
  }

  private async getUserInfo(userId: string) {
    return await this.userService.getUserInfo(userId);
  }
}
