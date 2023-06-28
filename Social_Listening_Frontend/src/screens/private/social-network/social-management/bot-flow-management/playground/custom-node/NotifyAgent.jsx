import { Handle } from 'reactflow';
import {
  NotificationOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

export default function NotifyAgent(props) {
  const { id, data } = props;

  return (
    <div className="node-wrapper flex-center">
      <div className="node-title flex-center">
        <NotificationOutlined />
        Notify Agent
      </div>
      <Handle
        id="notify-input-handle"
        type="target"
        position="left"
      />
      <CloseCircleOutlined
        className="node-close-btn"
        onClick={(e) => {
          e.stopPropagation();
          data.deleteNode(id);
        }}
      />
    </div>
  );
}
