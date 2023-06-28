import { useQuery } from 'react-query';
import { apiService } from '../../../services/apiService';
import environment from '../../../constants/environment/environment.dev';

export const getAllSetting = async () => {
  const resp = await apiService.get(
    `${environment.setting}/getAllSetting`
  );
  return resp;
};

export const useGetAllSetting = (enabled = true) => {
  return useQuery('allSetting', getAllSetting, {
    enabled: enabled,
  });
};

export const updateSetting = async (data) => {
  const resp = await apiService.put(
    `${environment.setting}/update-setting`,
    data
  );
  return resp;
};

export const getSettingByKeyAndGroup = async (data) => {
  const resp = await apiService.post(
    `${environment.setting}/getSettingByKeyAndGroup`,
    data
  );
  return resp;
};
