import { Navigate } from 'react-router-dom';
import { useGetDecodedToken } from './privateService';
import PrivateLayout from './PrivateLayout';

export default function PermissionRoute({
  permissionRequired,
  element,
  noLayout = false,
}) {
  const { data } = useGetDecodedToken();

  if (permissionRequired) {
    const permissionFromToken = data?.permissions;

    let passPermission = true;
    if (permissionRequired?.includes(', ')) {
      if (
        !permissionRequired
          .split(', ')
          .some((item) => permissionFromToken?.includes(item))
      ) {
        passPermission = false;
      }
    } else {
      if (!permissionFromToken?.includes(permissionRequired)) {
        passPermission = false;
      }
    }

    if (!passPermission) {
      return <Navigate to={{ pathname: '/forbidden' }} />;
    }
  }

  if (noLayout) {
    return <>{element}</>;
  }

  return <PrivateLayout>{element}</PrivateLayout>;
}
