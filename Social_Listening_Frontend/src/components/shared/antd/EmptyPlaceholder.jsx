import { Empty } from 'antd';

export default function EmptyPlaceholder(props) {
  const { description, imageStyle, ...other } = props;
  
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={description}
      imageStyle={imageStyle}
      {...other}
    >
      {props.children}
    </Empty>
  );
}
