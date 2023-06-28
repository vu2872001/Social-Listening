import { FilterMapping } from './filterMapping.dto';
import { OrderMapping } from './orderMapping.dto';

export class Page {
  size: number;
  pageNumber: number;
  totalElement: number;
  orders: OrderMapping[];
  filter: FilterMapping[];
}
