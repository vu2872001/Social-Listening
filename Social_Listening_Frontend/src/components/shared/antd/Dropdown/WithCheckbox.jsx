import { Dropdown, Checkbox } from 'antd';
import { Checker } from '../../../../utils/dataChecker';
import './dropdown.scss';

export default function WithCheckbox(props) {
  const {
    list,
    selectedKeys = [],
    clickTrigger = false,
    handleItemClick,
  } = props;

  let items =
    list?.map((item, index) => {
      return {
        label: (
          <div
            className="cb-dropdown-wrapper"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Checkbox
              className="cb-dropdown"
              checked={selectedKeys.includes(index.toString())}
              onClick={() => {
                handleMenuClick(index.toString());
              }}
            >
              {item}
            </Checkbox>
          </div>
        ),
        key: index,
      };
    }) ?? [];

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
      overlayClassName="cb-dropdown-overlay"
      {...(clickTrigger && { trigger: ['click'] })}
    >
      {props.children}
    </Dropdown>
  );
}
