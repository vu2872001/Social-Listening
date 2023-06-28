import { useQuery } from 'react-query';
import { decodeToken } from 'react-jwt';
import { apiService } from '../../services/apiService';
import environment from '../../constants/environment/environment.dev';

export const getDecodedToken = () => {
  return decodeToken(localStorage.getItem('token'));
};

export const useGetDecodedToken = () => {
  return useQuery('userData', getDecodedToken);
};

export const getAllRole = async () => {
  const resp = await apiService.get(environment.role);
  return resp?.result;
};

export const useGetAllRole = (enabled = true) => {
  return useQuery('allRole', getAllRole, {
    enabled: enabled,
  });
};

// get role that had level <= current user role
export const getRole = async () => {
  const resp = await apiService.get(`${environment.role}/can-create`);
  return resp;
};

export const getAllNotification = async (page) => {
  const resp = await apiService.post(environment.notification, page);
  return resp?.result;
};

export const getAllUser = async () => {
  const resp = await apiService.post(
    `${environment.user}/get-all-user`
  );
  return resp?.result;
};

export const getAllTab = async () => {
  const resp = await apiService.post(
    `${environment.socialTab}/get-all-tab`
  );
  return resp?.result;
};
