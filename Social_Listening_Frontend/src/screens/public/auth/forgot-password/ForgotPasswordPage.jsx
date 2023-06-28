import { Form, Input, Button } from 'antd';
import { LockTwoTone, UserOutlined } from '@ant-design/icons';
import { apiService } from '../../../../services/apiService';
import { notifyService } from '../../../../services/notifyService';
import { customHistory } from '../../../../routes/CustomRouter';
import environment from '../../../../constants/environment/environment.dev';
import useToggle from '../../../../components/hooks/useToggle';
import ToolTipWrapper from '../../../../components/shared/antd/ToolTipWrapper';
import '../auth.scss';

export default function ForgotPasswordPage() {
  const [loading, toggleLoading] = useToggle(false);

  async function handleSubmit(model) {
    toggleLoading(true);
    try {
      await apiService
        .post(`${environment.auth}/forgot-password`, model)
        .then((resp) => {
          if (resp?.result) {
            customHistory.push('/forgot-password-success');
            notifyService.showSucsessMessage({
              description: 'Forgot password successfully',
            });
          } else {
            customHistory.push('/forgot-password-fail');
          }
        });
    } catch (ex) {
      customHistory.push('/forgot-password-fail');
      notifyService.showErrorMessage({
        description: ex.message,
      });
    }
    toggleLoading(false);
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <LockTwoTone style={{ fontSize: '12rem' }} />
        <h1 className="auth-title" style={{ fontSize: '3.4rem' }}>
          Forgot password!
        </h1>
        <div style={{ marginTop: '0.8rem' }}>
          Make sure that your email already registered.
        </div>
      </div>
      <div className="auth-body">
        <Form
          name="reset-pwd-form"
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <ToolTipWrapper
            tooltip="Only email is allowed"
            placement="topRight"
          >
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Email is required',
                },
                {
                  type: 'email',
                  message: 'Only email is allowed',
                },
              ]}
            >
              <Input
                placeholder="Email *"
                prefix={<UserOutlined />}
              />
            </Form.Item>
          </ToolTipWrapper>

          <Button
            type="primary"
            htmlType="submit"
            className="submit-auth-btn"
            loading={loading}
          >
            Confirm
          </Button>
        </Form>
      </div>
    </div>
  );
}
