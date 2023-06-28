import { Handle } from 'reactflow';
import {
  MessageOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import useEffectOnce from '../../../../../../../components/hooks/useEffectOnce';

export default function RespondNode(props) {
  const { id, data } = props;

  useEffectOnce(() => {
    if (
      data?.notifyAgent === null ||
      data?.notifyAgent === undefined
    ) {
      data?.syncData(id, {
        notifyAgent: true,
      });
    }
  });

  return (
    <div
      className="node-wrapper flex-center"
      style={{
        backgroundColor:
          data?.selectedNode?.id === id
            ? 'var(--gray-layout-color)'
            : '#fff',
      }}
    >
      <div className="node-title flex-center">
        <MessageOutlined />
        Respond
      </div>
      <Handle id="resp-input-handle" type="target" position="left" />
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
