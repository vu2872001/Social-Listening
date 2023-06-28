import { Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';

export default function ExportButton(props) {
  return (
    <Button icon={<ExportOutlined />} {...props}>
      Export
    </Button>
  );
}
