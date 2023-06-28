import { useState } from 'react';
import { PoweroffOutlined, CheckOutlined } from '@ant-design/icons';
import { useQueryClient, useMutation } from 'react-query';
import {
  gender,
  role,
} from '../../../../constants/environment/environment.dev';
import { RoleChip } from '../../../../components/shared/element/Chip';
import { defaultAction } from '../../../../constants/table/action';
import { activateUser, deactivateUser } from '../accountService';
import { notifyService } from '../../../../services/notifyService';
import useToggle from '../../../../components/hooks/useToggle';
import environment from '../../../../constants/environment/environment.dev';
import AdminTable from '../../../../components/shared/antd/Table/Table';
import BooleanRow from '../../../../components/shared/element/BooleanRow';
import DateTimeFormat from '../../../../components/shared/element/DateTimeFormat';
import AssignButton from '../../../../components/shared/element/Button/AssignButton';
import ElementWithPermission from '../../../../components/shared/element/ElementWithPermission';
import AddEditUser from './AddEditUser';
import AssignUserModal from './AssignUserModal';
import ToolTipWrapper from '../../../../components/shared/antd/ToolTipWrapper';

export default function UserManagement(props) {
  const { defaultFilter } = props;

  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData('userData');

  const [selectedRows, setSelectedRows] = useState([]);
  function getSelectedRows(rows) {
    setSelectedRows(rows);
  }

  const [openAssign, toggleOpenAssign] = useToggle(false);
  function handleAssignUser() {
    if (
      selectedRows?.length === 1 &&
      selectedRows[0]?.id === userData?.id
    ) {
      notifyService.showWarningMessage({
        description: 'You can not assign yourself',
      });
    } else {
      toggleOpenAssign(true);
    }
  }

  let formatRole = role;
  if (userData?.role !== 'ADMIN') {
    formatRole = role.filter((item) => item.label !== 'Admin');
  }

  let apiGetData = environment.user;
  if (userData?.role === 'OWNER') {
    apiGetData += '/all';
  }

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      required: true,
      fixed: true,
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
      width: 100,
    },
    ...(userData?.role === 'ADMIN'
      ? [
          {
            title: 'Role',
            dataIndex: 'role.roleName',
            sort: false,
            filter: {
              filterType: 'Dropdown',
              options: formatRole,
            },
            render: (record) => {
              return <RoleChip currentRole={record} />;
            },
            onCell: () => ({
              className: 'text-center',
            }),
          },
        ]
      : []),
    {
      title: 'User Name',
      dataIndex: 'userName',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      filter: {
        filterType: 'Dropdown',
        options: gender,
      },
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
    },
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      render: (record) => {
        return <DateTimeFormat dateTime={record} />;
      },
      filter: {
        filterType: 'DateTime',
      },
      onCell: () => ({
        className: 'text-center',
      }),
    },
    {
      title: 'Date Modified',
      dataIndex: 'updatedAt',
      render: (record) => {
        return <DateTimeFormat dateTime={record} />;
      },
      filter: {
        filterType: 'DateTime',
      },
      onCell: () => ({
        className: 'text-center',
      }),
    },
  ];

  const permission = {
    table:
      userData?.role === 'ADMIN' ? 'table-user' : 'table-user-in-tab',
    new: 'create-user',
    ...(userData?.role === 'OWNER' && { import: 'import-user' }),
    export: 'export-user',
    edit: 'update-user',
    delete: 'remove-user',
  };

  const importColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      required: true,
    },
    {
      title: 'Password',
      dataIndex: 'password',
      required: true,
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      required: true,
    },
    {
      title: 'User Name',
      dataIndex: 'userName',
      required: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
    },
  ];

  const dumpImportData = [
    {
      email: 'user1@gmail.com',
      password: 'secret-password',
      fullName: 'user1',
      userName: 'user1',
    },
    {
      email: 'user2@gmail.com',
      password: 'secret-password',
      fullName: 'user2',
      userName: 'user2',
    },
    {
      email: 'user3@gmail.com',
      password: 'secret-password',
      fullName: 'user3',
      userName: 'user3',
    },
    {
      email: 'user4@gmail.com',
      password: 'secret-password',
      fullName: 'user4',
      userName: 'user4',
    },
    {
      email: 'user5@gmail.com',
      password: 'secret-password',
      fullName: 'user5',
      userName: 'user5',
    },
    {
      email: 'user6@gmail.com',
      password: 'secret-password',
      fullName: 'user6',
      userName: 'user6',
    },
    {
      email: 'user7@gmail.com',
      password: 'secret-password',
      fullName: 'user7',
      userName: 'user7',
    },
    {
      email: 'user8@gmail.com',
      password: 'secret-password',
      fullName: 'user8',
      userName: 'user8',
    },
    {
      email: 'user9@gmail.com',
      password: 'secret-password',
      fullName: 'user9',
      userName: 'user9',
    },
    {
      email: 'user10@gmail.com',
      password: 'secret-password',
      fullName: 'user10',
      userName: 'user10',
    },
  ];

  const customToolbar = (
    <>
      {userData?.role === 'OWNER' && (
        <ElementWithPermission permission="assign-user">
          <ToolTipWrapper tooltip="Select users/rows first to assign">
            <div>
              <AssignButton
                onClick={handleAssignUser}
                disabled={!selectedRows?.length}
              />
            </div>
          </ToolTipWrapper>
        </ElementWithPermission>
      )}
    </>
  );

  const useActivateUser = useMutation(activateUser, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Activate successfully',
        });
      }
    },
  });

  const useDeactivateUser = useMutation(deactivateUser, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Deactivate successfully',
        });
      }
    },
  });

  let additionalList = [
    ...defaultAction,
    {
      icon: <CheckOutlined />,
      label: 'Activate',
    },
    {
      icon: <PoweroffOutlined />,
      label: 'Deactivate',
    },
  ];
  if (userData?.role === 'ADMIN') {
    additionalList = [];
  }
  if (!userData?.permissions?.includes('activate-user')) {
    additionalList = additionalList?.filter(
      (item) => item?.label !== 'Activate'
    );
  }
  if (!userData?.permissions?.includes('deactivate-user')) {
    additionalList = additionalList?.filter(
      (item) => item?.label !== 'Deactivate'
    );
  }

  async function handleActionClick(action, data) {
    if (action === 'Activate') {
      await useActivateUser.mutateAsync(data?.id);
    } else if (action === 'Deactivate') {
      await useDeactivateUser.mutateAsync(data?.id);
    }
    return true;
  }

  return (
    <>
      <AdminTable
        apiGetData={apiGetData}
        apiImport={`${environment.user}/import`}
        apiExport={`${environment.user}/export`}
        apiDeleteOne={`${environment.user}/remove`}
        keyProps="id"
        columns={columns}
        importColumns={importColumns}
        dumpImportData={dumpImportData}
        addEditComponent={<AddEditUser />}
        permission={permission}
        defaultFilter={defaultFilter}
        customToolbar={customToolbar}
        actionList={[...additionalList]}
        handleActionClick={handleActionClick}
        getSelectedRows={getSelectedRows}
        scroll={{ x: 2000 }}
        disableSelect={userData?.role === 'ADMIN'}
      />

      {openAssign && (
        <AssignUserModal
          open={openAssign}
          close={() => {
            toggleOpenAssign(false);
          }}
          userList={selectedRows}
        />
      )}
    </>
  );
}
