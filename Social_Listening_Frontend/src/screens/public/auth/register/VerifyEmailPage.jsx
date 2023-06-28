import { Button } from 'antd';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { apiService } from '../../../../services/apiService';
import { notifyService } from '../../../../services/notifyService';
import { customHistory } from '../../../../routes/CustomRouter';
import environment from '../../../../constants/environment/environment.dev';
import useToggle from '../../../../components/hooks/useToggle';
import useEffectOnce from '../../../../components/hooks/useEffectOnce';
import LoadingWrapper from '../../../../components/shared/antd/LoadingWrapper';
import '../auth.scss';

export default function VerifyEmailPage() {
  const location = useLocation();
  const [correctToken, setCorrectToken] = useToggle(null);

  useEffectOnce(() => {
    const queryParams = location?.search;
    if (queryParams && queryParams?.includes('?token=')) {
      const token = queryParams.substring(7);
      if (token) {
        try {
          apiService
            .post(`${environment.auth}/confirm-email`, {
              token: token,
            })
            .then((resp) => {
              if (resp?.result) {
                setCorrectToken(true);
                notifyService.showSucsessMessage({
                  description: 'Verify email successfully',
                });
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

  return (
    <LoadingWrapper loading={correctToken === null}>
      {correctToken !== null && (
        <div className="auth-wrapper">
          <div className="auth-header">
            {correctToken ? (
              <CheckCircleTwoTone style={{ fontSize: '12rem' }} />
            ) : (
              <CloseCircleTwoTone
                twoToneColor="#ff5656"
                style={{ fontSize: '12rem' }}
              />
            )}
            <h1 className="auth-title" style={{ fontSize: '3.4rem' }}>
              {correctToken
                ? `Thanks for verifying your email address!`
                : `Verify email failed!`}
            </h1>
          </div>
          <div className="auth-body" style={{ padding: 0 }}>
            {correctToken ? (
              <>
                <div
                  style={{
                    marginBottom: '1.2rem',
                    textAlign: 'center',
                  }}
                >
                  Verifying your email address is a simple way to
                  prove that you're a real Perspective user and makes
                  your account more secure. It also helps the system
                  works as it should.
                </div>
                <div
                  style={{
                    marginBottom: '2.8rem',
                    textAlign: 'center',
                  }}
                >
                  Now you can go out and use all the features of our
                  system. Enjoy!
                </div>
              </>
            ) : (
              <div
                style={{
                  marginBottom: '2.8rem',
                  textAlign: 'center',
                }}
              >
                Your activate token has expired or is no longer
                active.
              </div>
            )}
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
    </LoadingWrapper>
  );
}
