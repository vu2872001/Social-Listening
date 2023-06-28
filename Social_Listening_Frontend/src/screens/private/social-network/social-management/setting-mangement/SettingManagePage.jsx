import { useState, useRef } from 'react';
import { Input } from 'antd';
import { SaveTwoTone } from '@ant-design/icons';
import { useMutation } from 'react-query';
import { notifyService } from '../../../../../services/notifyService';
import {
  updateSocialSetting,
  useGetTabSetting,
} from '../../socialNetworkService';
import useEffectOnce from '../../../../../components/hooks/useEffectOnce';
import AdminTable from '../../../../../components/shared/antd/Table/Table';
import ElementWithPermission from '../../../../../components/shared/element/ElementWithPermission';
import ToolTipWrapper from '../../../../../components/shared/antd/ToolTipWrapper';

export default function SettingManagePage({ pageId }) {
  const [_, forceUpdate] = useState(null);
  const getAllSetting = useRef(true);

  const { data } = useGetTabSetting(pageId, getAllSetting.current);
  getAllSetting.current = false;

  const handleRefreshTable = (e) => {
    getAllSetting.current = true;
    forceUpdate(e);
  };

  useEffectOnce(
    () => {
      document
        .getElementById('refresh-table')
        ?.addEventListener('click', handleRefreshTable);
    },
    () => {
      document
        .getElementById('refresh-table')
        ?.removeEventListener('click', handleRefreshTable);
    }
  );

  const useUpdateSetting = useMutation(updateSocialSetting, {
    onSuccess: (resp) => {
      if (resp) {
        getAllSetting.current = true;

        notifyService.showSucsessMessage({
          description: 'Save setting successfully',
        });
      }
    },
  });

  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
    },
    {
      title: 'Group',
      dataIndex: 'group',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      width: 500,
      render: (text, record) => {
        function handleSave() {
          useUpdateSetting.mutate({
            id: record?.id,
            data: {
              key: record?.key,
              group: record?.group,
              tabId: record?.tabId,
              value: document.getElementById(record?.id)?.value,
            },
          });
        }

        return (
          <>
            <ElementWithPermission
              permission="update-social-setting"
              fallbackComponent={<>{text}</>}
            >
              <ToolTipWrapper tooltip="You can press enter or unfocus the input to save">
                <Input
                  id={record?.id}
                  defaultValue={text}
                  onBlur={handleSave}
                  onPressEnter={(e) => e.currentTarget.blur()}
                  suffix={
                    <SaveTwoTone
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById(record?.id)?.blur();
                      }}
                    />
                  }
                  style={{ fontSize: 'var(--app-font-size)' }}
                  allowClear
                />
              </ToolTipWrapper>
            </ElementWithPermission>
          </>
        );
      },
    },
  ];

  const permission = {
    table: 'get-social-setting',
  };

  return (
    <AdminTable
      columns={columns}
      tableData={data}
      permission={permission}
      disableSelect
    />
  );
}
