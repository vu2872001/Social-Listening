import React from 'react';
import { Space, Drawer } from 'antd';
import SaveButton from '../../../element/Button/SaveButton';
import CancelButton from '../../../element/Button/CancelButton';

export default function AddEditWrapper(props) {
  const { open, onClose, form, loading = false, ...other } = props;

  function handleConfirm() {
    form.submit();
  }

  return (
    <Drawer
      destroyOnClose
      maskClosable={false}
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <CancelButton onClick={onClose} />
          <SaveButton loading={loading} onClick={handleConfirm} />
        </Space>
      }
      {...other}
    >
      {props.children}
    </Drawer>
  );
}
