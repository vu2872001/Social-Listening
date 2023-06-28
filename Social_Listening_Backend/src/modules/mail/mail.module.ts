import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { SettingService } from '../setting/service/setting.service';
import { Module } from '@nestjs/common';
import { MailService } from './service/mail.service';
import { SettingModule } from '../setting/setting.module';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [SettingModule],
      useFactory: async (settingService: SettingService) => {
        const sendGridApiKey = (
          await settingService.getSettingByKeyAndGroup(
            'SENDGRID_API_KEY',
            'EMAIL',
          )
        )?.value;
        return {
          transport: {
            host: 'smtp.sendgrid.net',
            auth: {
              user: 'apikey',
              pass: sendGridApiKey,
            },
          },
          defaults: {
            from: 'service.social.listening@gmail.com',
          },
          template: {
            dir: __dirname + '/templates',
            adapter: new PugAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [SettingService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
