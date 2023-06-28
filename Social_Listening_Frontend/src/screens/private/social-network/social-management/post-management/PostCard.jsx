import { Card, Badge } from 'antd';
import PostHeader from '../message-management/message-type/PostHeader';
import BasicAvatar from '../../../../../components/shared/antd/BasicAvatar';

const { Meta } = Card;
export default function PostCard({
  socialPage,
  postData,
  showComment,
}) {
  const lastMessageDate = new Date(
    postData?.lastMessageAt
  ).toLocaleString();

  return (
    <Badge
      key={postData?.id}
      overflowCount={99}
      count={postData?.totalUnreadComment}
      color="var(--primary-color)"
      className="post-unread-message"
    >
      <Card
        onClick={() => {
          showComment(postData?.id);
        }}
        className="post-card-container"
        title={
          <PostHeader pageData={socialPage} postData={postData} />
        }
      >
        <div className="total-comment">
          {postData?.totalComment} comment(s)
        </div>
        <Meta
          avatar={<BasicAvatar />}
          title={
            <div className="last-comment-title flex-center">
              <span>User</span>
              <span className="message-date">{lastMessageDate}</span>
            </div>
          }
          description={
            <div className="last-comment limit-line">
              {postData?.lastMessage}
            </div>
          }
        />
      </Card>
    </Badge>
  );
}
