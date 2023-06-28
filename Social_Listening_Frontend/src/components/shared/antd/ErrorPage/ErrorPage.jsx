import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import './errorPage.scss';

export default function ErrorPage(props) {
  let { status = '404', title = status, subTitle } = props;
  const navigate = useNavigate();

  switch (status) {
    case '404':
      subTitle = 'Sorry, the page you visited does not exist.';
      break;
    case '403':
      subTitle = 'Sorry, you are not authorized to access this page.';
      break;
  }

  return (
    <Result
      status={status}
      title={title}
      subTitle={subTitle}
      extra={
        <>
          {status === '404' && (
            <Button
              className="redirect-btn"
              type="primary"
              onClick={() => {
                navigate(-1);
              }}
            >
              Go Back
            </Button>
          )}
          <Button
            className="redirect-btn"
            onClick={() => {
              navigate('/home');
            }}
          >
            Go Home
          </Button>
        </>
      }
    />
  );
}
