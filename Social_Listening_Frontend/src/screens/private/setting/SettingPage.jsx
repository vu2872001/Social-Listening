import { useState, useRef } from 'react';
import { Input } from 'antd';
import { SaveTwoTone } from '@ant-design/icons';
import { useMutation } from 'react-query';
import { updateSetting, useGetAllSetting } from './settingService';
import { useDialogflow } from '../../../components/contexts/dialogflow/DialogflowProvider';
import { updateBaseUrls } from '../../../constants/environment/environment.dev';
import { notifyService } from '../../../services/notifyService';
import useEffectOnce from '../../../components/hooks/useEffectOnce';
import AdminTable from '../../../components/shared/antd/Table/Table';
import ElementWithPermission from '../../../components/shared/element/ElementWithPermission';
import ToolTipWrapper from '../../../components/shared/antd/ToolTipWrapper';

export default function SettingPage() {
  const { updateDialogflowConfig } = useDialogflow();

  const getAllSetting = useRef(true);
  const [_, forceUpdate] = useState(null);

  const { data, isFetching } = useGetAllSetting(
    getAllSetting.current
  );
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

  const useUpdateSetting = useMutation(updateSetting, {
    onSuccess: (resp) => {
      if (resp) {
        getAllSetting.current = true;

        // #region update dialogflow URL
        if (
          resp?.group === 'GOOGLE_API' &&
          resp?.key === 'DIALOGFLOW_KEY'
        ) {
          updateDialogflowConfig(
            resp?.value,
            data?.filter(
              (item) =>
                item?.group === 'GOOGLE_API' &&
                item?.key === 'DIALOGFLOW_LOCATION'
            )[0]?.value
          );
        }

        if (
          resp?.group === 'GOOGLE_API' &&
          resp?.key === 'DIALOGFLOW_LOCATION'
        ) {
          updateDialogflowConfig(
            data?.filter(
              (item) =>
                item?.group === 'GOOGLE_API' &&
                item?.key === 'DIALOGFLOW_KEY'
            )[0]?.value,
            resp?.value
          );
        }
        // #endregion

        // #region update domain URL
        if (
          resp?.group === 'DOMAIN' &&
          resp?.key === 'DOMAIN_BACKEND'
        ) {
          updateBaseUrls(resp?.value);
        }

        if (resp?.group === 'DOMAIN' && resp?.key === 'DOMAIN_BOT') {
          updateBaseUrls(null, resp?.value);
        }
        // #endregion

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
      sort: false,
    },
    {
      title: 'Group',
      dataIndex: 'group',
      sort: false,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      width: 500,
      sort: false,
      disableFilter: true,
      render: (text, record) => {
        function handleSave() {
          if (
            record.value !==
            document.getElementById(record?.id)?.value
          ) {
            useUpdateSetting.mutate({
              key: record?.key,
              group: record?.group,
              value: document
                .getElementById(record?.id)
                ?.value?.trim(),
            });
          }
        }

        return (
          <>
            <ElementWithPermission
              permission="update-setting"
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
    table: 'table-setting',
  };

  return (
    <AdminTable
      columns={columns}
      tableData={data
        ?.sort((a, b) => +a?.group.localeCompare(b?.group))
        ?.sort((a, b) => +a?.key.localeCompare(b?.key))}
      permission={permission}
      isLoading={isFetching}
      disableSelect
      filterFE
    />
  );
}
