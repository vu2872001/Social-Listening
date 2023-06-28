import { FilterMapping } from 'src/common/models/paging/filterMapping.dto';
import { Page } from 'src/common/models/paging/page.dto';

type NestedObject = Record<string, unknown> | object;

export class AdvancedFilteringService {
  createFilter(page: Page) {
    const where = { AND: [] };
    const orderBy = [];

    page.orders.forEach((_sort) => {
      orderBy.push({ [_sort.props]: _sort.sortDir });
    });

    page.filter.forEach((_filter) => {
      const obj = this.buildColumnFilter(_filter);
      where.AND.push(obj);
    });

    return { ...page, filter: where, orders: orderBy };
  }

  private buildColumnFilter(filter: FilterMapping) {
    const props = filter.props;
    const type = filter.filterType;
    const isArray = Array.isArray(filter.value);

    if (isArray && type !== 'DateTime') {
      const orArray = { OR: [] };
      filter.value = filter.value.filter((x) => x !== undefined && x !== null);
      filter.value.forEach((value) => {
        const queryString = {
          ...this.getQuery(filter.filterOperator, type, value),
          // mode: 'insensitive',
        };
        if (typeof value === 'string') queryString['mode'] = 'insensitive';
        const query = this.buildQuery(props, queryString);
        orArray.OR.push(query);
      });
      return filter.value.length > 0 ? orArray : {};
    } else {
      const queryString = {
        ...this.getQuery(filter.filterOperator, type, filter.value),
        // mode: 'insensitive',
      };
      if (typeof filter.value === 'string' && type === 'Default')
        queryString['mode'] = 'insensitive';
      return this.buildQuery(props, queryString);
    }
  }

  private buildQuery(props: string, obj: any) {
    const propsArray = props.split('.');
    const reverseArray = propsArray.reverse();

    let nestedObject: NestedObject = obj;

    for (const prop of reverseArray) {
      nestedObject = { [prop]: nestedObject };
    }

    return nestedObject;
  }

  private getQuery(filterOperator, filterType, filterValue) {
    if (filterType === 'DateTime') {
      const now = new Date(filterValue);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      switch (filterOperator) {
        case 'Is Equal To':
          return { gte: today, lt: tomorrow };
        case 'Is Before Or Equal To':
          return { lt: tomorrow };
        case 'Is Before':
          return { lt: today };
        case 'Is After Or Equal To':
          return { gt: today };
        case 'Is After':
          return { gt: tomorrow };
        case 'Between':
          const start = new Date(filterValue[0]);
          const end = new Date(filterValue[1]);
          const startDate = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate(),
          );
          let endDate = new Date(
            end.getFullYear(),
            end.getMonth(),
            end.getDate(),
          );
          endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
          return { gte: startDate, lt: endDate };
      }
    } else {
      switch (filterOperator) {
        case 'Contains':
          return { contains: filterValue };
        case 'Does Not Contains':
          return { not: { contains: filterValue } };
        case 'Is Empty':
          return null;
        case 'Is Not Empty':
          return { not: null };
        case 'Start With':
          return { startWith: filterValue };
        case 'End With':
          return { endWith: filterValue };
        case 'Is Greater Than Or Equal To':
          return { gte: filterValue };
        case 'Is Greater Than':
          return { gt: filterValue };
        case 'Is Less Than Or Equal To':
          return { lte: filterValue };
        case 'Is Less Than':
          return { lt: filterValue };
        case 'Is Equal To':
          return { equals: filterValue };
        case 'Is Not Equal To':
          return { not: { equals: filterValue } };
      }
    }
  }
}
