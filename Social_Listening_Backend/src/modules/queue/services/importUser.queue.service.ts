import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ReturnResult } from 'src/common/models/dto/returnResult';

@Injectable()
export class ImportUserQueueService {
  constructor(
    @InjectQueue('importUser') private readonly importUserQueue: Queue,
  ) {}

  async addFileToQueue(data: any) {
    const result = new ReturnResult<boolean>();
    try {
      await this.importUserQueue.add('importUser', data);
      result.result = true;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
