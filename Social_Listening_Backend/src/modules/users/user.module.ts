import { SocialGroupModule } from './../socialGroups/socialGroup.module';
import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './services/user.service';
import { PrismaModule } from 'src/config/database/database.config.module';
import { RoleModule } from '../roles/role.module';
import { PermissionModule } from '../permission/permission.module';
import { UserInGroupService } from './services/userInGroup.service';
import { UserController } from './controllers/user.controller';
import { FileModule } from '../files/file.module';
import { SettingModule } from '../setting/setting.module';
import { QueueModule } from '../queue/queue.module';
import { NotificationModule } from '../notifications/notification.module';
import { UserInTabService } from './services/userInTab.service';
import { SocialLogModule } from '../socialLogs/socialLog.module';

@Module({
  imports: [
    PrismaModule,
    RoleModule,
    PermissionModule,
    SocialGroupModule,
    SettingModule,
    FileModule,
    NotificationModule,
    SocialLogModule,
    forwardRef(() => QueueModule),
  ],
  controllers: [UserController],
  providers: [UserService, UserInGroupService, UserInTabService],
  exports: [UserService, UserInGroupService, UserInTabService],
})
export class UserModule {}
