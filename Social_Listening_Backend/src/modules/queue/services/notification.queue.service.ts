import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class NotificationQueueService {
  constructor(@InjectQueue('notification') private readonly queue: Queue) {}

  async addNotificationToQueue(data: any, delaySecond = 0) {
    if (delaySecond === 0)
      await this.queue.add('pushNotification', { notification: data });
    else
      await this.queue.add(
        'pushNotification',
        { notification: data },
        { delay: delaySecond * 1000 },
      );
  }
}
