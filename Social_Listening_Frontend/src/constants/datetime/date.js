import dayjs from 'dayjs';

export const dateBefore = [
  {
    label: 'Yesterday',
    value: dayjs().add(-1, 'day'),
  },
  {
    label: 'Last Week',
    value: dayjs().add(-1, 'week'),
  },
  {
    label: 'Last Month',
    value: dayjs().add(-1, 'month'),
  },
  {
    label: 'Last Year',
    value: dayjs().add(-1, 'year'),
  },
];

export const dateAfter = [
  {
    label: 'Tommorow',
    value: dayjs().add(1, 'day'),
  },
  {
    label: 'One Week Later',
    value: dayjs().add(1, 'week'),
  },
  {
    label: 'One Month Later',
    value: dayjs().add(1, 'month'),
  },
  {
    label: 'One Year Later',
    value: dayjs().add(1, 'year'),
  },
];
