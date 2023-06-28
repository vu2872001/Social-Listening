export class HotQueueMessageDTO {
  tabId: string;
  message: string;
  messageType: string;
  senderId: string;
  recipientId: string;
  messageId?: string;
}

export class HotQueueConversationGrouping {
  senderId: string;
  messageType: string;
  messageId: string;
}
