import { SocialNetwork, SocialTab } from '@prisma/client';

export const excludeSocialTab: (keyof SocialTab)[] = ['delete'];
export const excludeSocialNetwork: (keyof SocialNetwork)[] = ['delete'];
