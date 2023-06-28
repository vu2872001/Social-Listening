import { useEffect, useRef } from 'react';
import { Card } from 'antd';
import {
  PlusOutlined,
  FacebookOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { useMutation } from 'react-query';
import { getSettingByKeyAndGroup } from '../../setting/settingService';
import { connectFacebook } from '../socialNetworkService';
import useToggle from '../../../../components/hooks/useToggle';
import useEffectOnce from '../../../../components/hooks/useEffectOnce';
import SocialPagePopup from './SocialPagePopup';
import ClassicDropdown from '../../../../components/shared/antd/Dropdown/Classic';

const socialList = [
  { icon: <FacebookOutlined />, label: 'Connect Fanpage' },
  // { icon: <WhatsAppOutlined />, label: 'Whatapps' },
];

export default function AddNewPage(props) {
  const { listPageConnected } = props;
  const socialType = useRef(null);
  const [open, toggleOpen] = useToggle(false);

  // #region facebook
  const appId = useRef(null);
  const appConfigId = useRef(null);
  const appSecret = useRef(null);
  useEffectOnce(() => {
    getSettingByKeyAndGroup({
      key: 'FACEBOOK_APP_ID',
      group: 'CONNECTOR',
    }).then((resp) => {
      appId.current = resp?.value;
    });

    getSettingByKeyAndGroup({
      key: 'FACEBOOK_APP_CONFIG_ID',
      group: 'CONNECTOR',
    }).then((resp) => {
      appConfigId.current = resp?.value;
    });

    getSettingByKeyAndGroup({
      key: 'FACEBOOK_APP_SECRET',
      group: 'CONNECTOR',
    }).then((resp) => {
      appSecret.current = resp?.value;
    });
  });

  const listPage = useRef(null);
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        // This is App ID
        appId: appId.current,
        cookie: true,
        status: true,
        xfbml: true,
        version: 'v16.0',
      });

      window.FB.AppEvents.logPageView();
    };

    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  });

  const useGetPageToken = useMutation(connectFacebook, {
    onSuccess: (resp) => {
      toggleOpen(true);
      listPage.current = resp?.data?.map((item) => {
        return {
          id: item.id,
          name: item.name,
          accessToken: item.access_token,
          pictureUrl: item.picture?.data?.url,
          wallpaperUrl: item.cover?.source,
        };
      });
    },
  });

  function onFacebookLogin(isRefresh = false) {
    window.FB.login(
      function (response) {
        if (response?.status === 'connected') {
          if (!isRefresh) {
            const userId = response?.authResponse?.userID;
            const userToken = response?.authResponse?.accessToken;

            if (userId && userToken) {
              useGetPageToken.mutate({
                userId: userId,
                userToken: userToken,
              });
            }
          } else {
            window.FB.logout(function (response) {
              onFacebookLogin();
            });
          }
        }
      },
      {
        config_id: appConfigId.current, // configuration ID goes here
      }
    );
  }
  // #endregion

  function handleItemClick(e) {
    if (socialList[e.key]?.label === 'Connect Fanpage') {
      socialType.current = 'Facebook';
      onFacebookLogin();
    }
  }

  return (
    <>
      <Card className="page-card add-new">
        <div className="overlay flex-center">
          <ClassicDropdown
            list={socialList}
            handleItemClick={handleItemClick}
            clickTrigger
            hasIcon
          >
            <div className="connect-section flex-center">
              <PlusOutlined />
              <span>Connect new page(s)</span>
            </div>
          </ClassicDropdown>
        </div>
      </Card>

      {open && (
        <SocialPagePopup
          open={open}
          close={() => {
            toggleOpen(false);
          }}
          type={socialType.current}
          listPage={listPage.current}
          listPageConnected={listPageConnected}
          onRefreshClick={() => {
            if (socialType.current === 'Facebook') {
              onFacebookLogin(true);
            }
          }}
          appId={appId.current}
          appSecret={appSecret.current}
        />
      )}
    </>
  );
}
