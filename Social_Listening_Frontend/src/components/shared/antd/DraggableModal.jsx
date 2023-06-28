import { useRef, useState } from 'react';
import { Modal } from 'antd';
import Draggable from 'react-draggable';
import { Checker } from '../../../utils/dataChecker';

export default function DraggableModal(props) {
  const {
    open,
    toggleOpen,
    title,
    footer,
    handleConfirm,
    closable = true,
    ...other
  } = props;
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggableModelRef = useRef(null);

  const onStart = (_event, uiData) => {
    const { clientWidth, clientHeight } =
      window.document.documentElement;
    const targetRect =
      draggableModelRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  function handleClose() {
    if (!Checker.isNullOrEmpty(toggleOpen)) {
      toggleOpen(false);
    }
  }

  return (
    <Modal
      style={{ cursor: 'grab' }}
      title={title}
      open={open}
      modalRender={(modal) => (
        <Draggable
          bounds={bounds}
          onStart={(event, uiData) => onStart(event, uiData)}
        >
          <div ref={draggableModelRef}>{modal}</div>
        </Draggable>
      )}
      footer={footer}
      closable={closable}
      onCancel={handleClose}
      {...other}
    >
      {props.children}
    </Modal>
  );
}
