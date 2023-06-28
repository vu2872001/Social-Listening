export class NotificationModel {
  id: number;
  title: string | null;
  body: string | null;
  maxAttempt: number;
  duration: number;
  userId: string;
  type: string;
  status: string;
  isClick: boolean;
  refType: string | null;
  refId: string | null;
  extendData: string | null;
  createdAt: Date;
}
