export class HotQueueDTO {
  type: string;
  tabId: string;
  userId?: string;
  senderId: string;
  messageType: string;
  reason: string;
}

export class FindSenderHotQueueDTO {
  tabId: string;
  senderId: string;
  messageType: string;
}
