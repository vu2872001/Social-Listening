import { IsNumber, IsOptional } from 'class-validator';
import { Page } from 'src/common/models/paging/page.dto';

export class NotificationPage extends Page {
  @IsNumber()
  @IsOptional()
  offset?: number;
}
