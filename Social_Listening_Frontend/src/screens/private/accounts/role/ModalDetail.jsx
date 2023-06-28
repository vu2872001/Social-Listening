import { Modal } from 'antd';
import AdminAccountPage from '../user/UserPage';
import PermissionPage from '../permission/PermissionPage';

export default function ModalDetail(props) {
  const { open, close, type, role } = props;

  let defaultFilter = [
    {
      props: 'role.roleName',
      value: [role],
      filterOperator: 'Contains',
      filterType: 'Dropdown'
    },
  ];

  return (
    <Modal
      open={open}
      width={1200}
      onCancel={close}
      footer={null}
      destroyOnClose
      centered
    >
      {type === 'User' ? (
        <AdminAccountPage defaultFilter={defaultFilter} />
      ) : (
        <PermissionPage defaultFilter={defaultFilter} />
      )}
    </Modal>
  );
}
