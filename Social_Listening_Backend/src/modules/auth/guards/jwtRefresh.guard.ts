import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export default class JWTRefreshGuard extends AuthGuard('refresh-token') {}
