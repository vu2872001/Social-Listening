import { Alert } from 'antd';
import './element.scss';

export default function Hint(props) {
  const { message, ...other } = props;

  return (
    <Alert message={message} type="warning" {...other} />
  );
}
