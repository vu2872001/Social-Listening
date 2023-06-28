export const SocialNetworkPerm = {
  connectSocialNetwork: {
    displayName: 'Connect Social Network',
    permission: 'connect-social-network',
    screen: 'Social Group',
  },
  updateSocialNetwork: {
    displayName: 'Update Social Network',
    permission: 'update-social-network',
    screen: 'Social Group',
  },
  disconnectSocialNetwork: {
    displayName: 'Disconnect Social Network',
    permission: 'disconnect-social-network',
    screen: 'Social Group',
  },
} as const;

export type SocialNetworkPerm = keyof typeof SocialNetworkPerm;
