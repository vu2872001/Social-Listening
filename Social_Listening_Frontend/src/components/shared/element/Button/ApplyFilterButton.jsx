import { Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

export default function ApplyFilterButton(props) {
  return (
    <Button type="primary" icon={<CheckOutlined />} {...props}>
      Apply Filter
    </Button>
  );
}
