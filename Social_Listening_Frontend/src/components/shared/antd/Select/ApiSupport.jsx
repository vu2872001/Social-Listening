import { useState } from 'react';
import { Select } from 'antd';
import { apiService } from '../../../../services/apiService';
import { notifyService } from '../../../../services/notifyService';
import { Checker } from '../../../../utils/dataChecker';
import { Converter } from '../../../../utils/dataConverter';
import useEffectOnce from '../../../../components/hooks/useEffectOnce';
import useToggle from '../../../../components/hooks/useToggle';
import LoadingWrapper from '../LoadingWrapper';

export default function ApiSupportSelect(props) {
  const {
    apiUrl,
    handleSelect,
    dataKey = 'result',
    filterLabel = false,
    multiple = false,
    placeHolder = `Select ...`,
    disabled = false,
    ...other
  } = props;

  const [options, setOptions] = useState([]); //data to select
  const [loading, toggleLoading] = useToggle(false); //control loading state

  async function handleAPI(apiUrl) {
    toggleLoading(true); //start loading

    try {
      await apiService.get(apiUrl).then((value) => {
        if (!Checker.isEmptyObject(value?.data, true)) {
          let propValue = value.data[dataKey];
          if (!Checker.isEmptyObjectList(propValue, true)) {
            setOptions(
              Converter.convertListToLabelValueFormat(propValue)
            );
          }
        }
      });
    } catch (ex) {
      notifyService.showErrorMessage({
        description: ex.message,
      });
    }

    toggleLoading(false); //finish loading
  }

  useEffectOnce(() => {
    if (apiUrl) {
      handleAPI(apiUrl);
    }
  });

  return (
    <LoadingWrapper loading={loading}>
      <Select
        // labelInValue
        showSearch
        disabled={disabled}
        style={{ width: '100%' }}
        placeholder={placeHolder}
        onChange={handleSelect}
        {...(apiUrl && { options: options })}
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
