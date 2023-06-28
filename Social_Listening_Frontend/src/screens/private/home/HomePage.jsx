import { useState, useRef } from 'react';
import { useMutation } from 'react-query';
import {
  UserAddOutlined,
  UserDeleteOutlined,
  FileDoneOutlined,
  ExceptionOutlined,
} from '@ant-design/icons';
import { useQueryClient } from 'react-query';
import {
  getAllUser,
  getAllTab,
} from '../../../routes/private/privateService';
import dayjs from 'dayjs';
import useEffectOnce from '../../../components/hooks/useEffectOnce';
import SocialNetworkPage from '../social-network/SocialNetworkPage';
import DoubleLineChart from '../../../components/shared/antd/Chart/DoubleLineChart';
import '../social-network/socialNetwork.scss';
import './home.scss';

export default function HomePage() {
  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData('userData');

  const [userList, setUserList] = useState([]);
  const [socialList, setSocialList] = useState([]);
  const userWithDate = useRef({});
  const socialWithDate = useRef({});
  let mergeUserSocial = {};
  Object.keys(userWithDate.current).forEach((value) => {
    mergeUserSocial[value] = {
      user: userWithDate.current[value],
      page: 0,
    };
  });
  Object.keys(socialWithDate.current).forEach((value) => {
    if (Object.keys(mergeUserSocial).includes(value)) {
      mergeUserSocial[value].page = socialWithDate.current[value];
    } else {
      mergeUserSocial[value] = {
        user: 0,
        page: socialWithDate.current[value],
      };
    }
  });

  const useGetAllUser = useMutation(getAllUser, {
    onSuccess: (resp) => {
      if (resp) {
        setUserList(resp);
        resp.forEach((item) => {
          const joinAt = new Date(item?.joinAt)?.toLocaleDateString();

          userWithDate.current[joinAt] =
            (userWithDate.current[joinAt] || 0) + 1;
        });
      }
    },
  });

  const useGetAllSocial = useMutation(getAllTab, {
    onSuccess: (resp) => {
      if (resp) {
        setSocialList(resp);
        resp.forEach((item) => {
          const createdAt = new Date(
            item?.createdAt
          )?.toLocaleDateString();

          socialWithDate.current[createdAt] =
            (socialWithDate.current[createdAt] || 0) + 1;
        });
      }
    },
  });

  useEffectOnce(() => {
    useGetAllUser.mutate();
    useGetAllSocial.mutate();
  });

  return (
    <>
      {userData?.role !== 'ADMIN' ? (
        <SocialNetworkPage />
      ) : (
        <div className="home-container">
          <div className="block-container">
            <div
              className="block flex-center"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <UserAddOutlined />
              <div className="block-statistics">
                Total User Active:{' '}
                {userList?.filter(
                  (item) => item?.isActive && !item?.delete
                )?.length ?? 0}
              </div>
            </div>
            <div
              className="block flex-center"
              style={{ backgroundColor: 'var(--error-color)' }}
            >
              <UserDeleteOutlined />
              <div className="block-statistics">
                Total User Inactive:{' '}
                {userList?.filter(
                  (item) => !item?.isActive || item?.delete
                )?.length ?? 0}
              </div>
            </div>
            <div
              className="block flex-center"
              style={{ backgroundColor: 'var(--success-color)' }}
            >
              <FileDoneOutlined />
              <div className="block-statistics">
                Total Page Active:{' '}
                {socialList?.filter(
                  (item) => !item?.isWorked && !item?.delete
                )?.length ?? 0}
              </div>
            </div>
            <div
              className="block flex-center"
              style={{ backgroundColor: '#000' }}
            >
              <ExceptionOutlined />
              <div className="block-statistics">
                Total Page Inactive:{' '}
                {socialList?.filter(
                  (item) => item?.isWorked || item?.delete
                )?.length ?? 0}
              </div>
            </div>
          </div>
          <div className="chart-container">
            <DoubleLineChart
              className="column-chart"
              xField="date"
              yField={['user', 'page']}
              lineChartData={[
                {
                  date: dayjs(Object.keys(userWithDate.current)[0])
                    .add(-1, 'day')
                    .format('DD/MM/YYYY'),
                  user: 0,
                  page: 0,
                },
                ...Object.keys(mergeUserSocial)?.map((item) => {
                  return {
                    date: item,
                    user: mergeUserSocial[item]?.user,
                    page: mergeUserSocial[item]?.page,
                  };
                }),
              ]}
            />
          </div>
        </div>
      )}
    </>
  );
}
