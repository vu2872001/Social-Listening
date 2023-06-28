import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  async addEmailToQueue(data: any) {
    await this.emailQueue.add('sendEmail', data);
  }
}
