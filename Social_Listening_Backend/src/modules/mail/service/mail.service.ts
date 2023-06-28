import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transport: nodemailer.Transporter;

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: any,
    retryCount = 0,
  ) {
    try {
      const mailOption = {
        to: to,
        subject: subject,
        template: template,
        context: context,
      };

      const info = await this.mailerService.sendMail(mailOption);
      this.logger.log(`Email sent to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending email to ${to}: ${error.message}`);
      if (retryCount < 3)
        await this.sendEmail(to, subject, template, context, retryCount + 1);
      return false;
    }
  }
}
