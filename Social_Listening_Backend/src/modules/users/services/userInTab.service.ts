import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { AssignUserDTO } from '../dtos/assignUser.dto';
import { RoleService } from 'src/modules/roles/services/role.service';
import { UpdateRoleUserDTO } from '../dtos/updateRoleUser.dto';
import { SocialLogService } from 'src/modules/socialLogs/services/socialLog.service';
import { UserService } from './user.service';
import { SocialTabService } from 'src/modules/socialGroups/services/socialTab.service';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';

@Injectable()
export class UserInTabService {
  managerRole = null;
  supporterRole = null;

  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly socialTabService: SocialTabService,
    private readonly socialLogService: SocialLogService,
  ) {
    this.initRole();
  }

  async initRole() {
    this.managerRole = await this.roleService.getRoleByRoleName('MANAGER');
    this.supporterRole = await this.roleService.getRoleByRoleName('SUPPORTER');
  }

  async addUserToTab(userId: string, tabId: string, roleId: string) {
    const tab = await this.socialTabService.getSocialTabById(tabId);
    const user = await this.userService.getUserById(userId);

    const dataCreated = await this.prismaService.userInTab.create({
      data: {
        user: { connect: { id: userId } },
        socialTab: { connect: { id: tabId } },
        role: { connect: { id: roleId } },
      },
    });

    await this.socialLogService.saveSocialLog({
      tabId: tabId,
      title: 'Add User to Tab',
      body: `User #${user.userName} is added to tab #${tab.name}`,
      activity: 'Add User',
    });

    return dataCreated;
  }

  async removeUserFromTab(userInTabId: number) {
    try {
      await this.prismaService.userInTab.update({
        where: { id: userInTabId },
        data: { delete: true },
      });
      return true;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async assignUsers(data: AssignUserDTO) {
    const listUser = data.users;
    const listTab = data.tabs;
    const fakeDB = new Map<string, object>();

    const role = await this.roleService.getRoleByRoleName('SUPPORTER');

    await Promise.all(
      listUser.map(async (userId) => {
        const user = await this.userService.getUserById(userId);
        fakeDB[userId] = user;
      }),
    );

    await Promise.all(
      listTab.map(async (tabId) => {
        const tab = await this.socialTabService.getSocialTabById(tabId);
        fakeDB[tabId] = tab;
      }),
    );

    for (const userId of listUser) {
      for (const tabId of listTab) {
        const check = await this.checkUserInTab(userId, tabId);
        if (!check) {
          try {
            await this.addUserToTab(userId, tabId, role.id);

            const tab = fakeDB[tabId];
            const user = fakeDB[userId];

            await this.socialLogService.saveSocialLog({
              tabId: tabId,
              title: 'Add User to Tab',
              body: `User #${user.userName} is added to tab #${tab.name}`,
              activity: 'Add User',
            });
          } catch (error) {}
        }
      }
    }
  }

  async unassignUsers(data: AssignUserDTO) {
    const listUser = data.users;
    const listTab = data.tabs;
    const fakeDB = new Map<string, object>();

    await Promise.all(
      listUser.map(async (userId) => {
        const user = await this.userService.getUserById(userId);
        fakeDB[userId] = user;
      }),
    );

    await Promise.all(
      listTab.map(async (tabId) => {
        const tab = await this.socialTabService.getSocialTabById(tabId);
        fakeDB[tabId] = tab;
      }),
    );

    for (const userId of listUser) {
      for (const tabId of listTab) {
        const check = await this.checkUserInTab(userId, tabId);
        if (check) {
          try {
            await this.removeUserFromTab(check.id);
          } catch (error) {}
        }
      }
    }
  }

  async updateRoleUser(data: UpdateRoleUserDTO) {
    if (data.roleId === this.managerRole.id) {
      const managerOfTab = await this.getManagerOfTab(data.tabId);
      if (managerOfTab) {
        await this.prismaService.userInTab.update({
          where: { id: managerOfTab.id },
          data: { roleId: this.supporterRole.id },
        });

        const user = await this.userService.getUserById(managerOfTab.userId);
        await this.socialLogService.saveSocialLog({
          tabId: data.tabId,
          title: `Update Role of User`,
          body: `User #${user.userName} is assigned the ${this.supporterRole.roleName} role`,
          activity: 'Update Role',
        });
      }
    }

    const user = await this.prismaService.userInTab.findFirst({
      where: { tabId: data.tabId, userId: data.userId, delete: false },
    });

    await this.prismaService.userInTab.update({
      data: { roleId: data.roleId },
      where: { id: user.id },
    });

    const userData = await this.userService.getUserById(user.userId);
    await this.socialLogService.saveSocialLog({
      tabId: data.tabId,
      title: `Update Role of User`,
      body: `User #${userData.userName} is assigned the ${this.managerRole.roleName} role`,
      activity: 'Update Role',
    });
  }

  async checkUserInTab(userId: string, tabId: string) {
    const userInTab = await this.prismaService.userInTab.findFirst({
      where: { tabId: tabId, userId: userId, delete: false },
    });
    return userInTab;
  }

  async getAllTabWithUser(userId: string) {
    const listTab = await this.prismaService.userInTab.findMany({
      where: { userId: userId, delete: false },
    });
    return listTab.map((tab) => tab.tabId);
  }

  private async getManagerOfTab(tabId: string) {
    const user = await this.prismaService.userInTab.findFirst({
      where: { tabId: tabId, roleId: this.managerRole.id, delete: false },
    });

    return user;
  }
}
