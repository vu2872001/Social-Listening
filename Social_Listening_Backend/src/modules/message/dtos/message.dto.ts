import { SocialSenderDTO } from 'src/modules/socialMessage/dtos/socialMessage.dto';

export class MessageDTO {
  message: string;
  sender: SocialSenderDTO;
  recipient: SocialSenderDTO;
  messageId: string;
  networkId: string;
  repliedMessageId?: string;
  createdAt: Date;
}

export class CreateMessageDTO {
  message: string;
  senderId: string;
  recipientId: string;
  messageId: string;
  tabId: string;
  repliedMessageId?: string;
  createdAt: Date;
}

export class MessageInConversationDTO {
  message: string;
  sender: MessageSenderDTO;
  createdAt: Date;
}

export class MessageSenderDTO {
  id: string;
  fullName: string;
  avatarUrl: string;
  senderId: string;
}
