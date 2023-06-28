import { Select } from 'antd';
import LoadingWrapper from '../LoadingWrapper';

export default function ClassicSelect(props) {
  const {
    options = [],
    onChange,
    loading = false,
    filterLabel = false,
    multiple = false,
    placeHolder = `Select ...`,
    disabled = false,
    noneOption = false,
    allOption = false,
    removeAllOption = false,
    ...other
  } = props;

  let data = [...options];
  if (data?.length > 0) {
    const none = [{ label: 'None', value: '' }];
    if (noneOption) {
      data = none.concat(data);
    }

    const all = [{ label: 'All', value: 'all' }];
    if (allOption) {
      data = all.concat(data);
    }

    const removeAll = [{ label: 'Remove All', value: 'removeAll' }];
    if (removeAllOption) {
      data = removeAll.concat(data);
    }
  }

  return (
    <LoadingWrapper loading={loading}>
      <Select
        showArrow
        allowClear
        disabled={disabled}
        style={{ width: '100%' }}
        placeholder={placeHolder}
        onChange={onChange}
        options={data}
        {...(multiple && {
          mode: 'multiple',
          maxTagCount: 'responsive',
        })}
        {...(filterLabel && {
          filterOption: (input, option) =>
            (option?.label?.toLowerCase() ?? '').includes(
              input?.toLowerCase()
            ),
        })}
        {...other}
      />
    </LoadingWrapper>
  );
}
