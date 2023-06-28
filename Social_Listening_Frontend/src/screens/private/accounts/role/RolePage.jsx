import { useRef } from 'react';
import { Card, Divider } from 'antd';
import { useGetAllRole } from '../../../../routes/private/privateService';
import useToggle from '../../../../components/hooks/useToggle';
import ToolTipWrapper from '../../../../components/shared/antd/ToolTipWrapper';
import ModalDetail from './ModalDetail';
import './rolePage.scss';

export default function RolePage() {
  const getRole = useRef(true);
  const { data: roleList } = useGetAllRole(getRole.current);
  getRole.current = false;

  const [openModal, toggleOpenModal] = useToggle(false);
  const type = useRef(null);
  const role = useRef(null);

  function closeMoreDetail() {
    type.current = null;
    role.current = null;
    toggleOpenModal(false);
  }

  return (
    <div className="role-page-wrapper">
      {roleList?.map((item, index) => (
        <Card
          key={index}
          className={
            item?.roleName === 'OWNER'
              ? 'owner'
              : item?.roleName === 'ADMIN'
              ? 'admin'
              : item?.roleName === 'MANAGER'
              ? 'manager'
              : item?.roleName === 'SUPPORTER'
              ? 'supporter'
              : ''
          }
          title={item?.roleName}
        >
          <ToolTipWrapper tooltip="Click to open details">
            <div
              className="role-summarize"
              onClick={() => {
                type.current = 'User';
                role.current = item?.roleName;
                toggleOpenModal(true);
              }}
            >
              Total User: {item?._count?.User}
            </div>
          </ToolTipWrapper>
          <Divider />
          <ToolTipWrapper tooltip="Click to open details">
            <div
              className="role-summarize"
              onClick={() => {
                type.current = 'Permission';
                role.current = item?.roleName;
                toggleOpenModal(true);
              }}
            >
              Total Permission: {item?._count?.Role_Permission}
            </div>
          </ToolTipWrapper>
        </Card>
      ))}

      {openModal && (
        <ModalDetail
          open={openModal}
          close={closeMoreDetail}
          type={type.current}
          role={role.current}
        />
      )}
    </div>
  );
}
