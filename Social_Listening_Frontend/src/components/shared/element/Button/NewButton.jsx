import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function NewButton(props) {
  return (
    <Button icon={<PlusOutlined />} type="primary" {...props}>
      New
    </Button>
  );
}
