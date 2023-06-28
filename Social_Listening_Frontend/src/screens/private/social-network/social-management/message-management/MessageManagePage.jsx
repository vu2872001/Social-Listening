import { useRef, useState } from 'react';
import {
  useGetConversationWithUserId,
  useGetMessageDetail,
} from '../../socialNetworkService';
import { useSocket } from '../../../../../components/contexts/socket/SocketProvider';
import useUpdateEffect from '../../../../../components/hooks/useUpdateEffect';
import DateTimeFormat from '../../../../../components/shared/element/DateTimeFormat';
import AdminTable from '../../../../../components/shared/antd/Table/Table';
import MessageTypeContainer from './message-type/MessageTypeContainer';
import environment from '../../../../../constants/environment/environment.dev';
import Hint from '../../../../../components/shared/element/Hint';
import LoadingWrapper from '../../../../../components/shared/antd/LoadingWrapper';
import BasicAvatar from '../../../../../components/shared/antd/BasicAvatar';
import ToolTipWrapper from '../../../../../components/shared/antd/ToolTipWrapper';

export default function MessageManagePage(props) {
  const {
    pageId,
    socialPage,
    type,
    showTable = true,
    showHint = true,
    messageData,
    getMessageDetail = false
  } = props;
  const { socket } = useSocket();

  const [msgSelected, setMsgSelected] = useState(messageData);
  const getDetail = useRef(getMessageDetail);

  const { data: commentDetail, isFetching: isCommentFetching } =
    useGetMessageDetail(
      msgSelected?.id,
      getDetail.current && type === 'Comment'
    );
  const { data: messageDetail, isFetching: isMessageFetching } =
    useGetConversationWithUserId(
      {
        pageId: pageId,
        userId: msgSelected?.sender?.id,
        body: {
          orders: [],
          filter: [],
          size: 10000,
          pageNumber: 1,
          totalElement: 0,
          // offset: 0
        },
      },
      getDetail.current && type === 'Message'
    );
  getDetail.current = false;

  useUpdateEffect(() => {
    getDetail.current = true;
    setMsgSelected(messageData);
  }, [messageData]);

  let showMessageDetail = true;
  if (!showTable && !showHint) {
    showMessageDetail = !isCommentFetching && !isMessageFetching;
  }

  const messageDetailList =
    type === 'Comment'
      ? commentDetail
      : messageDetail?.data?.slice().reverse();

  const columns = [
    {
      title: 'Sender',
      dataIndex: 'sender.fullName',
      render: (_, record) => {
        return (
          <div className="sender-header flex-center">
            <BasicAvatar
              src={record?.sender?.avatarUrl}
              name={record['sender.fullName']}
            />
            <span className="sender-name limit-line">
              {record['sender.fullName']}
            </span>
          </div>
        );
      },
      fixed: true,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      render: (text, record) => {
        return (
          <ToolTipWrapper tooltip="Click to view full details">
            <div
              className="pointer limit-line"
              onClick={() => {
                getDetail.current = true;
                setMsgSelected({ ...record });
              }}
            >
              <b>
                {type === 'Message' &&
                  record?.from !== record?.sender?.id &&
                  `${socialPage?.name}: `}
                {text}
              </b>
            </div>
          </ToolTipWrapper>
        );
      },
    },
    {
      title: 'Date Sent',
      dataIndex: type === 'Message' ? 'lastSent' : 'createdAt',
      width: 200,
      render: (record) => {
        return <DateTimeFormat dateTime={record} />;
      },
      onCell: () => ({
        className: 'text-center',
      }),
      filter: {
        filterType: 'DateTime',
      },
    },
  ];

  const permission = {
    table: type === 'Comment' ? 'table-comment' : 'table-message',
  };

  const refreshAllData = () => {
    if (showTable) {
      // refresh table
      document.getElementById('refresh-table')?.click();
    }

    // refresh the message detail
    if (document.getElementById('message-hint') === null) {
      getDetail.current = true;
      setMsgSelected({ ...msgSelected });
    }
  };

  useUpdateEffect(() => {
    if (socket) {
      socket.on('messageCome', (payload) => {
        if (payload) {
          refreshAllData();
        }
      });

      socket.on('commentCome', (payload) => {
        if (payload) {
          refreshAllData();
        }
      });
    }
  }, [socket, msgSelected]);

  return (
    <>
      {showHint && (
        <Hint
          type="info"
          message={
            <span className="message-detail-hint flex-center">
              We will only get messages from the date you register
              your social media business to our system.
            </span>
          }
        />
      )}
      <div className="message-container flex-center">
        {showTable && (
          <div className="message-table">
            <AdminTable
              apiGetData={
                type === 'Comment'
                  ? `${environment.socialMessage}/${pageId}`
                  : `${environment.message}/${pageId}/conversations`
              }
              columns={columns}
              permission={permission}
              showToolbar={false}
              disableSelect
              scroll={{
                x: 1000,
              }}
            />
          </div>
        )}
        <div className="message-detail flex-center">
          {msgSelected ? (
            <LoadingWrapper
              className="message-type-loader"
              loading={
                type === 'Comment'
                  ? isCommentFetching
                  : isMessageFetching
              }
            >
              {type && showMessageDetail && (
                <MessageTypeContainer
                  pageId={pageId}
                  messageSelected={msgSelected}
                  type={type}
                  socialPage={socialPage}
                  messageDetail={messageDetailList}
                  isHotQueue={!showTable && !showHint}
                />
              )}
            </LoadingWrapper>
          ) : (
            <div
              id="message-hint"
              className="full-height flex-center"
            >
              <Hint
                message={
                  <span className="message-detail-hint flex-center">
                    You can select the message (the first column with
                    a bold text) from the table to view full details
                  </span>
                }
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
