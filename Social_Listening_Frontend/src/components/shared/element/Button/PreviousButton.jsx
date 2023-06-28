import { Button } from 'antd';
import { BackwardOutlined } from '@ant-design/icons';

export default function PreviousButton(props) {
  return (
    <Button icon={<BackwardOutlined />} {...props}>
      Previous
    </Button>
  );
}
