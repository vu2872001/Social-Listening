export class SocialPost {
  id: string;
  postId: string;
  message: string;
  permalinkUrl: string;
  createdAt: Date;
}

export class SocialMessage {
  id: string;
  message: string;
  createdAt: Date;
  type: string;
  messageId: string;
}
