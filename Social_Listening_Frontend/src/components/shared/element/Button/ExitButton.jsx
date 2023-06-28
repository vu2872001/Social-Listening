import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

export default function ExitButton(props) {
  return (
    <Button icon={<LogoutOutlined />} danger {...props}>
      Exit
    </Button>
  );
}
