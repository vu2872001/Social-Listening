import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';
import { NotificationPage } from '../dtos/notificationPage.dto';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { AdvancedFilteringService } from 'src/config/database/advancedFiltering.service';
import { PagedData } from 'src/common/models/paging/pagedData.dto';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { SortOrderType } from 'src/common/enum/sortOrderType.enum';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly advancedFilteringService: AdvancedFilteringService,
  ) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  async getNotifications(
    @Req() request: RequestWithUser,
    @Body() page: NotificationPage,
  ) {
    const userId = request.user.id;
    const result = new ReturnResult<PagedData<object>>();
    const pagedData = new PagedData<object>(page);

    try {
      page.filter = [];
      page.orders = [];
      if (!page.offset) page.offset = 0;

      const data = this.advancedFilteringService.createFilter(page);
      data.filter.AND.push({ userId: userId });
      data.orders.push({ createdAt: SortOrderType.DESC });

      const listNotification =
        await this.notificationService.getNotificationByUserId(data);

      pagedData.page.totalElement =
        await this.notificationService.countNotification(userId);

      pagedData.data = listNotification;
      result.result = pagedData;
    } catch (error) {
      console.log(error);
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  @Post('read-all')
  @UseGuards(JWTAuthGuard)
  async readAllNotifications(@Req() request: RequestWithUser) {
    const userId = request.user.id;
    const result = new ReturnResult<boolean>();
    try {
      const checkReadAll = await this.notificationService.readAllNotification(
        userId,
      );
      result.result = checkReadAll;
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
  }
}
