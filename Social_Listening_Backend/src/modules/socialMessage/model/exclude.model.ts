import { SocialMessage, SocialPost } from '@prisma/client';

export const excludeSocialMessage: (keyof SocialMessage)[] = [
  'parentId',
  'senderId',
];

export const excludeSocialPost: (keyof SocialPost)[] = ['tabId'];
