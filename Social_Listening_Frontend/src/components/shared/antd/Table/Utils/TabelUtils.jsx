import { useState } from 'react';
import { ReloadOutlined, TableOutlined } from '@ant-design/icons';
import useUpdateEffect from '../../../../hooks/useUpdateEffect';
import WithCheckbox from '../../Dropdown/WithCheckbox';
import IconButton from '../../../element/Button/IconButton';

export default function TabelUtils(props) {
  const {
    originColumn,
    columnList,
    updateColumn,
    refreshTable,
  } = props;

  // #region display columns section
  // selected value in dropdown
  const [selectedKeys, setSelectedKeys] = useState(
    columnList.map((_, index) => index.toString())
  );

  useUpdateEffect(() => {
    if (selectedKeys?.length !== columnList?.length) {
      setSelectedKeys(columnList.map((_, index) => index.toString()));
    }
  }, [columnList]);

  // the original column cant't be changed
  const originCol = [
    ...originColumn.map((col, index) => {
      col['key'] = index.toString();
      return col;
    }),
  ];
  // the column that will display to UI (this can be change)
  const originFormatCol =
    originCol?.map((x) => x?.title) ??
    columnList?.map((x) => x?.title);
  // #endregion

  return (
    <>
      <div className="table-utils flex-center">
        <WithCheckbox
          clickTrigger
          list={originFormatCol}
          selectedKeys={selectedKeys}
          handleItemClick={(e) => {
            // hide column
            if (selectedKeys?.includes(e)) {
              // uncheck the column for dropdown
              setSelectedKeys(selectedKeys.filter((x) => x !== e));
              // remove the column from table
              updateColumn(
                columnList?.filter(
                  (x) => x.title !== originFormatCol[e]
                )
              );
            }
            // show column
            else {
              // check the column for dropdown
              setSelectedKeys((old) => {
                return [...old, e].sort();
              });
              // add column back to table
              updateColumn(
                [...columnList, originCol[e]].sort(
                  (a, b) => +a?.key.localeCompare(b?.key)
                )
              );
            }
          }}
        >
          <IconButton
            tooltip="Click to open column display options"
            className="table-utils-icon"
            icon={<TableOutlined className="pointer" />}
          />
        </WithCheckbox>
        <IconButton
          id="refresh-table"
          tooltip="Click to refresh table"
          className="table-utils-icon"
          icon={<ReloadOutlined className="pointer" />}
          onClick={refreshTable}
        />
      </div>
    </>
  );
}
