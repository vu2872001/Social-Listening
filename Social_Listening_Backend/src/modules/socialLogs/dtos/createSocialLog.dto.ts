export class CreateSocialLogDTO {
  tabId: string;
  title: string;
  body: string;
  activity: string;
  extendData?: string;

  constructor(
    tabId: string,
    title: string,
    body: string,
    activity: string,
    extendData: string = null,
  ) {
    this.tabId = tabId;
    this.title = title;
    this.body = body;
    this.activity = activity;
    this.extendData = extendData;
  }
}
