import { useRef } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { CheckOutlined, PoweroffOutlined } from '@ant-design/icons';
import { changeStatusBotFlow } from '../../../socialNetworkService';
import { notifyService } from '../../../../../../services/notifyService';
import { defaultAction } from '../../../../../../constants/table/action';
import environment from '../../../../../../constants/environment/environment.dev';
import AdminTable from '../../../../../../components/shared/antd/Table/Table';
import ToolTipWrapper from '../../../../../../components/shared/antd/ToolTipWrapper';
import BooleanRow from '../../../../../../components/shared/element/BooleanRow';
import DateTimeFormat from '../../../../../../components/shared/element/DateTimeFormat';
import AddEditBotFlow from './AddEditBotFlow';

export default function TableBotFlow({ pageId, getCurrentFlow }) {
  const currentAction = useRef(null);
  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData('userData');

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      required: true,
      fixed: true,
      render: (record, value) => {
        return (
          <ToolTipWrapper tooltip="Click to edit flow">
            <b
              className="pointer"
              onClick={() => {
                getCurrentFlow(value);
              }}
            >
              {record}
            </b>
          </ToolTipWrapper>
        );
      },
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      filter: {
        filterType: 'Boolean',
      },
      render: (record) => {
        return <BooleanRow active={record} />;
      },
      onCell: () => ({
        className: 'text-center',
      }),
      sort: false,
      resizeable: false,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      sort: false,
      filter: {
        filterType: 'Dropdown',
        options: [
          {
            label: 'Comment',
            value: 'Comment',
          },
          {
            label: 'Chat',
            value: 'Message',
          },
        ],
      },
      render: (record) => {
        return <>{record === 'Message' ? 'Chat' : record}</>;
      },
      onCell: () => ({
        className: 'text-center',
      }),
    },
    {
      title: 'Date Created',
      dataIndex: 'createAt',
      render: (record) => {
        return <DateTimeFormat dateTime={record} />;
      },
      onCell: () => ({
        className: 'text-center',
      }),
      filter: {
        filterType: 'DateTime',
      },
    },
  ];

  const permission = {
    table: 'table-workflow',
    new: 'create-workflow',
    edit: 'update-workflow',
    delete: 'delete-workflow',
  };

  let additionalList = [
    {
      icon: <CheckOutlined />,
      label: 'Activate',
    },
    {
      icon: <PoweroffOutlined />,
      label: 'Deactivate',
    },
  ];
  if (
    !userData?.permissions?.includes('update-workflow-activation')
  ) {
    additionalList = additionalList?.filter(
      (item) => item?.label !== 'Activate'
    );
    additionalList = additionalList?.filter(
      (item) => item?.label !== 'Deactivate'
    );
  }

  const useChangeStatusFlow = useMutation(changeStatusBotFlow, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: `${currentAction.current} bot flow successfully`,
        });
      }
    },
  });

  async function handleActionClick(action, data) {
    if (action === 'Activate') {
      currentAction.current = 'Activate';
      await useChangeStatusFlow.mutateAsync({
        id: data?.id,
        body: {
          activate: true,
        },
      });
    } else if (action === 'Deactivate') {
      currentAction.current = 'Deactivate';
      await useChangeStatusFlow.mutateAsync({
        id: data?.id,
        body: {
          activate: false,
        },
      });
    }
    return true;
  }

  return (
    <AdminTable
      disableSelect
      apiGetData={`${environment.workflow}`}
      apiGetBody={{ tabId: pageId }}
      apiDeleteOne={`${environment.workflow}/remove`}
      keyProps="id"
      columns={columns}
      permission={permission}
      addEditComponent={
        <AddEditBotFlow
          pageId={pageId}
          getCurrentFlow={getCurrentFlow}
        />
      }
      actionList={[...defaultAction, ...additionalList]}
      handleActionClick={handleActionClick}
    />
  );
}
