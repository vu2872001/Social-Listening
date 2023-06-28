export class CreateSocialMessageDTO {
  networkId: string;
  message: string;
  sender: SocialSenderDTO;
  createdAt: Date;
  type: string;
  parent: SocialPostDTO;
  sentiment?: number;
}

export class SocialMessageDTO {
  type: string;
  tabId: string;
  senderId: string;
  message: string;
  createdAt: Date;
  parentId: string;
  messageId: string;
  sentiment?: number;
}

export class SocialPostDTO {
  postId: string;
  message: string;
  permalinkUrl: string;
  createdAt: Date;
  tabId: string;
}

export class SocialMessageInfoDTO extends CreateSocialMessageDTO {
  postId: string;
  commentId: string;
  parentId: string;
}

export class SentimentMessageDTO {
  exactSentiment: number;
  sentiment: number[];
  tabId: string;
  messageId: string;
}

export class SocialSenderDTO {
  id: string;
  name: string;
  avatar: string;
}
