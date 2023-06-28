import { useState, useRef } from 'react';
import { Badge, Layout, Menu, Tabs, Button } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
  BellOutlined,
  MessageOutlined,
  CloseOutlined,
  ReloadOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { Getter } from '../../utils/dataGetter';
import { Converter } from '../../utils/dataConverter';
import { apiService } from '../../services/apiService';
import { notifyService } from '../../services/notifyService';
import { menuSidebar } from '../../constants/menu/sidebar';
import { menuUserHeader } from '../../constants/menu/header';
import { useSocket } from '../../components/contexts/socket/SocketProvider';
import { useGetSocialGroups } from '../../screens/private/social-network/socialNetworkService';
import useEffectOnce from '../../components/hooks/useEffectOnce';
import useUpdateEffect from '../../components/hooks/useUpdateEffect';
import useDeepCompareEffect from '../../components/hooks/useDeepCompareEffect';
import useToggle from '../../components/hooks/useToggle';
import Title from '../../components/shared/element/Title';
import ToolTipWrapper from '../../components/shared/antd/ToolTipWrapper';
import ClassicDropdown from '../../components/shared/antd/Dropdown/Classic';
import BasicAvatar from '../../components/shared/antd/BasicAvatar';
import PieChartResult from '../../components/shared/antd/Chart/PieChartResult';
import IconButton from '../../components/shared/element/Button/IconButton';
import AddEditUser from '../../screens/private/accounts/user/AddEditUser';
import bigLogo from '../../assets/icons/SocialListeningLogo.svg';
import smallLogo from '../../assets/icons/SocialListeningLogoOnly.svg';
import '../route.scss';

const { Header, Content, Sider } = Layout;
export default function PrivateLayout(props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useToggle(false);
  const { socket, connect, disconnect } = useSocket();
  const userData = queryClient.getQueryData('userData');

  // #region menu sidebar setup
  const path = Getter.getPathName(); // also the key of the menu sidebar
  const listPath = path?.split('/');
  const currentPath = listPath[listPath?.length - 1];

  const [availableMenu, setAvailableMenu] = useState([
    ...menuSidebar,
  ]);
  const openKey = Getter.getOpenKeyForMenu(
    availableMenu,
    Converter.convertStringToTitleCase(currentPath)
  );

  const canGetSocialGroups = useRef(true);
  const { data: socialGroups } = useGetSocialGroups(
    canGetSocialGroups.current
  );
  canGetSocialGroups.current = false;

  useDeepCompareEffect(() => {
    if (socialGroups?.length > 0) {
      setAvailableMenu([
        ...availableMenu?.map((item) => {
          if (item.key === 'social-network') {
            item.children = [
              item.children[0],
              ...socialGroups?.map((sg) => {
                return {
                  key: `social-network/${sg?.name}`,
                  label: sg?.name,
                  id: sg?.id,
                };
              }),
            ];
          }
          return item;
        }),
      ]);
    } else {
      setAvailableMenu(
        filterMenuSidebar(userData.permissions, userData.role)?.map(
          (item) => {
            if (item.key === 'social-network') {
              if (item.children) {
                item.children = [item.children[0]];
              }
            }
            return item;
          }
        )
      );
    }
  }, [socialGroups, path]);

  function filterMenuSidebar(permission, role) {
    const filtered = menuSidebar.map((item) => {
      if (item.children && item.children.length > 0) {
        const filteredChildren = item.children.filter(
          (child) =>
            (!child.permission ||
              permission.includes(child.permission) ||
              (child.permission?.includes(',') &&
                child.permission
                  .split(', ')
                  ?.some((ch) => permission.includes(ch)))) &&
            (!child.role || child.role?.includes(role))
        );
        return { ...item, children: filteredChildren };
      } else {
        return item;
      }
    });

    return filtered
      ?.filter(
        (item) =>
          (!item.permission ||
            permission.includes(item.permission)) &&
          (!item.role || item.role?.includes(role))
      )
      ?.filter((item) => item?.children?.length !== 0);
  }

  function handleItemSelect(e) {
    // #region handle social-network item
    let correctSocial = null;
    // get the social group data
    if (e.keyPath[0].includes('social-network')) {
      availableMenu.map((item) => {
        if (item.children?.length > 0) {
          item.children.map((childItem) => {
            if (childItem?.id && childItem?.key === e.key) {
              correctSocial = socialGroups.filter(
                (social) => social?.id === childItem?.id
              )[0];
              return;
            }
          });
        }
      });
    }

    // format the social data
    let forwardData = null;
    if (correctSocial) {
      let pageData = null;
      if (correctSocial?.SocialNetwork?.extendData) {
        pageData = JSON.parse(correctSocial.SocialNetwork.extendData);
      }

      forwardData = {
        socialId: correctSocial?.id,
        socialPage: pageData,
      };
    }
    // #endregion

    navigate(`/${Converter.toLowerCaseFirstLetter(e.key)}`, {
      state: forwardData,
    });
  }
  // #endregion

  // #region chart notification
  const [openChart, setOpenChart] = useToggle(false);
  const title = useRef(null);
  const resultChart = useRef(null);
  function openChartResult(notificationId) {
    setOpenChart(true);
    socket.emit('clickNotification', notificationId);
  }

  useUpdateEffect(() => {
    socket.on('sendNotification', (payload) => {
      if (payload) {
        // push receive back to server
        socket.emit('receiveNotification', payload.id?.toString());

        // get data from socket
        title.current = payload.title;
        if (payload.extendData) {
          resultChart.current = JSON.parse(payload.extendData);
        }

        // notify success for the import
        notifyService.showSucsessMessage({
          title: payload.title,
          description: (
            <div
              className="pointer"
              onClick={(e) => {
                e.preventDefault();
                openChartResult(payload.id?.toString());
              }}
            >
              {payload.body}
            </div>
          ),
          duration: 0,
        });

        // open the chart
        openChartResult(payload.id?.toString());

        // refresh the user table
        if (path === 'account/user') {
          document.getElementById('refresh-table')?.click();
        }
      }
    });
  }, [socket]);
  // #endregion

  // #region hotqueue
  const hotQueueIframe = useRef(null);
  const notifyAgentPayload = useRef(null);
  const [hotQueue, setHotQueue] = useState(false);
  const [realoadHotqueue, setRealoadHotqueue] = useState(false);
  const [startHotQueue, setStartHotQueue] = useState(null);
  const [stopHotQueue, setStopHotQueue] = useState(null);

  const sendDataToIframe = () => {
    if (hotQueueIframe.current) {
      hotQueueIframe.current?.contentWindow?.postMessage(
        notifyAgentPayload.current,
        '*'
      );
    }
  };

  useUpdateEffect(() => {
    if (socket) {
      socket.on('notifyAgent', (payload) => {
        if (payload && socialGroups?.length > 0) {
          const socialPage = socialGroups.find(
            (item) => item.id === payload.tabId
          );

          let pageData = null;
          if (socialPage?.SocialNetwork?.extendData) {
            pageData = JSON.parse(
              socialPage?.SocialNetwork?.extendData
            );
          }

          notifyAgentPayload.current = {
            ...payload,
            socialPage: pageData,
          };
          sendDataToIframe();
          setHotQueue(true);
        }
      });
    }
  }, [socket, socialGroups]);

  useUpdateEffect(() => {
    if (socket) {
      if (startHotQueue) {
        socket.emit('startHotQueue', startHotQueue);
        setStartHotQueue(null);
      }

      if (stopHotQueue) {
        socket.emit('stopHotQueue', stopHotQueue);
        setStopHotQueue(null);
      }
    }
  }, [socket, startHotQueue, stopHotQueue]);

  useUpdateEffect(() => {
    if (socket) {
      socket.on('messageSupport', (payload) => {
        if (payload) {
          hotQueueIframe.current?.contentWindow?.postMessage(
            { messageSupport: payload },
            '*'
          );
        }
      });

      socket.on('messageCome', (payload) => {
        if (payload) {
          hotQueueIframe.current?.contentWindow?.postMessage(
            { messageCome: payload },
            '*'
          );
        }
      });

      socket.on('commentCome', (payload) => {
        if (payload) {
          hotQueueIframe.current?.contentWindow?.postMessage(
            { messageCome: payload },
            '*'
          );
        }
      });
    }
  }, [socket]);

  const receiveData = (event) => {
    if (event.data?.rendered) {
      sendDataToIframe();
    } else if (event.data?.type === 'isSupporting') {
      setStartHotQueue(event.data);
    } else if (event.data?.type === 'stopSupporting') {
      setStopHotQueue(event.data);
      notifyAgentPayload.current = null;
      hotQueueIframe.current?.contentWindow?.postMessage(
        { stopSupporting: true },
        '*'
      );
    } else if (event.data?.closed) {
      setHotQueue(false);
    }
  };

  useEffectOnce(
    () => {
      window.addEventListener('message', receiveData);
    },
    () => {
      window.removeEventListener('message', receiveData);
    }
  );
  // #endregion

  const [openProfile, setOpenProfile] = useToggle(false);
  async function handleMenuHeader(e) {
    // logout option
    if (menuUserHeader[e.key] === 'Logout') {
      navigate('/login');
      notifyService.showSucsessMessage({
        description: 'Logout successfully',
      });

      try {
        await apiService.post('/auth/log-out').then((resp) => {
          if (resp?.result) {
            disconnect();
          }
        });
      } catch (ex) {
        notifyService.showErrorMessage({
          description: ex.message,
        });
      }

      localStorage.clear();
    }
    // profile option
    else if (menuUserHeader[e.key] === 'Profile') {
      setOpenProfile(true);
    }
  }

  useEffectOnce(
    () => {
      if (!currentPath) {
        navigate('/home');
      }

      // connect SOCKET
      connect();

      // filter the menu sidebar
      setAvailableMenu(
        filterMenuSidebar(userData.permissions, userData.role)
      );
    },
    () => {
      // disconnect socket when destroy
      disconnect();
    }
  );

  return (
    <Layout className="private-layout">
      <Sider
        collapsible
        trigger={null}
        width={240}
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        {/* icon */}
        <div className="flex-center">
          <img
            style={{
              margin: '2rem',
            }}
            src={collapsed ? smallLogo : bigLogo}
          />
        </div>
        <Menu
          onSelect={handleItemSelect}
          theme="dark"
          mode="inline"
          items={availableMenu}
          selectedKeys={[path?.replaceAll('%20', ' ')]}
          defaultOpenKeys={[openKey ? openKey : 'social-network']}
        />
      </Sider>

      <Layout>
        <Header className="private-header flex-center">
          <ToolTipWrapper
            title={!collapsed ? 'Collapse menu' : 'Open menu'}
            placement="right"
            className="colapse-btn"
            onClick={() => setCollapsed()}
          >
            {collapsed ? (
              <MenuUnfoldOutlined />
            ) : (
              <MenuFoldOutlined />
            )}
          </ToolTipWrapper>

          <div className="header-right-wrapper flex-center">
            {/* <ClassicDropdown
              clickTrigger
              list={notiList?.data?.map((item) => item.title)}
              dropdownRender={(menu) => {
                return (
                  <div className="notification-wrapper">
                    <Title>Notifications</Title>
                    <Tabs
                      // centered
                      items={[
                        {
                          key: 1,
                          label: `All`,
                          children: menu,
                        },
                        {
                          key: 2,
                          label: `Unread`,
                          children: menu,
                        },
                      ]}
                    />
                  </div>
                );
              }}
            >
              <ToolTipWrapper tooltip="Notifications">
                <Badge
                  color="var(--primary-color)"
                  count={notiList?.page?.totalElement}
                  overflowCount={99}
                >
                  <BellOutlined />
                </Badge>
              </ToolTipWrapper>
            </ClassicDropdown> */}

            <ClassicDropdown
              list={menuUserHeader}
              handleItemClick={handleMenuHeader}
            >
              <div className="header-menu flex-center">
                <BasicAvatar name={userData?.userName} />
                <span>{userData?.userName}</span>
                <DownOutlined />
              </div>
            </ClassicDropdown>
          </div>
        </Header>

        <Content className="private-content">
          <Title>
            {listPath?.join(' / ')?.replaceAll('%20', ' ')}
          </Title>

          <div className="body">{props.children}</div>
        </Content>
      </Layout>

      {openChart && (
        <PieChartResult
          open={openChart}
          toggleOpen={setOpenChart}
          title={title.current}
          result={{
            total: resultChart.current?.totalImport,
            success: resultChart.current?.importSuccess,
            fail: resultChart.current?.importFailure,
          }}
        />
      )}

      {openProfile && (
        <AddEditUser
          open={openProfile}
          onClose={() => {
            setOpenProfile(false);
          }}
          selectedData={userData}
          action="Edit"
        />
      )}

      {userData?.role !== 'ADMIN' && (
        <div className="user-util">
          <Button
            shape="circle"
            type="primary"
            onClick={() => setHotQueue(!hotQueue)}
          >
            <MessageOutlined />
          </Button>
        </div>
      )}

      {hotQueue && (
        <div className="hotqueue-iframe-container">
          <div className="hotqueue-toolbar">
            {/* <ToolTipWrapper tooltip="Full screen mode">
              <IconButton
                icon={<FullscreenOutlined />}
                onClick={() => {
                  window.open(`/hotqueue`, '_blank');
                }}
              />
            </ToolTipWrapper> */}

            <ToolTipWrapper tooltip="Reload the hotqueue">
              <IconButton
                icon={<ReloadOutlined />}
                onClick={() => {
                  setRealoadHotqueue((prev) => !prev);
                }}
              />
            </ToolTipWrapper>

            <ToolTipWrapper tooltip="Close hotqueue popup">
              <IconButton
                id="close-hotqueue"
                icon={<CloseOutlined />}
                onClick={() => setHotQueue(false)}
              />
            </ToolTipWrapper>
          </div>
          <iframe
            ref={hotQueueIframe}
            className="hotqueue-iframe full-width"
            src="/hotqueue"
            scrolling="no"
            key={realoadHotqueue}
          />
        </div>
      )}
    </Layout>
  );
}
