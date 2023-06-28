export class FileContentResult {
  fileContents: any;
  contentType: string;

  constructor(fileContents: any, contentType: string) {
    this.fileContents = fileContents;
    this.contentType = contentType;
  }
}
