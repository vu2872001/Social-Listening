import { useQuery } from 'react-query';
import { apiService } from '../../../services/apiService';
import environment from '../../../constants/environment/environment.dev';

export const getHotqueueInfo = async (data) => {
  const resp = await apiService.post(
    `${environment.hotQueue}/sender/find`,
    data
  );
  return resp?.result;
};

export const useGetHotqueueInfo = (data, enabled) => {
  return useQuery('hotQueueInfo', () => getHotqueueInfo(data), {
    enabled: enabled,
  });
};

export const getHotqueueConversation = async () => {
  const resp = await apiService.post(
    `${environment.hotQueue}/conversation`
  );
  return resp?.result;
};

export const useGetHotqueueConversation = (enabled) => {
  return useQuery('hotQueueConservation', getHotqueueConversation, {
    enabled: enabled,
  });
};
