import { Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export default function UploadButton(props) {
  return (
    <Button icon={<UploadOutlined />} type="primary" {...props}>
      {props.children}
    </Button>
  );
}
