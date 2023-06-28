import { notification } from 'antd';
import {
  HourglassOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

notification.config({
  maxCount: 5,
  duration: 3,
  placement: 'bottomRight',
});

const showSucsessMessage = (config) => {
  const { title, description, ...other } = config;

  notification.open({
    icon: <CheckCircleOutlined />,
    message: title ?? 'Success',
    description: description,
    style: {
      backgroundColor: 'var(--success-color)',
    },
    ...other,
  });
};

const showErrorMessage = (config) => {
  const { title, description, ...other } = config;

  notification.open({
    icon: <CloseCircleOutlined />,
    message: title ?? 'Error',
    description: description,
    style: {
      backgroundColor: 'var(--error-color)',
    },
    ...other,
  });
};

const showWarningMessage = (config) => {
  const { title, description, isProcessing, ...other } = config;

  notification.open({
    icon: isProcessing ? (
      <InfoCircleOutlined />
    ) : (
      <HourglassOutlined />
    ),
    message: isProcessing
      ? title ?? 'Processing...'
      : title ?? 'Warning',
    description: description,
    style: {
      backgroundColor: 'var(--warning-color)',
    },
    ...other,
  });
};

export const notifyService = {
  showErrorMessage,
  showWarningMessage,
  showSucsessMessage,
};
