import { Module } from '@nestjs/common';
import { PrismaModule } from './../../config/database/database.config.module';
import { PermissionService } from './services/permission.service';
import { RolePermissionService } from './services/rolePermission.service';
import { PermissionController } from './controllers/rolePermission.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PermissionController],
  providers: [PermissionService, RolePermissionService],
  exports: [PermissionService, RolePermissionService],
})
export class PermissionModule {}
