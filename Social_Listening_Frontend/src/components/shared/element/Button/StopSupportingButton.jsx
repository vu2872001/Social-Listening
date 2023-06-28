import { Button } from 'antd';
import { PoweroffOutlined } from '@ant-design/icons';

export default function StopSupportingButton(props) {
  return (
    <Button
      icon={<PoweroffOutlined />}
      type="primary"
      danger
      {...props}
    >
      Stop supporting
    </Button>
  );
}
