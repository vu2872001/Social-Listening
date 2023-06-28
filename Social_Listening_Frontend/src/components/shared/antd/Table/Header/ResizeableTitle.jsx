import { Resizable } from 'react-resizable';
import { Checker } from '../../../../../utils/dataChecker';

export default function ResizeableTitle(props) {
  const {
    onResize,
    width = 150,
    minWidth = 80,
    maxWidth = 500,
    ...restProps
  } = props;

  //if onResize is null or empty, this mean the title is unresizeable
  if (Checker.isNullOrEmpty(onResize)) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      minConstraints={[minWidth, 0]}
      maxConstraints={[maxWidth, 0]}
      handle={<span className="react-resizable-handle" />}
      onResize={onResize}
      draggableOpts={{
        enableUserSelectHack: false,
      }}
    >
      <th {...restProps} />
    </Resizable>
  );
}
