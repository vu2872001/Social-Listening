import dayjs from 'dayjs';

export const dateRangeBefore = [
  {
    label: 'Last 7 Days',
    value: [dayjs().add(-7, 'd'), dayjs()],
  },
  {
    label: 'Last 14 Days',
    value: [dayjs().add(-14, 'd'), dayjs()],
  },
  {
    label: 'Last 30 Days',
    value: [dayjs().add(-30, 'd'), dayjs()],
  },
  {
    label: 'Last 90 Days',
    value: [dayjs().add(-90, 'd'), dayjs()],
  },
];

export const dateRangeAfter = [
  {
    label: '7 Days After',
    value: [dayjs(), dayjs().add(7, 'd')],
  },
  {
    label: '14 Days After',
    value: [dayjs(), dayjs().add(14, 'd')],
  },
  {
    label: '30 Days After',
    value: [dayjs(), dayjs().add(30, 'd')],
  },
  {
    label: '90 Days',
    value: [dayjs(), dayjs().add(90, 'd')],
  },
];
