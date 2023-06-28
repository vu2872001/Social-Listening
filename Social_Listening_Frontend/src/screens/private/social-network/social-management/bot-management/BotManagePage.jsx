import { useState, useRef } from 'react';
import { useMutation } from 'react-query';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { notifyService } from '../../../../../services/notifyService';
import {
  deleteDialogflowBot,
  deleteDialogflowIntent,
  useGetDialogflowIntents,
  useGetListDialogflowBot,
} from '../../socialNetworkService';
import { useDialogflow } from '../../../../../components/contexts/dialogflow/DialogflowProvider';
import useEffectOnce from '../../../../../components/hooks/useEffectOnce';
import useUpdateEffect from '../../../../../components/hooks/useUpdateEffect';
import ToolTipWrapper from '../../../../../components/shared/antd/ToolTipWrapper';
import AdminTable from '../../../../../components/shared/antd/Table/Table';
import BooleanRow from '../../../../../components/shared/element/BooleanRow';
import AddEditBot from './AddEditBot';
import AddEditIntent from './AddEditIntent';

export default function BotManagePage({ pageId, socialPage }) {
  const { dialogflowConfig } = useDialogflow();

  const getData = useRef(true);
  const [_, forceUpdate] = useState(null);
  const [botSelected, setBotSelected] = useState(null);

  const botColumns = [
    {
      title: 'Name',
      dataIndex: 'display_name',
      render: (record, value) => {
        let formatName = record;
        if (record?.includes(`-${pageId}`)) {
          formatName = record.substring(0, record.length - 37);
        }

        return (
          <ToolTipWrapper tooltip="Click to edit bot intents">
            <b
              className="pointer full-width"
              onClick={(e) => {
                let id = null;
                if (value) {
                  const splitName = value?.name?.split('/');
                  id = splitName[splitName?.length - 1];
                }
                getData.current = true;
                setBotSelected(id);
              }}
            >
              {formatName}
            </b>
          </ToolTipWrapper>
        );
      },
      width: 300,
    },
    {
      title: 'Language',
      dataIndex: 'default_language_code',
      onCell: () => ({
        className: 'text-center',
      }),
    },
    {
      title: 'Time Zone',
      dataIndex: 'time_zone',
      onCell: () => ({
        className: 'text-center',
      }),
    },
  ];
  const intentColumns = [
    {
      title: 'Name',
      dataIndex: 'display_name',
      fixed: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Fallback',
      dataIndex: 'is_fallback',
      filter: {
        filterType: 'Boolean',
      },
      render: (record) => {
        return <BooleanRow active={record} />;
      },
      onCell: () => ({
        className: 'text-center',
      }),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      filter: {
        filterType: 'Number',
      },
      onCell: () => ({
        className: 'text-center',
      }),
    },
  ];
  const [columns, setColumns] = useState(botColumns);

  useUpdateEffect(() => {
    if (botSelected) {
      setColumns(intentColumns);
    } else {
      setColumns(botColumns);
    }
  }, [botSelected]);

  useUpdateEffect(() => {
    document.getElementById('refresh-table')?.click();
  }, [columns]);

  const { data: botList, isFetching: botFetching } =
    useGetListDialogflowBot(
      dialogflowConfig,
      dialogflowConfig !== null && getData.current && !botSelected
    );

  const { data: intentList, isFetching: intentFetching } =
    useGetDialogflowIntents(
      dialogflowConfig,
      botSelected,
      dialogflowConfig !== null &&
        getData.current &&
        botSelected?.length > 0
    );
  getData.current = false;

  useUpdateEffect(() => {
    if (dialogflowConfig) {
      getData.current = true;
      forceUpdate(dialogflowConfig);
    }
  }, [dialogflowConfig]);

  let data = botList?.filter((bot) =>
    bot?.display_name?.includes(`-${pageId}`)
  );
  if (botSelected) {
    data = intentList;
  }

  const handleRefreshTable = (e) => {
    getData.current = true;
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

  const permission = {
    table: 'table-workflow',
    new: 'create-workflow',
    edit: 'update-workflow',
    delete: 'delete-workflow',
  };

  const useDeleteBot = useMutation(deleteDialogflowBot, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Delete bot successfully',
        });
      }
    },
  });

  const useDeleteIntent = useMutation(deleteDialogflowIntent, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Delete intent successfully',
        });
      }
    },
  });

  const onClickDelete = async (row) => {
    let id = null;
    if (row) {
      const splitName = row?.name?.split('/');
      id = splitName[splitName?.length - 1];
    }

    if (!botSelected) {
      await useDeleteBot.mutateAsync({
        dialogflowConfig: dialogflowConfig,
        agentId: id,
      });
    } else {
      await useDeleteIntent.mutateAsync({
        dialogflowConfig: dialogflowConfig,
        agentId: botSelected,
        intentId: id,
      });
    }
  };

  const customToolbar = (
    <>
      {botSelected && (
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              setBotSelected(null);
            }}
            disabled={intentFetching}
          >
            Go back
          </Button>
        </div>
      )}
    </>
  );

  return (
    <AdminTable
      columns={columns}
      tableData={data}
      isLoading={
        !botSelected
          ? botFetching || useDeleteBot.isLoading
          : intentFetching || useDeleteIntent.isLoading
      }
      permission={permission}
      addEditComponent={
        !botSelected ? (
          <AddEditBot
            pageId={pageId}
            dialogflowConfig={dialogflowConfig}
          />
        ) : (
          <AddEditIntent
            agentId={botSelected}
            dialogflowConfig={dialogflowConfig}
            hadFallback={
              data?.filter((item) => item.is_fallback)?.length > 0
            }
          />
        )
      }
      deleteOneRow={onClickDelete}
      customToolbar={customToolbar}
      disableSelect
      filterFE
    />
  );
}
