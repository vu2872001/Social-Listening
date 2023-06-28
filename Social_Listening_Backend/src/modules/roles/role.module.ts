import { Module } from '@nestjs/common';
import { RoleService } from './services/role.service';
import { PrismaModule } from './../../config/database/database.config.module';
import { PermissionModule } from '../permission/permission.module';
import { RoleController } from './controllers/role.controller';

@Module({
  imports: [PrismaModule, PermissionModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
