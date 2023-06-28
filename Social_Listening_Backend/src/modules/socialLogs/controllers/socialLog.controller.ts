import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { SocialLogService } from '../services/socialLog.service';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { PagedData } from 'src/common/models/paging/pagedData.dto';
import { AdvancedFilteringService } from 'src/config/database/advancedFiltering.service';
import { SortOrderType } from 'src/common/enum/sortOrderType.enum';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { SocialTabService } from 'src/modules/socialGroups/services/socialTab.service';
import { SocialLogPage } from '../dtos/socialLog.page';

@Controller('socialLog')
export class SocialLogController {
  constructor(
    private readonly socialLogService: SocialLogService,
    private readonly advancedFilteringService: AdvancedFilteringService,

    @Inject(forwardRef(() => SocialTabService))
    private readonly socialTabService: SocialTabService,
  ) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  async getSocialLog(
    @Req() request: RequestWithUser,
    @Body() page: SocialLogPage,
  ) {
    const userId = request.user.id;
    const result = new ReturnResult<PagedData<object>>();
    const pagedData = new PagedData<object>(page);

    try {
      page.filter = [];
      page.orders = [];
      if (!page.offset) page.offset = 0;

      const data = this.advancedFilteringService.createFilter(page);
      const allTabs = await this.socialTabService.getAllSocialTab(userId);
      const listTab = allTabs.map((tab) => tab.id);

      data.filter.AND.push({ tabId: { in: listTab } });
      data.orders.push({ createAt: SortOrderType.DESC });

      const listLogs = await this.socialLogService.getSocialLogByTabId(data);

      pagedData.page.totalElement = await this.socialLogService.countLog(data);

      pagedData.data = listLogs;
      result.result = pagedData;
    } catch (error) {
      console.log(error);
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }
}
