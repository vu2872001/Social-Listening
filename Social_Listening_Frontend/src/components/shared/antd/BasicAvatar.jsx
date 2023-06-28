import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

export default function BasicAvatar({ name = '', src = '', ...other }) {
  return (
    <Avatar
      {...(!name && { icon: <UserOutlined /> })}
      alt={name ?? 'default-avt'}
      {...(src && { src: src })}
      {...other}
    >
      {name?.charAt(0)}
    </Avatar>
  );
}
