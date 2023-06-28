import { useState, useRef } from 'react';
import {
  FilterOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from '@ant-design/icons';
import { FilterType } from '../../../../../constants/table/filter';
import { Checker } from '../../../../../utils/dataChecker';
import useUpdateEffect from '../../../../hooks/useUpdateEffect';
import ClassicDropdown from '../../Dropdown/Classic';
import ClassicSelect from '../../Select/Classic';
import BooleanSelect from '../../Select/Boolean';
import FloatInput from '../../../element/FloatingInput/FloatInput';
import ToolTipWrapper from '../../ToolTipWrapper';
import DateTimePicker from '../../DateTimePicker/DateTimePicker';
import DateRangePicker from '../../DateTimePicker/DateRangePicker';

export default function TableHeader(props) {
  const {
    title = '',
    propsName = '',
    filter,
    sort = true,
    disableFilter = false,
    updateSorter,
    updateFilter,
    refreshFilterSorter,
    defaultFilter = null,
  } = props;

  let [value, setValue] = useState(
    defaultFilter?.filter((item) => item.props === propsName)?.length
      ? defaultFilter
      : null
  );
  let [dateRangeFilter, setDateRangeFilter] = useState(false);
  let listFilter =
    FilterType[filter?.filterType] ?? FilterType.Default;

  const [selectedKey, setSelectedKey] = useState('0');
  let filterOperator = useRef(null);
  filterOperator.current = listFilter[parseInt(selectedKey)];

  let inputHeader = (
    <FloatInput
      id={title}
      className="table-input-title"
      label={title}
      value={value}
      onChange={(e) => {
        setValue(e.currentTarget.value);
      }}
      onBlur={formatFilter}
      onPressEnter={(e) => e.currentTarget.blur()}
      type={filter?.filterType === 'Number' ? 'number' : 'text'}
    />
  );

  if (filter && filter.filterType) {
    // input UI
    if (filter.filterType === 'Boolean') {
      inputHeader = (
        <BooleanSelect
          multiple
          id={title}
          placeHolder={title}
          value={value || undefined}
          onChange={handleSelect}
        />
      );
    } else if (filter.filterType === 'Dropdown') {
      inputHeader = (
        <ClassicSelect
          multiple
          id={title}
          placeHolder={title}
          value={value || undefined}
          options={filter.options}
          onChange={handleSelect}
        />
      );
    } else if (filter.filterType === 'DateTime') {
      inputHeader = !dateRangeFilter ? (
        <DateTimePicker
          placeholder={title}
          value={value}
          id={title}
          onChange={handleSelect}
        />
      ) : (
        <DateRangePicker
          placeholder={[`${title} Start`, `${title} End`]}
          value={value}
          id={title}
          onChange={handleSelect}
        />
      );
    }
  }

  function handleSelect(e) {
    setValue(e);
  }

  useUpdateEffect(() => {
    if (filter && filter.filterType) {
      formatFilter();
    }
  }, [value]);

  // #region handle sorter
  const [active, setActive] = useState(null);

  function handleSorter() {
    if (active === null) {
      setActive('sort-ascending');
      formatSorter('asc');
    } else if (active === 'sort-ascending') {
      setActive('sort-descending');
      formatSorter('desc');
    } else if (active === 'sort-descending') {
      setActive(null);
      formatSorter(null);
    }
  }

  function formatSorter(type) {
    if (type) {
      updateSorter((old) => {
        let index = old.findIndex((x) => x?.props === propsName);
        if (index >= 0) {
          old[index].sortDir = type;
          return [...old];
        } else {
          return [...old, { props: propsName, sortDir: type }];
        }
      });
    } else {
      updateSorter((old) => {
        let removeOldSorter = old.filter(
          (x) => x?.props !== propsName
        );
        return removeOldSorter;
      });
    }
  }
  // #endregion

  // #region handle fitler
  function handleFilter(e) {
    const oldFilter = filterOperator.current;

    if (filterOperator.current !== listFilter[e.key]) {
      filterOperator.current = listFilter[e.key];

      setSelectedKey(
        listFilter
          .findIndex((x) => x === filterOperator.current)
          ?.toString()
      );

      if (filter && filter?.filterType === 'DateTime') {
        let notFilter = false;
        if (listFilter[e.key] === 'Between') {
          notFilter = true;
          setDateRangeFilter(true);
        } else {
          if (oldFilter !== 'Between') {
            notFilter = false;
          } else {
            notFilter = true;
            setDateRangeFilter(false);
          }
        }

        if (notFilter) {
          setValue(null);
          return;
        }
      }

      formatFilter(listFilter[e.key]);
    }
  }

  function formatFilter(currentFilter) {
    if (
      !Checker.isNullOrEmpty(value) ||
      currentFilter === 'Is Empty' ||
      currentFilter === 'Is Not Empty'
    ) {
      updateFilter((old) => {
        let index = old.findIndex((x) => x?.props === propsName);
        if (index >= 0) {
          old[index].value = value;
          old[index].filterOperator = filterOperator.current;
          return [...old];
        } else {
          return [
            ...old,
            {
              props: propsName,
              value: value,
              filterOperator: filterOperator.current,
              filterType: filter?.filterType ?? 'Default',
            },
          ];
        }
      });
    } else {
      updateFilter((old) => {
        const availableFilter = old.find(
          (x) => x?.props === propsName
        );

        if (
          availableFilter?.props ||
          availableFilter?.filterOperator === 'Is Empty' ||
          availableFilter?.filterOperator === 'Is Not Empty'
        ) {
          let removeOldFilter = old.filter(
            (x) => x?.props !== propsName
          );
          return removeOldFilter;
        } else return old;
      });
    }
  }
  // #endregion

  // #region handle refresh header
  useUpdateEffect(() => {
    if (refreshFilterSorter) {
      if (selectedKey !== '0') {
        setSelectedKey('0');
      }
      if (active !== null) {
        setActive(null);
      }

      if (value != null) {
        setValue(null);
      }
    }
  }, [refreshFilterSorter]);
  // #endregion

  return (
    <div className="table-header flex-center">
      {disableFilter ? (
        title
      ) : (
        <>
          <ToolTipWrapper tooltip="Click to open filters">
            <div className="flex-center">
              <ClassicDropdown
                list={listFilter}
                clickTrigger
                handleItemClick={handleFilter}
                selectedKeys={[selectedKey]}
              >
                <FilterOutlined className="table-filter-icon" />
              </ClassicDropdown>
            </div>
          </ToolTipWrapper>
          {inputHeader}
        </>
      )}
      {sort && (
        <ToolTipWrapper tooltip="Click to sort">
          <div
            className={
              'flex-center table-sorter pointer ' +
              (!active && 'no-action')
            }
            onClick={handleSorter}
          >
            {(active === 'sort-ascending' || !active) && (
              <CaretUpOutlined id="sort-ascending" />
            )}
            {(active === 'sort-descending' || !active) && (
              <CaretDownOutlined id="sort-descending" />
            )}
          </div>
        </ToolTipWrapper>
      )}
    </div>
  );
}
