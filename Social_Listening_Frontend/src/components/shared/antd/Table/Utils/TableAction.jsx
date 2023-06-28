import { Checker } from '../../../../../utils/dataChecker';
import ClassicDropdown from '../../Dropdown/Classic';
import IconMoreButton from '../../../element/Button/IconMoreButton';

export default function TableAction(props) {
  const {
    selectAction,
    actionList,
    selectedRecord,
    openAddEdit,
    onClickDelete,
    handleActionClick,
  } = props;

  async function handleAction(e) {
    selectAction(actionList[e.key]?.label);

    if (actionList[e.key]?.label === 'Edit') {
      openAddEdit();
    } else if (actionList[e.key]?.label === 'Delete') {
      await onClickDelete(selectedRecord);
    } else {
      if (!Checker.isNullOrEmpty(handleActionClick)) {
        let reset = false;
        reset = await handleActionClick(
          actionList[e.key]?.label,
          selectedRecord
        );
        if (reset) {
          document.getElementById('refresh-table').click();
        }
      }
    }
  }

  return (
    <div className="flex-center">
      <ClassicDropdown
        clickTrigger
        list={actionList}
        handleItemClick={handleAction}
        hasIcon
      >
        <IconMoreButton className="table-action-icon" />
      </ClassicDropdown>
    </div>
  );
}
