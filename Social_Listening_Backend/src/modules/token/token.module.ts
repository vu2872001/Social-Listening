import { PrismaModule } from 'src/config/database/database.config.module';
import { TokenService } from './services/token.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
