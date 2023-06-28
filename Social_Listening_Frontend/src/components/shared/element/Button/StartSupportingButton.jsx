import { Button } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

export default function StartSupportingButton(props) {
  return (
    <Button
      icon={<PlayCircleOutlined />}
      type="primary"
      {...props}
    >
      Start supporting
    </Button>
  );
}
