import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

export default function CancelButton(props) {
  return (
    <Button icon={<CloseOutlined />} {...props}>
      Cancel
    </Button>
  );
}
