import { Dropdown } from 'antd';
import { Checker } from '../../../../utils/dataChecker';

export default function ClassicDropdown(props) {
  const {
    list = [],
    selectedKeys = [],
    clickTrigger = false,
    noneOption = false,
    handleItemClick,
    hasIcon,
    ...other
  } = props;

  let listWithIcon = list;
  if (hasIcon) {
    listWithIcon = list?.map((element) => {
      return (
        <>
          {element?.icon}
          <span
            style={{ marginLeft: element?.icon ? '0.6rem' : '0' }}
          >
            {element?.label}
          </span>
        </>
      );
    });
  }

  let items =
    listWithIcon?.map((item, index) => {
      return {
        label: item,
        key: index,
      };
    }) ?? [];

  const none = [{ label: 'None', key: -1 }];

  if (noneOption) {
    items = none.concat(items);
  }

  function handleMenuClick(e) {
    if (!Checker.isNullOrEmpty(handleItemClick)) {
      handleItemClick(e);
    }
  }

  return (
    <Dropdown
      menu={{
        items,
        onClick: handleMenuClick,
        selectedKeys: selectedKeys,
      }}
      {...(clickTrigger && { trigger: ['click'] })}
      {...other}
    >
      {props.children}
    </Dropdown>
  );
}
