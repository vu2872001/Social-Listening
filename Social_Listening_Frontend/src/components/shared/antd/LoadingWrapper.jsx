import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export default function LoadingWrapper(props) {
  const { loading, ...other } = props;

  return (
    <Spin
      spinning={loading}
      indicator={<LoadingOutlined />}
      {...other}
    >
      {props.children}
    </Spin>
  );
}
