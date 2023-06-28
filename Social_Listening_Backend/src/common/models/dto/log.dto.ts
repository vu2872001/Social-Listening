export class CreateLogDTO {
  activityType: string;
  userName: string;
  objName: string;
  objId: string;
  refName: string;
  refId: string;

  constructor(
    activityType: string,
    userName: string,
    objName: string = null,
    objId: string = null,
    refName: string = null,
    refId: string = null,
  ) {
    this.activityType = activityType;
    this.userName = userName;
    this.objName = objName;
    this.objId = objId;
    this.refName = refName;
    this.refId = refId;
  }
}
