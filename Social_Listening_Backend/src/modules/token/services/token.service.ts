import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';

@Injectable()
export class TokenService {
  constructor(private readonly prismaService: PrismaService) {}

  async createToken(token: string) {
    const dataCreate = { token: token };
    return this.prismaService.token.create({ data: dataCreate });
  }

  async getToken(tokenId: string) {
    const checkValidate = await this.validateToken(tokenId);
    if (!checkValidate) return null;

    const token = await this.prismaService.token.findFirst({
      where: { id: tokenId, deleted: false },
    });
    return token?.token;
  }

  async validateToken(tokenId: string) {
    const token = await this.prismaService.token.findFirst({
      where: { id: tokenId, deleted: false },
    });

    if (!token) return false;

    //Token Expire in  1 hour
    token.dateExpires.setTime(token.dateExpires.getTime() + 60 * 60 * 1000);
    if (token.dateExpires.getTime() >= Date.now()) return true;

    return false;
  }
}
