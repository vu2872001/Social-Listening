import { TokenService } from './../../token/services/token.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDTO } from '../dtos/register.dto';
import { ConfirmEmailDTO } from '../dtos/comfirmEmail.dto';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { RequestWithUser } from '../interface/requestWithUser.interface';
import { LocalAuthGuard } from '../guards/localAuth.guard';
import { JWTAuthGuard } from '../guards/jwtAuth.guard';
import JWTRefreshGuard from '../guards/jwtRefresh.guard';
import { Token } from '../dtos/token.dto';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { UpdatePasswordDTO } from '../dtos/updatePassword.dto';
import { UpdateAccountDTO } from '../dtos/updateAccount.dto';
import { ForgotPasswordDTO } from '../dtos/forgotPassword.dto';
import { ResetPasswordDTO } from '../dtos/resetPassword.dto';
import { LogService } from 'src/modules/activityLogs/services/log.service';
import { CreateLogDTO } from 'src/common/models/dto/log.dto';
import { ActivityType } from 'src/common/enum/activityType.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly logService: LogService,
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('/register')
  async register(@Body() registrationData: RegisterDTO) {
    return this.authService.register(registrationData);
  }

  @Post('/confirm-email')
  async confirm(@Body() data: ConfirmEmailDTO): Promise<ReturnResult<boolean>> {
    const result = new ReturnResult<boolean>();
    try {
      const tokenId = data.token;
      const token = await this.tokenService.getToken(tokenId);
      if (!token) throw new Error(`Invalid token`);

      const email = await this.authService.decodeToken(token);
      result.result = await this.authService.confirmEmail(email);
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('/validate-token/:tokenId')
  async validateToken(@Param() { tokenId }) {
    const result = new ReturnResult<boolean>();
    try {
      const validateToken = await this.tokenService.validateToken(tokenId);
      result.result = validateToken;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('/log-in')
  async logIn(@Req() request: RequestWithUser) {
    const user = request.user;
    const result = new ReturnResult<Token>();
    try {
      const access = await this.authService.getJwtToken(user.id, 'ACCESS');
      const refresh = await this.authService.getJwtToken(user.id, 'REFRESH');

      await this.authService.setRefreshToken(refresh, user.id);
      await this.logService.createLog(
        new CreateLogDTO(ActivityType.Login, user.userName),
      );
      result.result = new Token(access, refresh);
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  @Post('/resend-token')
  @UseGuards(JWTAuthGuard)
  async resendToken(@Req() request: RequestWithUser) {
    return await this.authService.resendConfirmationLink(request.user.id);
  }

  @UseGuards(JWTRefreshGuard)
  @Get('refresh-token')
  async refresh(@Req() request: RequestWithUser) {
    const user = request.user;
    const result = new ReturnResult<Token>();
    try {
      const access = await this.authService.getJwtToken(user.id, 'ACCESS');
      const refresh = await this.authService.getJwtToken(user.id, 'REFRESH');

      await this.authService.setRefreshToken(refresh, user.id);
      result.result = new Token(access, refresh);
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  @Post('/log-out')
  @UseGuards(JWTAuthGuard)
  async logout(@Req() request: RequestWithUser) {
    const user = request.user;
    return await this.authService.removeToken(user.id);
  }

  @Post('/update-password')
  @UseGuards(JWTAuthGuard)
  async updatePassword(
    @Req() request: RequestWithUser,
    @Body() data: UpdatePasswordDTO,
  ) {
    const user = request.user;
    return await this.authService.updatePassword(user.id, data);
  }

  @Post('/update-account')
  @UseGuards(JWTAuthGuard)
  async updateInformation(
    @Req() request: RequestWithUser,
    @Body() data: UpdateAccountDTO,
  ) {
    const user = request.user;
    return await this.authService.updateAccount(user.id, data);
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() data: ForgotPasswordDTO) {
    return await this.authService.forgotPassword(data.email);
  }

  @Post('/reset-password/:tokenId')
  async resetPassword(@Param() { tokenId }, @Body() data: ResetPasswordDTO) {
    const result = new ReturnResult<boolean>();
    try {
      const token = await this.tokenService.getToken(tokenId);
      if (!token) throw new Error(`Invalid token`);

      const decodeData = await this.authService.decodeResetToken(token);
      if (decodeData.message == null)
        return await this.authService.resetPassword(
          decodeData.result,
          data.password,
        );
      else throw new Error(decodeData.message);
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
