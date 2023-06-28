import { PrismaModule } from 'src/config/database/database.config.module';
import { SocialPostController } from './controllers/socialPost.controller';
import { SocialPostService } from './services/socialPost.service';
import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [SocialPostController],
  providers: [SocialPostService],
  exports: [SocialPostService],
})
export class SocialPostModule {}
