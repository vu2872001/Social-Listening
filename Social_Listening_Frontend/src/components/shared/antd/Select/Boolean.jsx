import { Select } from 'antd';

export default function BooleanSelect(props) {
  const {
    handleSelect,
    multiple = false,
    placeHolder = `Select ...`,
    disabled = false,
    noneOption = false,
    ...other
  } = props;

  const boolOption = [
    { label: 'True', value: true },
    { label: 'False', value: false },
  ];
  let data = [...boolOption];
  const none = [{ label: 'None', value: '' }];
  if (noneOption) {
    data = none.concat(data);
  }

  return (
    <Select
      showArrow
      allowClear
      disabled={disabled}
      style={{ width: '100%' }}
      placeholder={placeHolder}
      onChange={handleSelect}
      options={data}
      {...(multiple && {
        mode: 'multiple',
        maxTagCount: 'responsive',
      })}
      {...other}
    />
  );
}
