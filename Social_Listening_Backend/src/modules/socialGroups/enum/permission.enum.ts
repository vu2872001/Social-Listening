export const SocialTabPerm = {
  updateWorkingStateTab: {
    displayName: 'Update Working State Tab',
    permission: 'update-working-state-tab',
    screen: 'Social Tab',
  },
} as const;

export type SocialTabPerm = keyof typeof SocialTabPerm;
