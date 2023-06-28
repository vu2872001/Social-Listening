import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailWorker } from './workers/email.worker';
import { EmailQueueService } from './services/email.queue.service';
import { MailModule } from '../mail/mail.module';
import { ImportUserQueueService } from './services/importUser.queue.service';
import { ImportUserWorker } from './workers/importUser.worker';
import { UserModule } from '../users/user.module';
import { NotificationModule } from '../notifications/notification.module';
import { NotificationWorker } from './workers/notification.worker';
import { NotificationQueueService } from './services/notification.queue.service';
import { SocketModule } from '../sockets/socket.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue(
      {
        name: 'email',
      },
      {
        name: 'importUser',
      },
      {
        name: 'notification',
      },
    ),
    MailModule,
    forwardRef(() => UserModule),
    forwardRef(() => SocketModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [
    EmailQueueService,
    EmailWorker,
    ImportUserQueueService,
    ImportUserWorker,
    NotificationQueueService,
    NotificationWorker,
  ],
  exports: [
    EmailQueueService,
    ImportUserQueueService,
    NotificationQueueService,
  ],
})
export class QueueModule {}
