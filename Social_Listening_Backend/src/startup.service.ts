import { RolePerm } from './modules/roles/enum/permission.enum';
import { CreatePermissionDTO } from './modules/permission/dtos/createPermission.dto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RoleService } from './modules/roles/services/role.service';
import { UserService } from './modules/users/services/user.service';
import { CreateRoleDTO } from './modules/roles/dtos/createRole.dto';
import { CreateUserDTO } from './modules/users/dtos/createUser.dto';
import { SettingService } from './modules/setting/service/setting.service';
import { CreateSettingDTO } from './modules/setting/dto/createSetting.dto';
import { PermissionService } from './modules/permission/services/permission.service';
import { RolePermissionService } from './modules/permission/services/rolePermission.service';
import { ConvertObjectToArray, toDTO } from './utils/convert';
import { PermissionPerm } from './modules/permission/enum/permission.enum';
import { UserPerm } from './modules/users/enum/permission.enum';
import { SocialNetworkPerm } from './modules/socialNetworks/enum/permission.enum';
import { SettingPerm } from './modules/setting/enum/permission.enum';
import { SocialTabPerm } from './modules/socialGroups/enum/permission.enum';
import { SocialSettingPerm } from './modules/socialSetting/enum/permission.enum';
import { WorkflowPerm } from './modules/workflows/enum/permission.enum';
import { CommentPerm } from './modules/socialMessage/enum/permission.enum';
import { MessagePerm } from './modules/message/enum/permission.enum';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  adminInfo: CreateUserDTO;
  adminId: string;
  ownerId: string;
  listSetting: CreateSettingDTO[];
  listDefaultRole: CreateRoleDTO[];
  listPermission: CreatePermissionDTO[] = [];

  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly settingService: SettingService,
    private readonly permissionService: PermissionService,
    private readonly rolePermissionService: RolePermissionService,
  ) {
    this.listDefaultRole = [
      { roleName: 'ADMIN', level: 5 },
      { roleName: 'OWNER', level: 4 },
      { roleName: 'MANAGER', level: 3 },
      { roleName: 'SUPPORTER', level: 2 },
    ];
    this.adminInfo = {
      email: 'admin@social-listening.com',
      password: '@N0tH3r_Pa55',
    };
    this.listSetting = [
      {
        group: 'EMAIL',
        key: 'SENDGRID_API_KEY',
        value: '',
      },
      {
        group: 'DOMAIN',
        key: 'EMAIL_CONFIRMATION_URL',
        value: '',
      },
      {
        group: 'DOMAIN',
        key: 'RECOVERY_PASSWORD_URL',
        value: '',
      },
      {
        group: 'ACTIVATE_ACCOUNT',
        key: 'TOKEN_EXPIRATION_TIME',
        value: '43200',
      },
      {
        group: 'ACTIVATE_ACCOUNT',
        key: 'REFRESH_TOKEN_EXPIRATION_TIME',
        value: '43200',
      },
      {
        group: 'ACTIVATE_ACCOUNT',
        key: 'TOKEN_SECRET',
        value: '@N0tH3r_Pa55',
      },
      {
        group: 'FILE',
        key: 'UPLOADED_FILE_DESTINATION',
        value: './upload',
      },
      {
        group: 'CONNECTOR',
        key: 'FACEBOOK_APP_ID',
        value: '',
      },
      {
        group: 'CONNECTOR',
        key: 'FACEBOOK_APP_SECRET',
        value: '',
      },
      {
        group: 'CONNECTOR',
        key: 'FACEBOOK_APP_VERSION',
        value: '',
      },
      {
        group: 'CONNECTOR',
        key: 'FACEBOOK_APP_CONFIG_ID',
        value: '',
      },
      {
        group: 'AUTH',
        key: 'APIKEY',
        value: '',
      },
      {
        group: 'GOOGLE_API',
        key: 'DIALOGFLOW_KEY',
        value: '',
      },
      {
        group: 'GOOGLE_API',
        key: 'DIALOGFLOW_LOCATION',
        value: '',
      },
      {
        group: 'DOMAIN',
        key: 'DOMAIN_BOT_CONNECTOR',
        value: '',
      },
      {
        group: 'DOMAIN',
        key: 'DOMAIN_BOT',
        value: '',
      },
      {
        group: 'DOMAIN',
        key: 'DOMAIN_BACKEND',
        value: '',
      },
      {
        group: 'DOMAIN',
        key: 'DOMAIN_FRONTEND',
        value: '',
      },
    ];
    const listPerm = [
      UserPerm,
      PermissionPerm,
      RolePerm,
      SettingPerm,
      SocialNetworkPerm,
      SocialTabPerm,
      SocialSettingPerm,
      WorkflowPerm,
      CommentPerm,
      MessagePerm,
    ];

    listPerm.forEach((perm) => {
      const permissions = ConvertObjectToArray(perm).map((permission) =>
        toDTO(permission, CreatePermissionDTO),
      );
      this.listPermission = [...this.listPermission, ...permissions];
    });
  }

  async onModuleInit() {
    await this.createDefaultSetting();
    await this.createDefaultRole();
    await this.createDefauttAdmin();
    await this.createDefaultPermission();
  }

  private async createDefaultRole() {
    await Promise.all(
      this.listDefaultRole.map(async (role) => {
        const existRole = await this.roleService.getRoleByRoleName(
          role.roleName,
        );

        if (!existRole) {
          const newRole = await this.roleService.createRole(role);
          if (role.roleName === 'ADMIN') this.adminId = newRole.id;
          else if (role.roleName === 'OWNER') this.ownerId = newRole.id;
        } else {
          if (existRole.roleName === 'ADMIN') this.adminId = existRole.id;
          else if (existRole.roleName === 'OWNER') this.ownerId = existRole.id;
        }
      }),
    );
    this.logger.log('Creating new roles');
  }

  private async createDefauttAdmin() {
    const existingUser = await this.userService.getUserByEmail(
      this.adminInfo.email,
    );

    if (!existingUser) {
      const newUser = await this.userService.createUser(this.adminInfo, true);
      await this.userService.activeAccount(newUser.result.id);
    }
    this.logger.log('Creating new user');
  }

  private async createDefaultSetting() {
    await Promise.all(
      this.listSetting.map(async (setting) => {
        const existSetting = await this.settingService.getSettingByKeyAndGroup(
          setting.key,
          setting.group,
        );

        if (!existSetting) await this.settingService.createSetting(setting);
      }),
    );
    this.logger.log('Creating new setting');
  }

  private async createDefaultPermission() {
    await Promise.all(
      this.listPermission.map(async (permission) => {
        const existingPermission =
          await this.permissionService.getPermissionByName(
            permission.permission,
          );

        if (!existingPermission) {
          const newPermission = await this.permissionService.createPermission(
            permission,
          );
          await this.rolePermissionService.assignPermissionToRole(
            this.adminId,
            newPermission.id,
          );
        }
      }),
    );
    this.logger.log('Create new permission and assign to admin');
  }
}
