import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import {
  dateRangeBefore,
  dateRangeAfter,
} from '../../../../constants/datetime/dateRange';

export default function DateRangePicker(props) {
  const {
    format = 'YYYY-MM-DD',
    defaultValue,
    onChange,
    disabled = false,
    disabledPast = false,
    disabledFuture = false,
    ...other
  } = props;

  let showTime = false;
  if (format.includes('HH:mm:ss')) {
    showTime = true;
  }

  let presets = [];
  if (!disabledPast) {
    presets = presets.concat(dateRangeBefore);
  }
  if (!disabledFuture) {
    presets = presets.concat(dateRangeAfter);
  }

  return (
    <DatePicker.RangePicker
      format={format}
      showTime={showTime}
      presets={presets}
      defaultValue={defaultValue}
      onChange={onChange}
      disabled={disabled}
      {...(disabledPast && {
        disabledDate: (current) => {
          return dayjs(current).add(1, 'd') < dayjs();
        },
      })}
      {...(disabledFuture && {
        disabledDate: (current) => {
          return current > dayjs();
        },
      })}
      {...other}
    />
  );
}
