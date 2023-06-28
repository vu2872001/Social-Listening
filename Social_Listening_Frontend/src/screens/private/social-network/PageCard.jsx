import { useState } from 'react';
import {
  PoweroffOutlined,
  CommentOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { Card, Modal } from 'antd';
import { useMutation } from 'react-query';
import { customHistory } from '../../../routes/CustomRouter';
import {
  disconnectFacebook,
  removeSocialPage,
} from './socialNetworkService';
import { notifyService } from '../../../services/notifyService';
import useEffectOnce from '../../../components/hooks/useEffectOnce';
import emptyImage from '../../../assets/images/image_not_available.png';
import BasicAvatar from '../../../components/shared/antd/BasicAvatar';
import ToolTipWrapper from '../../../components/shared/antd/ToolTipWrapper';
import ElementWithPermission from '../../../components/shared/element/ElementWithPermission';
import Hint from '../../../components/shared/element/Hint';

const { Meta } = Card;

export default function PageCard(props) {
  const { socialNetworkData, type, updateSocialGroups } = props;

  let pageData = null;
  if (socialNetworkData?.SocialNetwork?.extendData) {
    pageData = JSON.parse(
      socialNetworkData?.SocialNetwork?.extendData
    );
  }

  let forwardData = {
    socialId: socialNetworkData?.id,
    socialPage: pageData,
  };

  const [openConfirmRemove, setOpenConfirmRemove] = useState(false);
  const useRemovePage = useMutation(removeSocialPage, {
    onSuccess: (resp) => {
      if (resp) {
        if (updateSocialGroups) {
          updateSocialGroups();
        }

        setOpenConfirmRemove(false);
        notifyService.showSucsessMessage({
          description: 'Disconnect page successfully',
        });
      }
    },
  });

  const useDisconnect = useMutation(disconnectFacebook, {
    onSuccess: (resp) => {
      useRemovePage.mutate(socialNetworkData.id);
    },
  });

  const [pageAction, setPageAction] = useState([
    <ElementWithPermission permission="table-comment">
      <ToolTipWrapper tooltip="Comments">
        <CommentOutlined
          id="table-comment"
          onClick={(e) => {
            e.stopPropagation();
            customHistory.push(
              `/social-network/${socialNetworkData?.name}`,
              {
                ...forwardData,
                tab: 2,
              }
            );
          }}
        />
      </ToolTipWrapper>
    </ElementWithPermission>,
    <ElementWithPermission permission="table-message">
      <ToolTipWrapper tooltip="Chats">
        <FormOutlined
          id="table-message"
          onClick={(e) => {
            e.stopPropagation();
            customHistory.push(
              `/social-network/${socialNetworkData?.name}`,
              {
                ...forwardData,
                tab: 3,
              }
            );
          }}
        />
      </ToolTipWrapper>
    </ElementWithPermission>,
    <ElementWithPermission permission="disconnect-social-network">
      <ToolTipWrapper tooltip="Disconnect this page">
        <PoweroffOutlined
          id="disconnect-social-network"
          onClick={(e) => {
            e.stopPropagation();
            setOpenConfirmRemove(true);
          }}
        />
      </ToolTipWrapper>
    </ElementWithPermission>,
  ]);

  useEffectOnce(() => {
    // delay to wait for the html parse in DOM
    const timeout = setTimeout(() => {
      setPageAction(
        pageAction.filter(
          (item) =>
            document.getElementById(item.props?.permission) != null
        )
      );
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  });

  return (
    <>
      <Card
        onClick={() => {
          customHistory.push(
            `/social-network/${socialNetworkData?.name}`,
            forwardData
          );
        }}
        className="page-card"
        cover={
          <>
            {pageData?.wallpaperUrl ? (
              <img
                className="wall-container"
                alt="wallpaper"
                src={pageData?.wallpaperUrl}
                onError={(e) => {
                  e.currentTarget.src = emptyImage;
                  e.currentTarget.className += ' empty-wall';
                }}
              />
            ) : (
              <img
                className="wall-container empty-wall"
                alt="wallpaper"
                src={emptyImage}
              />
            )}
          </>
        }
        actions={pageAction}
      >
        <Meta
          avatar={
            <BasicAvatar
              size={44}
              src={pageData?.pictureUrl}
              name={pageData?.name}
            />
          }
          title={pageData?.name}
          description={`Social type: ${type}`}
        />
      </Card>

      {openConfirmRemove && (
        <Modal
          destroyOnClose
          centered
          open={openConfirmRemove}
          title={
            <b style={{ fontSize: '2rem' }}>
              Are you sure you want to disconnect{' '}
              {socialNetworkData?.name}?
            </b>
          }
          maskClosable={false}
          onCancel={() => {
            setOpenConfirmRemove(false);
          }}
          onOk={() => {
            useDisconnect.mutate({
              appId: 594535438672562,
              pageId: pageData?.id,
              accessToken: pageData?.accessToken,
            });
          }}
          okButtonProps={{
            loading:
              useDisconnect.isLoading || useRemovePage.isLoading,
          }}
          cancelButtonProps={{
            loading:
              useDisconnect.isLoading || useRemovePage.isLoading,
          }}
        >
          <Hint
            message={`All your datas from the page ${socialNetworkData?.name} will be deleted and can't be recovered`}
            type="info"
          />
        </Modal>
      )}
    </>
  );
}
