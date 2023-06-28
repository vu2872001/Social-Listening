import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import ToolTipWrapper from '../../antd/ToolTipWrapper';

export default function DownloadButton(props) {
  const { tooltip, placement = 'left', ...other } = props;
  return (
    <ToolTipWrapper tooltip={tooltip} placement={placement}>
      <Button icon={<DownloadOutlined />} {...other}>
        Download
      </Button>
    </ToolTipWrapper>
  );
}
