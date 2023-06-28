import { useState } from 'react';
import { Switch, Tag, Input } from 'antd';
import { CloseOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation } from 'react-query';
import { notifyService } from '../../../../../services/notifyService';
import {
  replyFbMessage,
  saveMessageToSystem,
  useGetMessageDetail,
} from '../../socialNetworkService';
import useToggle from '../../../../../components/hooks/useToggle';
import BasicAvatar from '../../../../../components/shared/antd/BasicAvatar';
import ToolTipWrapper from '../../../../../components/shared/antd/ToolTipWrapper';
import DateTimePicker from '../../../../../components/shared/antd/DateTimePicker/DateTimePicker';
import DateRangePicker from '../../../../../components/shared/antd/DateTimePicker/DateRangePicker';
import ClassicDropdown from '../../../../../components/shared/antd/Dropdown/Classic';
import IconMoreButton from '../../../../../components/shared/element/Button/IconMoreButton';
import IconButton from '../../../../../components/shared/element/Button/IconButton';
import ApplyFilterButton from '../../../../../components/shared/element/Button/ApplyFilterButton';

export default function CommentDetail({ socialPage }) {
  const [rangeFilter, setRangeFilter] = useToggle(false);
  const [messageReplied, setMessageReplied] = useState(null); //the comments that user currently reply
  const [messageList, setMessageList] = useState([]);
  const [comment, setComment] = useState(null);

  const useReplyFbMessage = useMutation(replyFbMessage, {
    onSuccess: (resp) => {
      if (resp) {
        useSaveMessageToSystem.mutate({
          networkId: socialPage?.id,
          message: comment,
          sender: socialPage?.name,
          createdAt: new Date(),
          // type: `Agent#${data?.id}`,
          // parent: messageDetail?.post,
          // postId: messageDetail?.post?.postId,
          commentId: messageReplied?.messageId,
          parentId: messageReplied?.messageId,
        });
      }
    },
  });

  const useSaveMessageToSystem = useMutation(saveMessageToSystem, {
    onSuccess: (resp) => {
      if (resp) {
        setMessageList((old) => {
          return [
            ...old,
            {
              createdAt: new Date(),
              // type: `Agent#${data?.id}`,
              message: comment,
            },
          ];
        });

        notifyService.showSucsessMessage({
          description: 'Reply successfully',
        });
        setComment('');
      }
    },
  });

  // const { data, isFetching } = useGetMessageDetail(
  //   msgSelected?.id,
  //   getDetail.current
  // );

  return (
    <div className="comment-detail">
      <div className="filter-section flex-center">
        <div className="filter-item flex-center">
          <ToolTipWrapper tooltip="Check to filter date range">
            <Switch
              onChange={() => {
                setRangeFilter(!rangeFilter);
              }}
            />
          </ToolTipWrapper>
          {rangeFilter ? <DateRangePicker /> : <DateTimePicker />}
        </div>
        <ApplyFilterButton />
      </div>
      <div className="comment-container message-section">
        {messageList?.map((item, index) => {
          const dateSent = new Date(
            item?.createdAt
          )?.toLocaleString();

          let userReply = item?.type; // Bot, Comment, Agent#UserId

          return (
            <div
              key={item?.id ?? index}
              className={`${
                item?.type !== 'Comment' ? 'page-respond ' : ''
              }message-item`}
            >
              <BasicAvatar
                src={
                  item?.type !== 'Comment' && socialPage?.pictureUrl
                }
              />
              <Tag
                color={
                  item?.type !== 'Comment' && 'var(--primary-color)'
                }
                className="message-chip-container"
              >
                <div className="message-chip-user flex-center">
                  <b>
                    {item?.type !== 'Comment'
                      ? `${socialPage?.name} (${userReply})`
                      : 'User'}
                  </b>
                  <span className="message-date">{dateSent}</span>
                </div>
                <span className="message-chip limit-line">
                  {item?.message}
                </span>
              </Tag>
              {/* {item?.type === 'Comment' && (
                <ClassicDropdown
                  clickTrigger
                  list={listAction}
                  handleItemClick={(e) => {
                    setMessageReplied(item);
                  }}
                >
                  <IconMoreButton />
                </ClassicDropdown>
              )} */}
            </div>
          );
        })}
      </div>
      <div className="respond-section">
        {/* {showRecommend && (
          <div className="recommend-response-container">
            {Array(4)
              .fill()
              .map((_, index) => (
                <Tag key={index} className="recommend-response-chip">
                  <span className="recommend-response limit-line">
                    velit aliquet sagittis id consectetur purus ut
                    faucibus pulvinar elementum integer enim neque
                    volutpat ac tincidunt vitae semper quis lectus
                    nulla at volutpat diam ut venenatis tellus in
                    metus vulputate eu scelerisque felis imperdiet
                  </span>
                </Tag>
              ))}
            <IconButton
              className="recommend-close-icon"
              tooltip="Click to close recommend"
              icon={<CloseOutlined />}
              onClick={() => {
                toggleShowRecommend(false);
              }}
            />
          </div>
        )} */}
        {messageReplied && (
          <div className="reply-placeholder flex-center">
            <div>
              <b>Reply to User</b>
              <div className="reply-message limit-line">
                {messageReplied?.message}
              </div>
            </div>
            <IconButton
              tooltip="Click to cancel"
              className="reply-close-icon"
              icon={<CloseOutlined />}
              onClick={() => {
                setMessageReplied(null);
              }}
            />
          </div>
        )}
        <div className="respose-input-container flex-center">
          <Input.TextArea
            id="respond-input"
            allowClear
            autoSize={{ minRows: 3, maxRows: 3 }}
            value={comment}
            onChange={(e) => {
              setComment(e.currentTarget.value);
            }}
            // onFocus={() => {
            //   toggleShowRecommend(true);
            // }}
          />
          <IconButton
            icon={<SendOutlined className="respond-icon" />}
            type="link"
            onClick={() => {
              useReplyFbMessage.mutate({
                cmtId: messageReplied?.messageId,
                accessToken: socialPage?.accessToken,
                message: comment,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
