import { Badge } from 'antd';
import BasicAvatar from '../../../../../../components/shared/antd/BasicAvatar';
import StopSupportingButton from '../../../../../../components/shared/element/Button/StopSupportingButton';

export default function ChatHeader({
  userData,
  hotQueueData,
  showStop,
}) {
  return (
    <div className="chat-section">
      <div className="chat-header flex-center">
        <div className="chat-info flex-center">
          <div className="chat-avt-holder">
            {userData?.isActive && (
              <Badge status="success" className="chat-avt-status" />
            )}
            <BasicAvatar
              size={40}
              src={userData?.avatarUrl}
              name={userData?.fullName}
            />
          </div>
          <div className="chat-user-date flex-center">
            <b className="chat-user">{userData?.fullName}</b>
          </div>
        </div>
        {showStop && (
          <StopSupportingButton
            onClick={() => {
              window.parent.postMessage(hotQueueData, '*');
            }}
          />
        )}
      </div>
    </div>
  );
}
