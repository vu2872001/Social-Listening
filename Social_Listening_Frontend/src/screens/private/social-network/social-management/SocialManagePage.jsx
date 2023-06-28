import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs } from 'antd';
import {
  FormOutlined,
  CommentOutlined,
  SettingOutlined,
  RobotOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import useEffectOnce from '../../../../components/hooks/useEffectOnce';
import ElementWithPermission from '../../../../components/shared/element/ElementWithPermission';
import MessageManagePage from './message-management/MessageManagePage';
import SettingManagePage from './setting-mangement/SettingManagePage';
import BotFlowManagePage from './bot-flow-management/BotFlowManagePage';
import BotManagePage from './bot-management/BotManagePage';
import MemberManagePage from './member-management/MemberManagePage';
import SummaryManagePage from './summary-management/SummaryManagePage';
import '../socialNetwork.scss';

export default function SocialMangePage() {
  const location = useLocation();

  function formatTab(index, icon, label, permission) {
    const tabFormatted = (
      <div id={index}>
        {icon}
        <span>{label}</span>
      </div>
    );

    return permission ? (
      <ElementWithPermission permission={permission}>
        {tabFormatted}
      </ElementWithPermission>
    ) : (
      tabFormatted
    );
  }

  const items = [
    {
      key: 1,
      label: formatTab(1, <ProjectOutlined rotate={180} />, 'Report'),
      children: (
        <SummaryManagePage
          pageId={location.state?.socialId}
          socialPage={location.state?.socialPage}
        />
      ),
    },
    {
      key: 2,
      label: formatTab(
        2,
        <CommentOutlined />,
        'Comment',
        'table-comment'
      ),
      children: (
        <MessageManagePage
          pageId={location.state?.socialId}
          socialPage={location.state?.socialPage}
          type="Comment"
        />
      ),
    },
    {
      key: 3,
      label: formatTab(3, <FormOutlined />, 'Chat', 'table-message'),
      children: (
        <MessageManagePage
          pageId={location.state?.socialId}
          socialPage={location.state?.socialPage}
          type="Message"
        />
      ),
    },
    {
      key: 4,
      label: formatTab(
        4,
        <PlayCircleOutlined />,
        'Design Bot Flow',
        'table-workflow'
      ),
      children: (
        <BotFlowManagePage
          pageId={location.state?.socialId}
          socialPage={location.state?.socialPage}
        />
      ),
    },
    {
      key: 5,
      label: formatTab(
        5,
        <RobotOutlined />,
        'Bots',
        'table-workflow'
      ),
      children: (
        <BotManagePage
          pageId={location.state?.socialId}
          socialPage={location.state?.socialPage}
        />
      ),
    },
    {
      key: 6,
      label: formatTab(
        6,
        <TeamOutlined />,
        'Member',
        'table-user-in-tab'
      ),
      children: (
        <MemberManagePage
          pageId={location.state?.socialId}
          socialPage={location.state?.socialPage}
        />
      ),
    },
    // {
    //   key: 9,
    //   label: formatTab(
    //     <SettingOutlined />,
    //     'Setting',
    //     'get-social-setting'
    //   ),
    //   children: (
    //     <SettingManagePage pageId={location.state?.socialId} />
    //   ),
    // },
  ];

  const [itemList, setItemList] = useState(items);
  useEffectOnce(() => {
    // delay to wait for the html parse in DOM
    const timeout = setTimeout(() => {
      setItemList(
        items.filter(
          (item) => document.getElementById(item.key) != null
        )
      );
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  });

  return (
    <Tabs
      // centered
      destroyInactiveTabPane
      className="social-tab"
      defaultActiveKey={location.state?.tab ?? 1}
      items={itemList}
      key={location.state?.socialId}
    />
  );
}
