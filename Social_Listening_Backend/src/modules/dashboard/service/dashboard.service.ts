import { Injectable } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocialTabService } from 'src/modules/socialGroups/services/socialTab.service';
import { SocialSenderService } from 'src/modules/socialSender/services/socialSender.service';
import { DashboardStatisticPercentDTO } from '../dto/dashBoardStatistic.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly socialTabService: SocialTabService,
    private readonly socialSenderService: SocialSenderService,
  ) {}

  async getLineChart(tabId: string, dateStart: Date, dateEnd: Date) {
    try {
      const tabWithInfo = await this.socialTabService.getSocialTabInfo(tabId);
      const networkInfo = JSON.parse(tabWithInfo.SocialNetwork.extendData);

      const sender = await this.socialSenderService.findSender(networkInfo.id);
      const startDate = new Date(
        dateStart.getFullYear(),
        dateStart.getMonth(),
        dateStart.getDate(),
      );
      let endDate = new Date(
        dateEnd.getFullYear(),
        dateEnd.getMonth(),
        dateEnd.getDate(),
      );
      // Get Data with hour
      if (startDate.toISOString() === endDate.toISOString()) {
        let listComment = [];
        let listMessage = [];
        endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
        listComment = await this.countCommentPerHour(
          tabId,
          startDate,
          endDate,
        );
        if (sender){
          listMessage = await this.countMessagePerHour(
            tabId,
            sender.id,
            startDate,
            endDate,
          );
        }
        const result = this.mergeData(listComment, listMessage, 1);
        return result;
      }
      // Get Data with date
      else {
        let listComment = [];
        let listMessage = [];
        endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
        listComment = await this.countCommentPerDay(
          tabId,
          startDate,
          endDate,
        );
        if (sender){
          listMessage = await this.countMessagePerDay(
            tabId,
            sender.id,
            startDate,
            endDate,
          );
        }
        const result = this.mergeData(listComment, listMessage);
        return result;
      }
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async getPieChart(tabId: string, dateStart: Date, dateEnd: Date) {
    try {
      const tabWithInfo = await this.socialTabService.getSocialTabInfo(tabId);
      const networkInfo = JSON.parse(tabWithInfo.SocialNetwork.extendData);

      const sender = await this.socialSenderService.findSender(networkInfo.id);
      const startDate = new Date(
        dateStart.getFullYear(),
        dateStart.getMonth(),
        dateStart.getDate(),
      );
      let endDate = new Date(
        dateEnd.getFullYear(),
        dateEnd.getMonth(),
        dateEnd.getDate(),
      );

      endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
      const result: DashboardStatisticPercentDTO =
        new DashboardStatisticPercentDTO();
      result.totalComment = await this.countComment(tabId, startDate, endDate);
      result.totalMessage = (sender) ? await this.countMessage(
        sender.id,
        tabId,
        startDate,
        endDate,
      ) : 0;
      result.hotQueueComment = (sender) ? await this.countHotQueue(
        sender.id,
        tabId,
        'Comment',
        startDate,
        endDate,
      ) : 0;
      result.hotQueueMessage = (sender) ?  await this.countHotQueue(
        sender.id,
        tabId,
        'Message',
        startDate,
        endDate,
      ) : 0;
      return result;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  private async countComment(tabId: string, startDate: Date, endDate: Date) {
    try {
      const countComment = await this.prismaService.socialMessage.count({
        where: {
          AND: [
            { type: { not: { equals: 'Bot' } } },
            { type: { not: { startsWith: 'Agent' } } },
          ],
          tabId: tabId,
          createdAt: { gte: startDate, lt: endDate },
        },
      });

      return countComment;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  private async countMessage(
    senderId: string,
    tabId: string,
    startDate: Date,
    endDate: Date,
  ) {
    try {
      const countComment = await this.prismaService.message.count({
        where: {
          tabId: tabId,
          senderId: { not: { equals: senderId } },
          createdAt: { gte: startDate, lt: endDate },
        },
      });

      return countComment;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  private async countHotQueue(
    senderId: string,
    tabId: string,
    messageType: string,
    startDate: Date,
    endDate: Date,
  ) {
    try {
      const countData = await this.prismaService.hotQueueMessage.count({
        where: {
          tabId: tabId,
          messageType: messageType,
          senderId: { not: { equals: senderId } },
          dateCreated: { gte: startDate, lt: endDate },
        },
      });

      return countData;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  private async countCommentPerDay(
    tabId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const comments = await this.prismaService.socialMessage.findMany({
      where: {
        AND: [
          { type: { not: { equals: 'Bot' } } },
          { type: { not: { startsWith: 'Agent' } } },
        ],
        tabId: tabId,
        createdAt: { gte: startDate, lt: endDate },
      },
      select: {
        createdAt: true,
      },
    });

    const commentsByDay = comments.reduce((arr, comment) => {
      const date = comment.createdAt.toISOString().split('T')[0];

      if (!arr[date]) arr[date] = 0;
      arr[date]++;

      return arr;
    }, {});

    return Object.entries(commentsByDay).map(([date, count]) => ({
      date,
      count,
    }));
  }

  private async countMessagePerDay(
    tabId: string,
    senderId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const messages = await this.prismaService.message.findMany({
      where: {
        tabId: tabId,
        senderId: { not: { equals: senderId } },
        createdAt: { gte: startDate, lt: endDate },
      },
      select: {
        createdAt: true,
      },
    });

    const messagesByDay = messages.reduce((arr, message) => {
      const date = message.createdAt.toISOString().split('T')[0];

      if (!arr[date]) arr[date] = 0;
      arr[date]++;

      return arr;
    }, {});

    return Object.entries(messagesByDay).map(([date, count]) => ({
      date,
      count,
    }));
  }

  private async countCommentPerHour(
    tabId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const comments = await this.prismaService.socialMessage.findMany({
      where: {
        AND: [
          { type: { not: { equals: 'Bot' } } },
          { type: { not: { startsWith: 'Agent' } } },
        ],
        tabId: tabId,
        createdAt: { gte: startDate, lt: endDate },
      },
      select: {
        createdAt: true,
      },
    });

    const commentsByDay = comments.reduce((arr, comment) => {
      const date = comment.createdAt.getHours();

      if (!arr[date]) arr[date] = 0;
      arr[date]++;

      return arr;
    }, {});

    return Object.entries(commentsByDay).map(([hour, count]) => ({
      hour,
      count,
    }));
  }

  private async countMessagePerHour(
    tabId: string,
    senderId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const messages = await this.prismaService.message.findMany({
      where: {
        senderId: { not: { equals: senderId } },
        createdAt: { gte: startDate, lt: endDate },
      },
      select: {
        createdAt: true,
      },
    });

    const messagesByDay = messages.reduce((arr, message) => {
      const date = message.createdAt.getHours();

      if (!arr[date]) arr[date] = 0;
      arr[date]++;

      return arr;
    }, {});

    return Object.entries(messagesByDay).map(([hour, count]) => ({
      hour,
      count,
    }));
  }

  private mergeData(listComment: any[], listMessage: any[], type = 0) {
    const property = type === 0 ? 'date' : 'hour';

    const comments = listComment.map((value) => {
      return { ...value, type: 'Comment' };
    });
    const messages = listMessage.map((value) => {
      return { ...value, type: 'Message' };
    });
    const mergeArray = [...comments, ...messages];

    const resultReturn = mergeArray.reduce((arr, item) => {
      if (!arr[item[property]]) {
        arr[item[property]] = {
          // date: item[property],
          commentCount: 0,
          messageCount: 0,
        };
        arr[item[property]][`${property}`] = item[property];
      }

      if (item.type === 'Comment') {
        arr[item[property]].commentCount += item.count;
      } else if (item.type === 'Message') {
        arr[item[property]].messageCount += item.count;
      }

      return arr;
    }, {});

    return resultReturn;
  }
}
