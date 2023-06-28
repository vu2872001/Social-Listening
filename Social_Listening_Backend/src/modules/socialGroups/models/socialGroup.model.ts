export class SocialGroup {
  id: string;
  name: string;
  extendData?: string;
}

export class SocialTab {
  id: string;
  name: string;
  groupId: string;
  delete: boolean;
  isWorked: boolean;
  extendData?: string;
}
