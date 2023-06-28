import { PagedData } from './../../../common/models/paging/pagedData.dto';
import { UserInGroupService } from './../services/userInGroup.service';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateEmployeeDTO } from '../dtos/createEmployee.dto';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { User } from '../model/user.model';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { UserPerm } from '../enum/permission.enum';
import { SocialGroupService } from 'src/modules/socialGroups/services/socialGroup.service';
import { EmailConfirmGuard } from 'src/modules/auth/guards/emailConfirm.guard';
import { UserPage } from '../dtos/userPage.dto';
import { AdvancedFilteringService } from 'src/config/database/advancedFiltering.service';
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';
import { RoleService } from 'src/modules/roles/services/role.service';
import { FilesInterceptor } from 'src/modules/files/interceptors/file.interceptor';
import { v4 as uuidv4 } from 'uuid';
import { ImportUserQueueService } from 'src/modules/queue/services/importUser.queue.service';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { EditEmployeeDTO } from '../dtos/editEmployee.dto';
import { AssignUserDTO } from '../dtos/assignUser.dto';
import { UserInTabService } from '../services/userInTab.service';
import { UpdateRoleUserDTO } from '../dtos/updateRoleUser.dto';
import { FileContentResult } from 'src/common/models/file/fileContentResult.dto';
import { exportExcelFile } from 'src/utils/exportFile';
import { SocialTabService } from 'src/modules/socialGroups/services/socialTab.service';
import { Helper } from 'src/utils/hepler';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly tabService: SocialTabService,
    private readonly groupService: SocialGroupService,
    private readonly userInTabService: UserInTabService,
    private readonly userInGroupService: UserInGroupService,
    private readonly importUserQueueService: ImportUserQueueService,
    private readonly advancedFilteringService: AdvancedFilteringService,
  ) {}

  @Post('/create')
  @UseGuards(EmailConfirmGuard)
  @UseGuards(PermissionGuard(UserPerm.CreateUser.permission))
  async createEmployee(
    @Req() request: RequestWithUser,
    @Body() data: CreateEmployeeDTO,
  ) {
    let result = new ReturnResult<User>();
    let employeeData = null;
    const user = request.user;

    try {
      const userExist = await this.userService.getUserByEmail(data.email);
      if (userExist)
        throw new Error(`User with email ${data.email} already exists`);

      const group = await this.groupService.getSocialGroupByManagerId(user.id);
      const role = await this.roleService.getRoleByRoleName('SUPPORTER');

      // Set Role when creating is Supporter
      data.roleId = role.id;

      const employee = await this.userService.createEmployee(data);
      if (employee.result === null) throw new Error(employee.message);
      else employeeData = employee.result;

      await this.userInGroupService.addUserToGroup(employeeData.id, group.id);
      result = employee;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('/edit')
  @UseGuards(EmailConfirmGuard)
  @UseGuards(PermissionGuard(UserPerm.UpdateUser.permission))
  async editEmployee(
    @Req() request: RequestWithUser,
    @Body() data: EditEmployeeDTO,
  ) {
    let result = new ReturnResult<User>();
    const user = request.user;

    try {
      const userChange = await this.userService.getUserById(data.id);
      if (!userChange) throw new Error(`User ${data.id} does not exist`);

      const userExist = await this.userService.getUserByEmail(data.email);
      if (userExist && userExist.id !== data.id)
        throw new Error(`User with email ${data.email} already exists`);

      const role = await this.roleService.getRoleById(userChange.roleId);
      const roleOwner = await this.roleService.getRoleByRoleName(user.role);

      if (role.roleName === 'ADMIN' && user.role === 'ADMIN') {
        const employee = await this.userService.editEmployee(data);
        if (employee.result === null) throw new Error(employee.message);

        result = employee;
      } else if (user.role === 'OWNER' && role.level < roleOwner.level) {
        const group = await this.groupService.getSocialGroupByManagerId(
          user.id,
        );
        const userInGroup = await this.userInGroupService.getUserWithGroup(
          data.id,
          group.id,
        );
        if (!userInGroup) throw new Error(`Cannot edit this account`);

        const employee = await this.userService.editEmployee(data);
        if (employee.result === null) throw new Error(employee.message);

        result = employee;
      } else throw new Error(`Cannot edit this account`);
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('/remove/:id')
  @UseGuards(EmailConfirmGuard)
  @UseGuards(PermissionGuard(UserPerm.RemoveUser.permission))
  async removeEmployee(@Req() request: RequestWithUser, @Param() { id }) {
    const user = request.user;
    const result = new ReturnResult<boolean>();

    try {
      const userExist = await this.userService.getUserById(id);
      if (!userExist) throw new Error(`User with id: ${id} is not exists`);

      const role = await this.roleService.getRoleById(userExist.roleId);

      if (role.roleName !== 'ADMIN') {
        const group = await this.groupService.getSocialGroupByManagerId(
          user.id,
        );
        if (group.managerId === userExist.id)
          throw new Error(`Can not remove yourself from group`);

        await this.userInGroupService.removeUserFromGroup(
          userExist.id,
          group.id,
        );
      }
      await this.userService.removeAccount(userExist.id);

      result.result = true;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post()
  @UseGuards(PermissionGuard(UserPerm.GetAllUser.permission))
  async getAllUsers(@Req() request: RequestWithUser, @Body() page: UserPage) {
    const result = new ReturnResult<PagedData<object>>();
    const pagedData = new PagedData<object>(page);
    try {
      const data = this.advancedFilteringService.createFilter(page);
      data.filter.AND.push({ deleteAt: { equals: false } });
      const listResult = await this.userService.findUser(data);

      pagedData.data = listResult;
      pagedData.page.totalElement = await this.userService.countUser(data);

      result.result = pagedData;
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  @Post('/all')
  @UseGuards(JWTAuthGuard)
  async getAllUserWithGroup(
    @Req() request: RequestWithUser,
    @Body() page: UserPage,
  ) {
    const user = request.user;
    const result = new ReturnResult<PagedData<object>>();
    const pagedData = new PagedData<object>(page);

    try {
      if (user.role !== 'OWNER')
        throw new Error(`You are not allowed to access this page`);

      const group = await this.groupService.getSocialGroupByManagerId(user.id);

      const data = this.advancedFilteringService.createFilter(page);
      data.orders = data.orders.map((query) => {
        return {
          user: query,
        };
      });
      data.filter.AND = data.filter.AND.map((query) => {
        const paramCheck = Object.keys(query)[0];
        if (paramCheck === 'OR') {
          const subParam = query[paramCheck];
          const key = Object.keys(Object.values(subParam)[0]);
          if (key.includes('gender')) {
            const newParam = subParam.map((value) => {
              if (!value.gender.not) {
                return {
                  gender: {
                    equals: Helper.getGender(value.gender.equals),
                    // mode: 'insensitive',
                  },
                };
              } else {
                return {
                  gender: {
                    not: {
                      equals: Helper.getGender(value.gender.not.equals),
                      // mode: 'insensitive',
                    },
                  },
                };
              }
            });
            query = { OR: newParam };
          }
        }
        return {
          user: query,
        };
      });
      data.filter.AND.push({
        group: {
          id: group.id,
        },
      });
      data.filter.AND.push({ delete: { equals: false } });

      const listResult = await this.userService.findUserWithGroup(data);

      pagedData.data = listResult;
      pagedData.page.totalElement = await this.userService.countUserWithGroup(
        data,
      );
      result.result = pagedData;
    } catch (error) {
      if (error.message === `You are not allowed to access this page`)
        result.message = error.message;
      else result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  @Post('/create/admin')
  @UseGuards(PermissionGuard(UserPerm.CreateAdminAccount.permission))
  async createAdminAccount(@Body() data: CreateEmployeeDTO) {
    const result = new ReturnResult<User>();
    try {
      const role = await this.roleService.getRoleById(data.roleId);
      if (role.roleName !== 'ADMIN')
        throw new Error(`You cannot create account with role ${role.roleName}`);

      const userExists = await this.userService.getUserByEmail(data.email);
      if (userExists)
        throw new Error(`You cannot create account with email ${data.email}`);

      const userCreated = await this.userService.createEmployee(data);
      if (userCreated.message !== null) throw new Error(userCreated.message);

      result.result = userCreated.result;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('/import')
  @UseGuards(PermissionGuard(UserPerm.ImportUser.permission))
  @UseInterceptors(
    FilesInterceptor({
      fieldName: 'file',
      path: '/user/import',
      fileFilter: (request, file, callback) => {
        callback(null, true);
      },
      fileName: function (req, file, cb) {
        let uuid = uuidv4();
        uuid = uuid.toString().replace('-');
        const newFileName = `${uuid.substr(0, 10)}_${file.originalname}`;
        cb(null, newFileName);
      },
    }),
  )
  async importUser(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() { mappingColumn },
  ) {
    const user = request.user;

    if (user.role === 'ADMIN') {
      const result = new ReturnResult<boolean>();
      result.message = `You cannot allow to import file`;
      return result;
    }

    await this.userService.saveFile(file, user.id);

    return this.importUserQueueService.addFileToQueue({
      file: file,
      owner: user.id,
      columnMapping: mappingColumn,
    });
  }

  @Post('/activate/:id')
  @UseGuards(PermissionGuard(UserPerm.ActivateUser.permission))
  async activateAccount(@Req() request: RequestWithUser, @Param() { id }) {
    const user = request.user;
    const result = new ReturnResult<boolean>();

    try {
      const userExist = await this.userService.getUserById(id);
      if (!userExist) throw new Error(`User with id: ${id} is not exists`);

      const group = await this.groupService.getSocialGroupByManagerId(user.id);
      if (group.managerId === userExist.id)
        throw new Error(`Can not activate yourself from group`);

      const userInGroup = await this.userInGroupService.getUserWithGroup(
        id,
        group.id,
      );
      if (!userInGroup)
        throw new Error(`User with id: ${id} not in group ${group.name}`);

      await this.userInGroupService.activateAccount(userExist.id, group.id);

      result.result = true;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('/deactivate/:id')
  @UseGuards(PermissionGuard(UserPerm.ActivateUser.permission))
  async deactivateAccount(@Req() request: RequestWithUser, @Param() { id }) {
    const user = request.user;
    const result = new ReturnResult<boolean>();

    try {
      const userExist = await this.userService.getUserById(id);
      if (!userExist) throw new Error(`User with id: ${id} is not exists`);

      const group = await this.groupService.getSocialGroupByManagerId(user.id);
      if (group.managerId === userExist.id)
        throw new Error(`Can not deactivate yourself from group`);

      const userInGroup = await this.userInGroupService.getUserWithGroup(
        id,
        group.id,
      );
      if (!userInGroup)
        throw new Error(`User with id: ${id} not in group ${group.name}`);

      await this.userInGroupService.deactivateAccount(userExist.id, group.id);

      result.result = true;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('/assign')
  @UseGuards(PermissionGuard(UserPerm.AssignUsers.permission))
  async assignUser(
    @Req() request: RequestWithUser,
    @Body() data: AssignUserDTO,
  ) {
    const user = request.user;
    const result = new ReturnResult<boolean>();
    try {
      const group = await this.groupService.getSocialGroupByManagerId(user.id);
      if (!group) throw new Error(`You don't have permission to assign users`);

      await this.userInTabService.assignUsers(data);
      result.result = true;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('/unassign')
  @UseGuards(PermissionGuard(UserPerm.AssignUsers.permission))
  async unassignUser(
    @Req() request: RequestWithUser,
    @Body() data: AssignUserDTO,
  ) {
    const user = request.user;
    const result = new ReturnResult<boolean>();
    try {
      const group = await this.groupService.getSocialGroupByManagerId(user.id);
      if (!group) throw new Error(`You don't have permission to assign users`);

      await this.userInTabService.unassignUsers(data);
      result.result = true;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('/role/update')
  @UseGuards(PermissionGuard(UserPerm.UpdateUser.permission))
  async updateRoleUser(
    @Req() request: RequestWithUser,
    @Body() data: UpdateRoleUserDTO,
  ) {
    const user = request.user;
    const result = new ReturnResult<boolean>();
    try {
      const group = await this.groupService.getSocialGroupByManagerId(user.id);
      if (!group) throw new Error(`You don't have permission to assign user`);

      if (user.id === data.userId) throw new Error(`You cannot edit your role`);

      await this.userInTabService.updateRoleUser(data);
      result.result = true;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('/export')
  @UseGuards(PermissionGuard(UserPerm.ExportUser.permission))
  async exportUser(@Req() request: RequestWithUser) {
    const user = request.user;
    let dataExport = null;
    const mimetype =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const result = new ReturnResult<FileContentResult>();

    try {
      if (user.role === 'ADMIN') {
        dataExport = await this.userService.exportAllUser();
      } else {
        const _ = await this.groupService.getSocialGroupByManagerId(user.id);
        dataExport = await this.userService.exportUserInGroup(_.id);
      }

      const fileBuffer = exportExcelFile(dataExport, 'USER');
      result.result = new FileContentResult(fileBuffer, mimetype);
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Get('/:userId')
  @UseGuards(JWTAuthGuard)
  async getUserNameById(@Param() { userId }) {
    const result = new ReturnResult<string>();
    try {
      const userInfo = await this.userService.getUserById(userId);
      result.result = userInfo.userName;
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }

    return result;
  }

  @Post('/tab/:tabId')
  @UseGuards(JWTAuthGuard)
  async getAllUserWithTab(
    @Req() request: RequestWithUser,
    @Body() page: UserPage,
    @Param() { tabId },
  ) {
    const user = request.user;
    const result = new ReturnResult<PagedData<object>>();
    const pagedData = new PagedData<object>(page);

    try {
      if (user.role !== 'OWNER')
        throw new Error(`You are not allowed to access this page`);

      const tab = await this.tabService.getSocialTabById(tabId);
      const group = await this.groupService.getSocialGroupByManagerId(user.id);
      if (tab.groupId !== group.id) {
        throw new Error(`You are not allowed to access this page`);
      }

      const data = this.advancedFilteringService.createFilter(page);
      data.filter.AND.push({
        socialTab: {
          id: tabId,
        },
      });
      data.filter.AND.push({ delete: { equals: false } });

      const listResult = await this.userService.findUserWithTab(data);

      pagedData.data = listResult;
      pagedData.page.totalElement = await this.userService.countUserWithTab(
        data,
      );
      result.result = pagedData;
    } catch (error) {
      if (error.message === `You are not allowed to access this page`)
        result.message = error.message;
      else result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  @Post('get-all-user')
  @UseGuards(JWTAuthGuard)
  async getAllUser() {
    const result = new ReturnResult<object[]>();
    try{
      const users = await this.userInGroupService.getAllUser();
      result.result = users;
    }
    catch (error){
      result.message = error.message
    }
    return result;
  }
}
