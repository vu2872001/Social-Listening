import { UserInTabService } from './../../users/services/userInTab.service';
import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from '../service/dashboard.service';
import { DashBoardStatisticDTO } from '../dto/dashBoardStatistic.dto';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly userInTabService: UserInTabService,
  ) {}

  @Post('statistic/:tabId')
  @UseGuards(JWTAuthGuard)
  async getstatisticForTab(
    @Req() request: RequestWithUser,
    @Param('tabId') tabId: string,
    @Body() data: DashBoardStatisticDTO,
  ) {
    const result = new ReturnResult<object>();
    try {
      const user = request.user;
      const userInTab = await this.userInTabService.checkUserInTab(
        user.id,
        tabId,
      );
      if (!userInTab) {
        throw new Error(`You are not allowed to access this page`);
      }

      const chartResult = await this.dashboardService.getLineChart(
        tabId,
        new Date(data.startDate),
        new Date(data.endDate),
      );
      result.result = chartResult;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('hotqueue-statistic/:tabId')
  @UseGuards(JWTAuthGuard)
  async getPieChartForTab(
    @Req() request: RequestWithUser,
    @Param('tabId') tabId: string,
    @Body() data: DashBoardStatisticDTO,
  ) {
    const result = new ReturnResult<object>();
    try {
      const user = request.user;
      const userInTab = await this.userInTabService.checkUserInTab(
        user.id,
        tabId,
      );
      if (!userInTab) {
        throw new Error(`You are not allowed to access this page`);
      }

      const chartResult = await this.dashboardService.getPieChart(
        tabId,
        new Date(data.startDate),
        new Date(data.endDate),
      );
      result.result = chartResult;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
