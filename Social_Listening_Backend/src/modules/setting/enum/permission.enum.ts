export const SettingPerm = {
  GetAllSetting: {
    displayName: 'Get All Setting',
    permission: 'table-setting',
    screen: 'Setting',
  },
  UpdateSetting: {
    displayName: 'Update Setting',
    permission: 'update-setting',
    screen: 'Setting',
  },
} as const;

export type SettingPerm = keyof typeof SettingPerm;
