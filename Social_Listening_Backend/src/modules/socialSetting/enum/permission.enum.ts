export const SocialSettingPerm = {
  GetAllSocialSetting: {
    displayName: 'Get Social Tab Setting',
    permission: 'get-social-setting',
    screen: 'Social Tab Setting',
  },
  UpdateSocialSetting: {
    displayName: 'Update Social Tab Setting',
    permission: 'update-social-setting',
    screen: 'Social Tab Setting',
  },
} as const;

export type SocialSettingPerm = keyof typeof SocialSettingPerm;
