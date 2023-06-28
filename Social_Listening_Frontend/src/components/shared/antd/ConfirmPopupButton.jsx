import { Button, Popconfirm } from 'antd';
import useToggle from '../../../components/hooks/useToggle';

export default function ConfirmPopupButton(props) {
  const {
    action,
    handleConfirm,
    onOpenChange,
    type = 'primary',
    okText = 'Confirm',
    cancelText = 'Cancel',
    ...other
  } = props;

  const [loading, toggleLoading] = useToggle(false);

  async function onConfirm() {
    toggleLoading(true);
    await handleConfirm();
    toggleLoading(false);
  }

  return (
    <Popconfirm
      title={`Are you sure you want to ${action}`}
      onConfirm={onConfirm}
      okText={okText}
      cancelText={cancelText}
      onOpenChange={onOpenChange}
    >
      <Button type={type} loading={loading} {...other}>
        {props.children}
      </Button>
    </Popconfirm>
  );
}
