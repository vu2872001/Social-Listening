import BasicAvatar from '../../../../../../components/shared/antd/BasicAvatar';
import StopSupportingButton from '../../../../../../components/shared/element/Button/StopSupportingButton';

export default function PostHeader({
  hotQueueData,
  pageData,
  postData,
  showStop,
}) {
  const dateSent = new Date(postData?.createdAt)?.toLocaleString();
  return (
    <div className="post-header-container flex-center">
      <div className="post-header flex-center">
        <div className="post-info flex-center">
          <BasicAvatar
            size={40}
            name={pageData?.name}
            src={pageData?.pictureUrl}
          />
          <div className="post-user-date flex-center">
            <b className="post-user">{pageData?.name}</b>
            <span className="message-date">{dateSent}</span>
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
      <div className="post-detail">
        <span className="limit-line">{postData?.message}</span>
      </div>
    </div>
  );
}
