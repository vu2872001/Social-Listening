import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateUserDTO } from '../dtos/createUser.dto';
import { CreateUserInput } from '../dtos/createUser.input';
import { RoleService } from 'src/modules/roles/services/role.service';
import { comparePassword, hashedPasword } from 'src/utils/hashPassword';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from 'src/utils/PrismaError';
import { excludeData } from 'src/utils/excludeData';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { User } from '../model/user.model';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { excludeUser, excludeUsers } from '../model/exclude.model';
import { RolePermissionService } from 'src/modules/permission/services/rolePermission.service';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDTO } from 'src/modules/auth/dtos/updatePassword.dto';
import { UpdateAccountDTO } from 'src/modules/auth/dtos/updateAccount.dto';
import { CreateEmployeeDTO } from '../dtos/createEmployee.dto';
import { ImportEmployeeDTO } from '../dtos/importEmployee.dto';
import { Helper, plainToClassCustom } from 'src/utils/hepler';
import { ResultImportDTO } from 'src/common/models/import/importUser.dto';
import { SocialGroupService } from 'src/modules/socialGroups/services/socialGroup.service';
import { UserInGroupService } from './userInGroup.service';
import { CreateFileDTO } from 'src/modules/files/dtos/createFile.dto';
import { FileService } from 'src/modules/files/services/file.service';
import { NotificationService } from 'src/modules/notifications/services/notification.service';
import { EditEmployeeDTO } from '../dtos/editEmployee.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly roleService: RoleService,
    private readonly fileService: FileService,
    private readonly prismaService: PrismaService,
    private readonly groupService: SocialGroupService,
    private readonly userGroupService: UserInGroupService,
    private readonly notificationService: NotificationService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async createUser(userData: CreateUserDTO, fromStartupApp = false) {
    const result = new ReturnResult<User>();
    try {
      const userRole = await this.roleService.getRoleByRoleName(
        fromStartupApp ? 'ADMIN' : 'OWNER',
      );
      const hashedPassword = await hashedPasword(userData.password);

      const userCreated: CreateUserInput = {
        email: userData.email,
        userName: userData.email,
        fullName: userData.email,
        password: hashedPassword,
        roleId: userRole.id,
      };
      const user = await this.prismaService.user.create({
        data: userCreated,
      });
      result.result = excludeData(user, [
        'password',
        'createdAt',
        'updatedAt',
        'roleId',
        'deleteAt',
        'refreshToken',
      ]);
    } catch (error) {
      this.logger.error(`Function: CreateUser, Error: ${error.message}`);
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  async getUserById(userId: string) {
    return this.prismaService.user.findFirst({ where: { id: userId } });
  }

  async getUserByEmail(email: string) {
    return this.prismaService.user.findFirst({
      where: { email: email, deleteAt: false },
    });
  }

  async activeAccount(userId: string) {
    try {
      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          isActive: true,
        },
      });
      return true;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === PrismaError.RecordDoesNotExist
      ) {
        throw new NotFoundException(`Not found user with id: ${userId}`);
      }
      throw error;
    }
  }

  async getUserInfo(userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
      include: { role: true },
    });
    const newData = excludeData(user, excludeUser);
    const roleName = newData.role.roleName;
    const listPermission =
      await this.rolePermissionService.getAllPermissionOfRole(newData.role.id);
    return {
      ...newData,
      role: roleName,
      permissions: listPermission,
    };
  }

  async setRefreshToken(refreshToken: string, userId: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async getUserByToken(refreshToken: string, userId: string) {
    const user = await this.getUserById(userId);

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

    if (isMatch) return user;
    else return null;
  }

  async updatePassword(userId: string, data: UpdatePasswordDTO) {
    const result = new ReturnResult<boolean>();
    try {
      const user = await this.prismaService.user.findFirst({
        where: { id: userId },
      });

      const isMatch = await comparePassword(data.oldPassword, user.password);
      if (!isMatch) throw new Error();

      const hashedPassword = await hashedPasword(data.newPassword);
      await this.prismaService.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      result.result = true;
    } catch (error) {
      result.message = 'Old Password does not match';
    }
    return result;
  }

  async removeToken(userId: string) {
    const result = new ReturnResult<boolean>();
    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
      result.result = true;
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  async resetPassword(userId: string, password: string) {
    const result = new ReturnResult<boolean>();
    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { password: await hashedPasword(password) },
      });
      result.result = true;
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  async updateAccount(userId: string, data: UpdateAccountDTO) {
    const result = new ReturnResult<User>();
    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          email: data.email,
          userName: data.userName,
          fullName: data.fullName,
          phoneNumber: data?.phoneNumber,
          gender: Helper.getGender(data.gender),
        },
      });

      const user = await this.getUserById(userId);
      result.result = excludeData(user, [
        'password',
        'createdAt',
        'updatedAt',
        'roleId',
        'deleteAt',
        'refreshToken',
      ]);
    } catch (error) {
      console.log(error);
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  async createEmployee(data: CreateEmployeeDTO) {
    const result = new ReturnResult<User>();
    try {
      const hashedPassword = await hashedPasword(data.password);

      const userCreated: CreateUserInput = {
        email: data.email,
        userName: data.userName ?? data.email,
        fullName: data.fullName ?? data.email,
        password: hashedPassword,
        roleId: data.roleId,
      };
      const user = await this.prismaService.user.create({
        data: {
          ...userCreated,
          isActive: true,
          gender: Helper.getGender(data.gender),
        },
      });
      result.result = excludeData(user, [
        'password',
        'createdAt',
        'updatedAt',
        'roleId',
        'deleteAt',
        'refreshToken',
      ]);
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  async editEmployee(data: EditEmployeeDTO) {
    const result = new ReturnResult<User>();
    try {
      const user = await this.prismaService.user.update({
        where: { id: data.id },
        data: {
          email: data.email,
          userName: data.userName,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          gender: Helper.getGender(data.gender),
        },
      });
      result.result = excludeData(user, [
        'password',
        'createdAt',
        'updatedAt',
        'roleId',
        'deleteAt',
        'refreshToken',
      ]);
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  async removeAccount(userId: string) {
    return await this.prismaService.user.update({
      where: { id: userId },
      data: { deleteAt: true },
    });
  }

  async findUser(page) {
    const listUser = await this.prismaService.user.findMany({
      where: page.filter,
      orderBy: page.orders,
      include: {
        role: true,
      },
      skip: (page.pageNumber - 1) * page.size,
      take: page.size,
    });

    return listUser.map((user) => excludeData(user, excludeUsers));
  }

  async countUser(page) {
    return await this.prismaService.user.count({
      where: page.filter,
    });
  }

  async findUserWithGroup(page) {
    const listUser = await this.prismaService.userInGroup.findMany({
      where: page.filter,
      orderBy: page.orders,
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
      skip: (page.pageNumber - 1) * page.size,
      take: page.size,
    });

    return listUser.map((user) => {
      user.user.isActive = user.isActive;
      return excludeData(user.user, excludeUsers);
    });
  }

  async countUserWithGroup(page) {
    return await this.prismaService.userInGroup.count({
      where: page.filter,
    });
  }

  async saveFile(file: Express.Multer.File, ownerId: string) {
    const group = await this.userGroupService.getGroupById(ownerId);

    const dataCreateFile: CreateFileDTO = {
      fileName: Helper.getFileName(file.filename),
      fileExt: Helper.getFileExtension(file.filename),
      path: file.path,
      ownerId: ownerId,
      groupId: group?.id,
      minetype: file.mimetype,
    };
    await this.fileService.saveFile(dataCreateFile);
  }

  async importData(data: any[], ownerId: string, columnMapping: string) {
    const result = new ReturnResult<ResultImportDTO>();
    const importResult = new ResultImportDTO();

    try {
      const roleUser = await this.roleService.getRoleByRoleName('OWNER');
      const group = await this.groupService.getSocialGroupByManagerId(ownerId);
      const mapping = JSON.parse(columnMapping);

      importResult.totalImport = data.length;

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          const user = plainToClassCustom(ImportEmployeeDTO, row, mapping);

          const isChecked = this.checkData(user);
          if (!isChecked) throw Error();

          const _ = await this.roleService.getRoleByRoleName('SUPPORTER');
          if (_.level >= roleUser.level) throw Error();

          const createEmployeeInput: CreateEmployeeDTO = {
            ...user,
            roleId: _.id,
            gender: Helper.getGender(user.gender),
          };

          const userCreated = await this.createEmployee(createEmployeeInput);
          if (userCreated.result === null) throw Error();

          const newUser = userCreated.result;
          await this.userGroupService.addUserToGroup(newUser.id, group.id);

          importResult.importSuccess += 1;
        } catch (error) {
          importResult.importFailure += 1;
        }
      }
    } catch (error) {
      console.log(error.message);
    }

    result.result = importResult;
    await this.notificationService.createNotification(
      {
        title: 'Import Account Successfully',
        body: 'Click to view import result',
        type: 'External Success',
        extendData: JSON.stringify(result.result),
      },
      ownerId,
    );
    console.log(result.result);
  }

  async exportAllUser() {
    const listUser = await this.prismaService.user.findMany({
      where: { deleteAt: false },
      include: { role: true },
    });
    return listUser.map((user) => {
      const dataUser = excludeData(user, excludeUsers);
      const data = {
        ...dataUser,
        roleName: dataUser.role.roleName,
      };
      delete data['role'];
      return data;
    });
  }

  async exportUserInGroup(groupId: string) {
    const listUser = await this.prismaService.userInGroup.findMany({
      where: { delete: false, groupId: groupId },
      include: {
        user: {
          include: { role: true },
        },
      },
    });
    return listUser.map((userData) => {
      const dataUser = excludeData(userData.user, excludeUsers);
      const data = {
        ...dataUser,
        roleName: dataUser.role.roleName,
      };
      delete data['role'];
      return data;
    });
  }

  async findUserWithTab(page) {
    const listUser = await this.prismaService.userInTab.findMany({
      where: page.filter,
      orderBy: page.orders,
      include: {
        user: true,
        role: true,
      },
      skip: (page.pageNumber - 1) * page.size,
      take: page.size,
    });

    return listUser.map((user) => {
      return {
        user: excludeData(user.user, excludeUsers),
        role: excludeData(user.role, []),
      };
    });
  }

  async countUserWithTab(page) {
    return await this.prismaService.userInTab.count({
      where: page.filter,
    });
  }

  private checkData(data: ImportEmployeeDTO) {
    const email = data.email;
    const password = data.password;

    const checkEmail = this.validateEmail(email);
    const checkPassword = password.length >= 8 && password.length <= 50;

    return checkEmail && checkPassword;
  }

  async getRoleAndPermission(userId: string, roleName: string){
    try{
      const user = await this.prismaService.user.findFirst({
        where: { id: userId },
        include: { role: true },
      });
      const newData = excludeData(user, excludeUser);
      const role = await this.prismaService.role.findFirst({
        where: {roleName: roleName}
      })
      const listPermission =
        await this.rolePermissionService.getAllPermissionOfRole(role.id);
      return {
        ...newData,
        role: roleName,
        permissions: listPermission,
      };
    }
    catch (error){
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async getRoleOfUser(userId: string){
    try{
      const listRole = await this.prismaService.userInTab.findMany({
        where: {userId: userId, delete: false},
        include: {role: true}
      })
      let maxRoleLevel = -1;
      listRole.forEach(x => {
        maxRoleLevel = Math.max(maxRoleLevel, x.role.level)
      });

      if (maxRoleLevel === -1) {
        const data = await this.getUserInfo(userId);
        return data.role;
      }

      switch (maxRoleLevel) {
        case 5:
          return 'ADMIN';
        case 4: 
          return 'OWNER';
        case 3: 
          return 'MANAGER'
        default:
          return 'SUPPORTER'
      }
    }
    catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE)
    }
  }

  private validateEmail = (email: string) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
  };
}
