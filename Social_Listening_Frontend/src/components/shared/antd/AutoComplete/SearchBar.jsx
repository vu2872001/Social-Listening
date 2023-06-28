import {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
} from 'react';
import { AutoComplete, Input } from 'antd';
import { Checker } from '../../../../utils/dataChecker';
import { Converter } from '../../../../utils/dataConverter';
import LoadingWrapper from '../LoadingWrapper';
import EmptyPlaceholder from '../EmptyPlaceholder';
import useToggle from '../../../../components/hooks/useToggle';

const SearchBar = forwardRef((props, ref) => {
  const {
    searchQuantities = 3,
    handleSearch,
    handleSelect,
    ...other
  } = props;

  const [options, setOptions] = useState([]);
  const [loading, toggleLoading] = useToggle(false);
  const checkNotFirst = useRef(false);

  useImperativeHandle(ref, () => ({
    setData(value) {
      if (!Checker.isEmptyObjectList(value, true)) {
        setOptions(Converter.convertListToLabelValueFormat(value));
      }
    },
  }));

  async function formatSearch(value) {
    if (value.length >= searchQuantities) {
      if (!checkNotFirst.current) {
        checkNotFirst.current = true;
      }
      toggleLoading(true); //start loading
      await handleSearch(value); //search function from parents
      toggleLoading(false); //finish loading
    }
  }

  return (
    <LoadingWrapper loading={loading}>
      <AutoComplete
        style={{
          width: '100%',
        }}
        onSearch={formatSearch}
        onSelect={handleSelect}
        options={options}
        {...(checkNotFirst.current &&
          !loading && { notFoundContent: <EmptyPlaceholder /> })}
        {...other}
      >
        <Input.Search
          enterButton
          placeholder={`Input ≥ ${searchQuantities} word(s) to search`}
          onSearch={formatSearch}
        />
      </AutoComplete>
    </LoadingWrapper>
  );
});

export default SearchBar;
