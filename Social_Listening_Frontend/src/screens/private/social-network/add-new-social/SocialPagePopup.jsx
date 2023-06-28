import { useRef } from 'react';
import { Button, Card, Modal } from 'antd';
import { useMutation } from 'react-query';
import { notifyService } from '../../../../services/notifyService';
import {
  connectPageToSystem,
  extendFbToken,
  subscribeFacebookPage,
  useGetSocialGroups,
} from '../socialNetworkService';
import { customHistory } from '../../../../routes/CustomRouter';
import Title from '../../../../components/shared/element/Title';
import BasicAvatar from '../../../../components/shared/antd/BasicAvatar';
import ToolTipWrapper from '../../../../components/shared/antd/ToolTipWrapper';
import Hint from '../../../../components/shared/element/Hint';

export default function SocialPagePopup(props) {
  const {
    open,
    close,
    type,
    listPage = [],
    listPageConnected = [],
    onRefreshClick,
    appId,
    appSecret,
  } = props;

  const listConnected = useRef([]);
  const currentConnected = useRef(null);
  const getAllSocialConnected = useRef(
    listPage?.every((page) =>
      listPageConnected?.some(
        (pageConnected) => page.id === pageConnected
      )
    )
  );
  listConnected.current = listPageConnected;

  const { data, isFetching: socialGroupFetching } =
    useGetSocialGroups(getAllSocialConnected.current);
  getAllSocialConnected.current = false;

  const useSubscribeFbPage = useMutation(subscribeFacebookPage, {
    onSuccess: (resp) => {
      if (resp) {
        useExtendFbToken.mutate({
          appId: appId,
          appSecret: appSecret,
          accessToken: currentConnected.current?.accessToken,
        });
      }
    },
  });

  const useExtendFbToken = useMutation(extendFbToken, {
    onSuccess: (resp) => {
      if (resp) {
        currentConnected.current.accessToken = resp?.access_token;
        useConnectPageToSystem.mutate({
          socialType: type,
          name: currentConnected.current?.name,
          extendData: JSON.stringify(currentConnected.current),
        });
      }
    },
  });

  const useConnectPageToSystem = useMutation(connectPageToSystem, {
    onSuccess: (resp) => {
      if (resp) {
        currentConnected.current = null;
        listConnected.current?.push(currentConnected.current?.id);
        getAllSocialConnected.current = true;
        notifyService.showSucsessMessage({
          description: 'Connect successfully',
        });
      }
    },
  });

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={
        <div className="social-popup-footer">
          <Hint
            message={
              <div className="social-footer-hint">
                <span>
                  If you don't see your pages, please connect again by
                  clicking <a onClick={onRefreshClick}>here</a>.
                </span>
                <span>
                  We will need ADMIN permission to your pages to
                  connect.
                </span>
              </div>
            }
          />
        </div>
      }
      maskClosable={false}
      className="social-page-popup"
      destroyOnClose
    >
      <Title>Your pages</Title>
      {listPage?.map((item, index) => (
        <ToolTipWrapper
          key={index}
          tooltip={
            listConnected.current?.includes(item?.id) &&
            'This page is already connected'
          }
        // placement="left"
        >
          <Card className="social-page-container">
            <div className="flex-center social-page-wrapper">
              <div className="flex-center left-section">
                <BasicAvatar
                  size={56}
                  src={item?.pictureUrl}
                  name={item?.name}
                />
                <span className="social-page-name">{item?.name}</span>
              </div>
              {!listConnected.current?.includes(item?.id) ? (
                <Button
                  type="primary"
                  onClick={() => {
                    currentConnected.current = item;

                    useSubscribeFbPage.mutate({
                      pageId: item?.id,
                      accessToken: item?.accessToken,
                    });
                  }}
                  loading={currentConnected.current?.id === item?.id &&
                    (useSubscribeFbPage.isLoading ||
                      useExtendFbToken.isLoading ||
                      useConnectPageToSystem.isLoading ||
                      socialGroupFetching)
                  }
                  disabled={currentConnected.current?.id !== item?.id && (useSubscribeFbPage.isLoading ||
                    useExtendFbToken.isLoading ||
                    useConnectPageToSystem.isLoading ||
                    socialGroupFetching)}
                >
                  Connect
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={() => {
                    const mappedPage = data?.filter((x) => {
                      if (x?.SocialNetwork?.extendData) {
                        let tempExtendData = JSON.parse(
                          x.SocialNetwork.extendData
                        );
                        return tempExtendData?.id === item?.id;
                      }
                    })[0];

                    let pageData = null;
                    if (mappedPage?.SocialNetwork?.extendData) {
                      pageData = JSON.parse(
                        mappedPage?.SocialNetwork?.extendData
                      );
                    }

                    customHistory.push(
                      `/social-network/${mappedPage?.name}`,
                      {
                        socialId: mappedPage?.id,
                        socialPage: pageData,
                      }
                    );
                  }}
                >
                  Manage page
                </Button>
              )}
            </div>
          </Card>
        </ToolTipWrapper>
      ))}
    </Modal>
  );
}
