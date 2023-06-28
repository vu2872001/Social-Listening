import { Page } from './page.dto';

export class PagedData<T> {
  constructor(page: Page) {
    this.page = page;
  }

  public data: T[];
  public page: Page;
}
