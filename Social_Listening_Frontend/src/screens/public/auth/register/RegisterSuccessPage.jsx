import { Button } from 'antd';
import { MailTwoTone } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { apiService } from '../../../../services/apiService';
import { notifyService } from '../../../../services/notifyService';
import { customHistory } from '../../../../routes/CustomRouter';
import environment from '../../../../constants/environment/environment.dev';
import useToggle from '../../../../components/hooks/useToggle';
import '../auth.scss';

export default function RegisterSuccessPage() {
  const location = useLocation();
  const [loading, toggleLoading] = useToggle(false);

  const authModel = {
    email: location.state?.email,
    password: location.state?.password,
  };

  async function handleLogin() {
    toggleLoading(true);
    try {
      await apiService
        .post(`${environment.auth}/log-in`, authModel)
        .then((resp) => {
          if (resp?.result) {
            localStorage.setItem('token', resp.result?.access);
            customHistory.push('/home');
            notifyService.showSucsessMessage({
              description: 'Login successfully',
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
        <MailTwoTone style={{ fontSize: '12rem' }} />
        <h1 className="auth-title" style={{ fontSize: '3.4rem' }}>
          Thanks for your signing up!
        </h1>
      </div>
      <div className="auth-body" style={{ padding: 0 }}>
        <div style={{ marginBottom: '1.2rem', textAlign: 'center' }}>
          We're happy you signed up for Social Listening. To start
          exploring the app, please verify that{' '}
          <span style={{ fontWeight: 'bold' }}>
            {authModel.email}
          </span>{' '}
          is your email address. Please take a moment to confirm your
          email within the next hour.
        </div>
        <div style={{ marginBottom: '2.8rem', textAlign: 'center' }}>
          But you can Login now with less permissions/function by
          clicking the button below (We recommend you should verify
          your email first)
        </div>
      </div>
      <div className="auth-footer flex-center">
        <Button
          type="primary"
          className="redirect-btn"
          onClick={handleLogin}
          loading={loading}
        >
          Login
        </Button>
      </div>
    </div>
  );
}
