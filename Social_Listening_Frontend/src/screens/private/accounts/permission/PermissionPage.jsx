import { useMutation } from 'react-query';
import { MinusOutlined } from '@ant-design/icons';
import {
  removeListPermission,
  removePermission,
} from '../accountService';
import { notifyService } from '../../../../services/notifyService';
import { role } from '../../../../constants/environment/environment.dev';
import { RoleChip } from '../../../../components/shared/element/Chip';
import AdminTable from '../../../../components/shared/antd/Table/Table';
import AddEditPermissions from './AddEditPermissions';

export default function PermissionManangement(props) {
  const { defaultFilter } = props;

  const columns = [
    {
      title: 'Role',
      dataIndex: 'role.roleName',
      required: true,
      fixed: true,
      sort: false,
      filter: {
        filterType: 'Dropdown',
        options: role,
      },
      render: (record) => {
        return <RoleChip currentRole={record} />;
      },
      onCell: () => ({
        className: 'text-center',
      }),
    },
    {
      title: 'Permission Name',
      dataIndex: 'permission.displayName',
      sort: false,
    },
    {
      title: 'Permission Key',
      dataIndex: 'permission.permission',
      sort: false,
    },
    {
      title: 'Screen',
      dataIndex: 'permission.screen',
      sort: false,
    },
  ];

  const permission = {
    table: 'table-permission',
    new: 'assign-permission',
    deleteMultiple: 'remove-list-permissions',
  };

  const useRemovePermission = useMutation(removePermission, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Remove permission successfully',
        });
      }
    },
  });
  async function handleActionClick(action, data) {
    if (action === 'Remove') {
      await useRemovePermission.mutateAsync({
        roleId: data?.role?.id,
        permissionId: data?.permission?.id,
      });
      return true;
    }

    return false;
  }

  const useRemoveListPerm = useMutation(removeListPermission, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Remove list permission successfully',
        });
      }
    },
  });
  async function deleteMultiple(rows) {
    await useRemoveListPerm.mutateAsync(
      rows?.map((item) => {
        return {
          roleId: item?.role?.id,
          permissionId: item?.permission?.id,
        };
      })
    );
  }

  return (
    <AdminTable
      columns={columns}
      apiGetData="/permission"
      addEditComponent={<AddEditPermissions />}
      permission={permission}
      actionList={[{ icon: <MinusOutlined />, label: 'Remove' }]}
      handleActionClick={handleActionClick}
      defaultFilter={defaultFilter}
      deleteMultipleRow={deleteMultiple}
    />
  );
}
