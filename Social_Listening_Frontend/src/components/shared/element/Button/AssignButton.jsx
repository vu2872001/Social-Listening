import { Button } from 'antd';
import {
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
} from '@ant-design/icons';

export default function AssignButton(props) {
  if (props?.unassign === 'true') {
    return (
      <Button
        type="primary"
        icon={<UsergroupDeleteOutlined />}
        {...props}
      >
        Unassign User
      </Button>
    );
  } else {
    return (
      <Button
        type="primary"
        icon={<UsergroupAddOutlined />}
        {...props}
      >
        Assign User
      </Button>
    );
  }
}
