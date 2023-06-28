import { useGetDecodedToken } from '../../../routes/private/privateService';

export default function ElementWithPermission(props) {
  const { data } = useGetDecodedToken();
  const permissionRequired = props.permission;

  if (permissionRequired) {
    const permissionList = data?.permissions;

    if (permissionList?.includes(permissionRequired)) {
      return <>{props.children}</>;
    }
  }
  return props.fallbackComponent;
}
