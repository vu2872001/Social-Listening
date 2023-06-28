import { Button } from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import ToolTipWrapper from '../../antd/ToolTipWrapper';

export default function ImportButton(props) {
  return (
    <ToolTipWrapper tooltip="Only excel files (.xlsx, .xls) are allowed">
      <Button icon={<ImportOutlined />} {...props}>
        Import
      </Button>
    </ToolTipWrapper>
  );
}
