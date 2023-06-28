import { Navigate, Outlet } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { decodeToken } from 'react-jwt';
import { Checker } from '../../utils/dataChecker';

export default function PrivateRoute() {
  let isAuth = true;
  const token = localStorage.getItem('token');
  const queryClient = useQueryClient();

  if (Checker.isNullOrEmpty(token)) {
    isAuth = false;
  }

  const decodedToken = decodeToken(token);
  if (Checker.isNullOrEmpty(decodedToken)) {
    isAuth = false;
  }

  if (isAuth) {
    queryClient.setQueryData('userData', decodedToken);
    return <Outlet />;
  } else {
    return <Navigate to={{ pathname: '/login' }} />;
  }
}
