import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../../../services/apiService';
import { notifyService } from '../../../../services/notifyService';
import environment from '../../../../constants/environment/environment.dev';
import useToggle from '../../../../components/hooks/useToggle';
import authImage from '../../../../assets/images/auth.png';
import ToolTipWrapper from '../../../../components/shared/antd/ToolTipWrapper';
import '../auth.scss';

export default function RegisterPage() {
  const [loading, toggleLoading] = useToggle(false);
  const navigate = useNavigate();

  async function handleSubmit(model) {
    toggleLoading(true);
    try {
      await apiService
        .post(`${environment.auth}/register`, model)
        .then((resp) => {
          if (resp?.result) {
            navigate('/register-success', {
              state: { email: model.email, password: model.password },
            });
            notifyService.showSucsessMessage({
              description: 'Register successfully',
            });
          }
        });
    } catch (ex) {
      notifyService.showErrorMessage({
        description: ex.message,
      });
    }
    toggleLoading(false);
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <h1 className="auth-title">Register</h1>
        <img src={authImage} width="140" alt="auth-pic" />
      </div>
      <div className="auth-body">
        <Form
          name="login-form"
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

          <ToolTipWrapper
            tooltip="Password must between 8 - 50 letters"
            placement="topRight"
          >
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  validator: (_, value) => {
                    let errorMsg = 'Password is required';
                    if (value?.length >= 8 && value?.length <= 50) {
                      return Promise.resolve();
                    }
                    // if it not between 8 - 50, check it has value or not
                    // if it has value -> user already input the field
                    if (value?.length > 0) {
                      errorMsg = 'Password must between 8 - 50';
                    }
                    return Promise.reject(errorMsg);
                  },
                },
              ]}
            >
              <Input.Password
                placeholder="Password *"
                prefix={<LockOutlined />}
              />
            </Form.Item>
          </ToolTipWrapper>

          <ToolTipWrapper
            tooltip="Confirm password must match"
            placement="topRight"
          >
            <Form.Item
              name="confirmPassword"
              rules={[
                {
                  required: true,
                  message: 'Confirm Password is required',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (
                      !value ||
                      getFieldValue('password') === value
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('The confirm password do not match')
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm Password *"
                prefix={<LockOutlined />}
              />
            </Form.Item>
          </ToolTipWrapper>

          <Button
            type="primary"
            htmlType="submit"
            className="submit-auth-btn"
            loading={loading}
          >
            Register
          </Button>
        </Form>
      </div>
      <div className="auth-footer">
        <span>Already had account?</span>
        <Link to="/login" className="register-redirect">
          Login here
        </Link>
      </div>
    </div>
  );
}
