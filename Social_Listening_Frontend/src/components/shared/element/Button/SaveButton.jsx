import { Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

export default function SaveButton(props) {
  return (
    <Button icon={<SaveOutlined />} type="primary" {...props}>
      Save
    </Button>
  );
}
