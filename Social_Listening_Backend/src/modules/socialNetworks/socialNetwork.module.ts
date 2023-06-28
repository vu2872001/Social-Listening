import { PrismaModule } from 'src/config/database/database.config.module';
import { SocialGroupModule } from '../socialGroups/socialGroup.module';
import { Module, forwardRef } from '@nestjs/common';
import { SocialNetworkController } from './controllers/socialNetwork.controller';
import { SocialNetworkService } from './services/socialNetwork.service';
import { UserModule } from '../users/user.module';
import { RoleModule } from '../roles/role.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => SocialGroupModule),
    forwardRef(() => UserModule),
    RoleModule,
  ],
  controllers: [SocialNetworkController],
  providers: [SocialNetworkService],
  exports: [SocialNetworkService],
})
export class SocialNetworkModule {}
