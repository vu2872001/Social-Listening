import { Button } from 'antd';
import ToolTipWrapper from '../../antd/ToolTipWrapper';
import './button.scss';

export default function IconButton(props) {
  const {
    tooltip = '',
    placement = 'top',
    icon,
    className = '',
    ...other
  } = props;

  return (
    <ToolTipWrapper tooltip={tooltip} placement={placement}>
      <Button
        className={`icon-btn ${className}`}
        shape="circle"
        icon={icon}
        {...other}
      />
    </ToolTipWrapper>
  );
}
