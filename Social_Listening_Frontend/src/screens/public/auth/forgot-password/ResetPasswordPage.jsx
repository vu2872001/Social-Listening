import { useRef } from 'react';
import { Form, Input, Button } from 'antd';
import {
  UnlockTwoTone,
  LockOutlined,
  CloseCircleTwoTone,
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { apiService } from '../../../../services/apiService';
import { notifyService } from '../../../../services/notifyService';
import { customHistory } from '../../../../routes/CustomRouter';
import environment from '../../../../constants/environment/environment.dev';
import useToggle from '../../../../components/hooks/useToggle';
import useEffectOnce from '../../../../components/hooks/useEffectOnce';
import ToolTipWrapper from '../../../../components/shared/antd/ToolTipWrapper';
import '../auth.scss';
import LoadingWrapper from '../../../../components/shared/antd/LoadingWrapper';

export default function ResetPasswordPage() {
  const token = useRef(null);
  const location = useLocation();
  const [loading, toggleLoading] = useToggle(false);
  const [correctToken, setCorrectToken] = useToggle(null);

  useEffectOnce(() => {
    const queryParams = location?.search;
    if (queryParams && queryParams?.includes('?token=')) {
      const tokenFromQuery = queryParams.substring(7);
      if (tokenFromQuery) {
        token.current = tokenFromQuery;
        try {
          apiService
            .post(
              `${environment.auth}/validate-token/${tokenFromQuery}`
            )
            .then((resp) => {
              if (resp?.result) {
                setCorrectToken(true);
              } else {
                setCorrectToken(false);
              }
            });
        } catch (ex) {
          setCorrectToken(false);
          notifyService.showErrorMessage({
            description: ex.message,
          });
        }
      } else {
        setCorrectToken(false);
      }
    } else {
      setCorrectToken(false);
    }
  });

  async function handleSubmit(model) {
    toggleLoading(true);
    try {
      await apiService
        .post(
          `${environment.auth}/reset-password/${token.current}`,
          model
        )
        .then((resp) => {
          if (resp?.result) {
            customHistory.push('/recovery-password-success');
            notifyService.showSucsessMessage({
              description: 'Reset password successfully',
            });
          } else {
            customHistory.push('/recovery-password-fail');
          }
        });
    } catch (ex) {
      customHistory.push('/recovery-password-fail');
      notifyService.showErrorMessage({
        description: ex.message,
      });
    }
    toggleLoading(false);
  }

  return (
    <LoadingWrapper loading={correctToken === null}>
      {correctToken !== null && (
        <>
          {correctToken ? (
            <div className="auth-wrapper">
              <div className="auth-header">
                <UnlockTwoTone style={{ fontSize: '12rem' }} />
                <h1
                  className="auth-title"
                  style={{ fontSize: '3.4rem' }}
                >
                  Reset password!
                </h1>
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
                    tooltip="Password must between 8 - 50"
                    placement="topRight"
                  >
                    <Form.Item
                      name="password"
                      rules={[
                        {
                          required: true,
                          validator: (_, value) => {
                            let errorMsg = 'Password is required';
                            if (
                              value?.length >= 8 &&
                              value?.length <= 50
                            ) {
                              return Promise.resolve();
                            }
                            // if it not between 8 - 50, check it has value or not
                            // if it has value -> user already input the field
                            if (value?.length > 0) {
                              errorMsg =
                                'Password must between 8 - 50';
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
                              new Error(
                                'The confirm password do not match'
                              )
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
                    Save
                  </Button>
                </Form>
              </div>
            </div>
          ) : (
            <div className="auth-wrapper">
              <div className="auth-header">
                <CloseCircleTwoTone
                  twoToneColor="#ff5656"
                  style={{ fontSize: '12rem' }}
                />
                <h1
                  className="auth-title"
                  style={{ fontSize: '3.4rem' }}
                >
                  Invalid token!
                </h1>
              </div>
              <div className="auth-body" style={{ padding: 0 }}>
                <div
                  style={{
                    marginBottom: '2.8rem',
                    textAlign: 'center',
                  }}
                >
                  Your activate token has expired or is no longer
                  active.
                </div>
              </div>
              <div className="auth-footer flex-center">
                <Button
                  type="primary"
                  className="redirect-btn"
                  onClick={() => {
                    customHistory.push('/login');
                  }}
                >
                  Back to login
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </LoadingWrapper>
  );
}
