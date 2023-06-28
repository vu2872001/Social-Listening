import { useRef, useState } from 'react';
import { Tag, Input } from 'antd';
import { SendOutlined, CloseOutlined } from '@ant-design/icons';
import { useMutation } from 'react-query';
import { useGetDecodedToken } from '../../../../../../routes/private/privateService';
import { useGetHotqueueInfo } from '../../../../empty-layout/hotQueueService';
import {
  replyFbChat,
  replyFbMessage,
  saveCommentToSystem,
  saveConversationMessage,
} from '../../../socialNetworkService';
import { getUserNameById } from '../../../../accounts/accountService';
import { notifyService } from '../../../../../../services/notifyService';
import useToggle from '../../../../../../components/hooks/useToggle';
import useUpdateEffect from '../../../../../../components/hooks/useUpdateEffect';
import useEffectOnce from '../../../../../../components/hooks/useEffectOnce';
import BasicAvatar from '../../../../../../components/shared/antd/BasicAvatar';
import ClassicDropdown from '../../../../../../components/shared/antd/Dropdown/Classic';
import LoadingWrapper from '../../../../../../components/shared/antd/LoadingWrapper';
import IconButton from '../../../../../../components/shared/element/Button/IconButton';
import IconMoreButton from '../../../../../../components/shared/element/Button/IconMoreButton';
import StartSupportingButton from '../../../../../../components/shared/element/Button/StartSupportingButton';
import PostHeader from './PostHeader';
import ChatHeader from './ChatHeader';

const listAction = ['Reply'];

export default function MessageTypeContainer(props) {
  const {
    pageId,
    messageSelected,
    messageDetail,
    type,
    socialPage,
    isHotQueue,
  } = props;

  const messageContainer = useRef(null);
  const [reply, setReply] = useState(null);
  const [messageReplied, setMessageReplied] = useState(null);
  const [showRecommend, toggleShowRecommend] = useToggle(false);
  const [messageList, setMessageList] = useState(
    type === 'Message' ? messageDetail : messageDetail?.message
  );
  const agentList = useRef([]);
  const { data } = useGetDecodedToken();

  const useGetUserNameById = useMutation(getUserNameById, {
    onSuccess: (resp) => {
      if (resp) {
        agentList.current = [
          ...agentList.current,
          { id: resp.id, name: resp.name },
        ];
      }
    },
  });
  const getUserName = (list) => {
    let agentQueue = [];

    list?.forEach((msg) => {
      let agentId = null;
      if (typeof msg === 'object') {
        if (msg?.type?.includes('Agent')) {
          agentId = msg.type.substring(6);
        }
      } else if (typeof msg === 'string') {
        if (msg?.includes('Agent')) {
          agentId = msg.substring(6);
        }
      }

      if (
        agentId &&
        !agentList.current?.filter((agent) => agent?.id === agentId)
          ?.length &&
        !agentQueue?.includes(agentId)
      ) {
        agentQueue.push(agentId);
        useGetUserNameById.mutate(agentId);
      }
    });
  };

  useUpdateEffect(() => {
    if (type !== 'Message') {
      setMessageReplied(null);
      document.getElementById('respond-input')?.focus();

      if (messageDetail?.message?.length > 0) {
        if (isHotQueue) {
          startHotQueueInfo.current = true;
        }
        getUserName(messageDetail.message);
        setMessageList(messageDetail.message);
      }
    } else {
      if (messageDetail?.length > 0) {
        if (isHotQueue) {
          startHotQueueInfo.current = true;
        }
        getUserName(messageDetail);
        setMessageList(messageDetail);
      }
    }
  }, [messageDetail]);

  useEffectOnce(() => {
    if (isHotQueue && messageContainer.current) {
      const timeout = setTimeout(() => {
        messageContainer.current.scrollTop =
          messageContainer.current.scrollHeight;
      }, 50);

      if (type !== 'Message') {
        getUserName(messageDetail.message);
      } else {
        // getUserName(messageDetail);
      }

      return () => {
        clearTimeout(timeout);
      };
    }
  });

  useUpdateEffect(() => {
    if (messageContainer.current) {
      messageContainer.current.scrollTop =
        messageContainer.current.scrollHeight;
    }
  }, [messageDetail, messageList, messageReplied]);

  const cmtId =
    messageReplied?.messageId ??
    messageList?.filter((item) => item?.type === 'Comment')[0]
      ?.messageId;
  const useReplyFbMessage = useMutation(replyFbMessage, {
    onSuccess: (resp) => {
      if (resp) {
        useSaveCommentToSystem.mutate({
          networkId: socialPage?.id,
          message: reply,
          sender: {
            id: socialPage?.id,
            name: socialPage?.name,
            avatar: socialPage?.pictureUrl,
          },
          createdAt: new Date(),
          type: `Agent#${data?.id}`,
          parent: messageDetail?.post,
          postId: messageDetail?.post?.postId,
          commentId: resp?.id,
          parentId: cmtId,
        });
      }
    },
    onError: (resp) => {
      if (resp) {
        notifyService.showErrorMessage('');
      }
    },
  });
  const useSaveCommentToSystem = useMutation(saveCommentToSystem, {
    onSuccess: (resp) => {
      if (resp) {
        setReply(null);
        setMessageReplied(null);

        getUserName([
          ...messageList,
          {
            createdAt: new Date(),
            type: `Agent#${data?.id}`,
            message: reply,
          },
        ]);

        if (isHotQueue) {
          setMessageList((old) => {
            return [
              ...old,
              {
                createdAt: new Date(),
                type: `Agent#${data?.id}`,
                message: reply,
              },
            ];
          });
        }

        notifyService.showSucsessMessage({
          description: 'Reply successfully',
        });
      }
    },
  });

  const useReplyFbChat = useMutation(replyFbChat, {
    onSuccess: (resp) => {
      if (resp) {
        useSaveChatToSystem.mutate({
          message: reply,
          recipient: {
            id: messageReplied?.sender?.senderId,
            name: messageReplied?.sender?.fullName,
            avatar: messageReplied?.sender?.avatarUrl,
          },
          sender: {
            id: socialPage?.id,
            name: socialPage?.name,
            avatar: socialPage?.pictureUrl,
          },
          messageId: resp.message_id,
          networkId: socialPage?.id,
          createdAt: new Date(),
          // repliedMessageId: resp.message_id,
        });
      }
    },
    onError: (resp) => {
      if (resp) {
        notifyService.showErrorMessage('');
      }
    },
  });
  const useSaveChatToSystem = useMutation(saveConversationMessage, {
    onSuccess: (resp) => {
      if (resp) {
        setReply(null);
        setMessageReplied(null);

        if (isHotQueue) {
          setMessageList((old) => [
            ...old,
            {
              createdAt: resp.createdAt,
              message: resp?.message,
              sender: {
                avatarUrl: socialPage?.pictureUrl,
                fullName: socialPage?.name,
                senderId: socialPage?.id,
                id: resp?.senderId,
              },
            },
          ]);
        }

        notifyService.showSucsessMessage({
          description: 'Reply successfully',
        });
      }
    },
  });

  const handleSubmitMessage = () => {
    if (reply) {
      if (type !== 'Message') {
        useReplyFbMessage.mutate({
          cmtId: cmtId,
          accessToken: socialPage?.accessToken,
          message: reply,
        });
      } else {
        useReplyFbChat.mutate({
          accessToken: socialPage?.accessToken,
          body: {
            recipient: {
              id: messageSelected?.sender?.senderId,
            },
            message: { text: reply },
          },
        });
      }
    }
  };

  const [isStartHotqueue, setIsStartHotqueue] = useState(false);
  const startHotQueueInfo = useRef(true);
  const { data: hotQueueInfo, isFetching: hotqueueInfoFetching } =
    useGetHotqueueInfo(
      {
        tabId: pageId,
        senderId: messageList?.find(
          (item) => item?.type === 'Comment'
        )?.sender?.id,
        messageType: type,
      },
      isHotQueue &&
        startHotQueueInfo.current &&
        messageList?.length > 0
    );
  if (messageList?.length > 0) {
    startHotQueueInfo.current = false;
  }

  let hotQueueData = null;
  if (isHotQueue) {
    hotQueueData = {
      type: 'stopSupporting',
      tabId: pageId,
      userId: data?.id,
      senderId: messageList?.find((item) => item?.type === 'Comment')
        ?.sender?.id,
    };
  }

  return (
    <LoadingWrapper
      className="message-type-loader"
      loading={hotqueueInfoFetching}
    >
      {type === 'Comment' ? (
        <PostHeader
          pageData={socialPage}
          postData={messageDetail?.post}
          showStop={
            isHotQueue && hotQueueInfo?.type === 'isSupporting'
          }
          hotQueueData={hotQueueData}
        />
      ) : (
        <ChatHeader
          userData={messageSelected?.sender}
          showStop={
            isHotQueue && hotQueueInfo?.type === 'isSupporting'
          }
          hotQueueData={hotQueueData}
        />
      )}

      <div ref={messageContainer} className="message-section">
        {messageList?.map((item, index) => {
          const dateSent = new Date(
            item?.createdAt
          )?.toLocaleString();

          let userReply = item?.type; // Bot, Comment, Agent#UserId
          if (item?.type?.includes('Agent')) {
            let agentName = agentList.current?.filter(
              (agent) => agent?.id === item?.type?.substring(6)
            )[0]?.name;
            userReply = `Agent#${agentName}`;
          }

          let isNotFinal = true;
          if (type === 'Message') {
            if (
              messageList[index]?.sender?.senderId !==
              messageList[index + 1]?.sender?.senderId
            ) {
              isNotFinal = false;
            }
          } else {
            isNotFinal = false;
          }

          return (
            <div
              key={item?.id ?? index}
              className={`${
                type !== 'Message'
                  ? item?.type !== 'Comment'
                    ? 'page-respond '
                    : ''
                  : item?.sender?.senderId === socialPage?.id
                  ? 'page-respond '
                  : ''
              }message-item`}
            >
              {!isNotFinal && (
                <BasicAvatar
                  src={
                    type !== 'Message'
                      ? item?.type !== 'Comment'
                        ? socialPage?.pictureUrl
                        : item?.sender?.avatarUrl
                      : item?.sender?.senderId === socialPage?.id
                      ? socialPage?.pictureUrl
                      : item?.sender?.avatarUrl
                  }
                />
              )}
              <Tag
                color={
                  type !== 'Message'
                    ? item?.type !== 'Comment' &&
                      'var(--primary-color)'
                    : item?.sender?.senderId === socialPage?.id &&
                      'var(--primary-color)'
                }
                className="message-chip-container"
                style={{
                  marginLeft: isNotFinal ? '4rem' : 0,
                  marginRight:
                    item?.sender?.senderId === socialPage?.id
                      ? isNotFinal
                        ? '4rem'
                        : 0
                      : 0,
                }}
              >
                <div className="message-chip-user flex-center">
                  <b>
                    {type !== 'Message'
                      ? item?.type !== 'Comment'
                        ? `${socialPage?.name} (${userReply})`
                        : `${item?.sender?.fullName}`
                      : item?.sender?.senderId === socialPage?.id
                      ? `${socialPage?.name}`
                      : `${item?.sender?.fullName}`}
                  </b>
                  <span className="message-date">{dateSent}</span>
                </div>
                <span className="message-chip">{item?.message}</span>
              </Tag>
              {!isHotQueue && item?.type === 'Comment' && (
                <ClassicDropdown
                  clickTrigger
                  list={listAction}
                  handleItemClick={(e) => {
                    setMessageReplied(item);
                    document.getElementById('respond-input')?.focus();
                  }}
                >
                  <IconMoreButton />
                </ClassicDropdown>
              )}
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
              <b>Reply to {messageReplied.sender?.fullName}</b>
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
        {isHotQueue && hotQueueInfo?.type !== 'isSupporting' && (
          <StartSupportingButton
            onClick={() => {
              setIsStartHotqueue(true);
              window.parent.postMessage(
                {
                  ...hotQueueData,
                  type: 'isSupporting',
                },
                '*'
              );
            }}
            loading={isStartHotqueue}
          />
        )}
        {(!isHotQueue ||
          (isHotQueue && hotQueueInfo?.type === 'isSupporting')) && (
          <div className="respose-input-container flex-center">
            <Input.TextArea
              id="respond-input"
              allowClear
              autoSize={{ minRows: 3, maxRows: 3 }}
              // onFocus={() => {
              //   toggleShowRecommend(true);
              // }}
              value={reply}
              onChange={(e) => {
                setReply(e.currentTarget.value);
              }}
              disabled={
                type !== 'Message'
                  ? useReplyFbMessage.isLoading ||
                    useSaveCommentToSystem.isLoading
                  : useReplyFbChat.isLoading ||
                    useSaveChatToSystem.isLoading
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (e.shiftKey) {
                    // move to a new line on Shift+Enter
                    setReply((prev) => prev + '\n');
                  } else {
                    handleSubmitMessage();
                  }
                }
              }}
            />
            <IconButton
              icon={<SendOutlined className="respond-icon" />}
              type="link"
              loading={
                type !== 'Message'
                  ? useReplyFbMessage.isLoading ||
                    useSaveCommentToSystem.isLoading
                  : useReplyFbChat.isLoading ||
                    useSaveChatToSystem.isLoading
              }
              disabled={!reply}
              onClick={handleSubmitMessage}
            />
          </div>
        )}
      </div>
    </LoadingWrapper>
  );
}
