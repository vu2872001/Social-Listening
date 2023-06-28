import { Button } from 'antd';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { customHistory } from '../../../../routes/CustomRouter';
import useToggle from '../../../../components/hooks/useToggle';
import useEffectOnce from '../../../../components/hooks/useEffectOnce';
import '../auth.scss';

export default function ResetPasswordStatus() {
  const location = useLocation();
  const [success, setSuccess] = useToggle(false);

  useEffectOnce(() => {
    if (location?.pathname?.includes('success')) {
      setSuccess(true);
    }
  });

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        {success ? (
          <CheckCircleTwoTone style={{ fontSize: '12rem' }} />
        ) : (
          <CloseCircleTwoTone
            twoToneColor="#ff5656"
            style={{ fontSize: '12rem' }}
          />
        )}
        <h1 className="auth-title" style={{ fontSize: '3.4rem' }}>
          {success ? 'Success!' : 'Fail!'}
        </h1>
      </div>
      <div className="auth-body" style={{ padding: '0 4rem' }}>
        <div style={{ marginBottom: '2.8rem', textAlign: 'center' }}>
          {success
            ? 'Your password has been changed successfully. Please login with the new password.'
            : 'Your reset password is invalid.'}
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
  );
}
