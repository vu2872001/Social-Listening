export class Token {
  access: string;
  refresh: string;

  constructor(accessToken: string, refreshToken: string) {
    this.access = accessToken;
    this.refresh = refreshToken;
  }
}
