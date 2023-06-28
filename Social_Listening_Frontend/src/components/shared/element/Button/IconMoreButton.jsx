import { MoreOutlined } from '@ant-design/icons';
import IconButton from './IconButton';

export default function IconMoreButton({
  tooltip = 'Open actions',
  placement,
  ...other
}) {
  return (
    <IconButton
      tooltip={tooltip}
      placement={placement}
      icon={<MoreOutlined />}
      {...other}
    />
  );
}
