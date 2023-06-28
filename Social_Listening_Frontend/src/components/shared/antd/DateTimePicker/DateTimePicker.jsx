import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import {
  dateBefore,
  dateAfter,
} from '../../../../constants/datetime/date';

export default function DateTimePicker(props) {
  const {
    format = 'YYYY-MM-DD',
    defaultValue,
    onChange,
    disabled = false,
    disabledPast = false,
    disabledFuture = false,
    ...other
  } = props;

  return (
    <DatePicker
      format={format}
      presets={dateBefore.concat(dateAfter)}
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
