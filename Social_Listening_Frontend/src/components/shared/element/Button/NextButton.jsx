import { Button } from 'antd';
import { ForwardOutlined } from '@ant-design/icons';

export default function NextButton(props) {
  return (
    <Button type="primary" icon={<ForwardOutlined />} {...props}>
      Next
    </Button>
  );
}
