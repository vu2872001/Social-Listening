import { useState, useRef } from 'react';
import { Switch } from 'antd';
import { Resizable } from 'react-resizable';
import { useGetSocialPost } from '../../socialNetworkService';
import useToggle from '../../../../../components/hooks/useToggle';
import ToolTipWrapper from '../../../../../components/shared/antd/ToolTipWrapper';
import DateTimePicker from '../../../../../components/shared/antd/DateTimePicker/DateTimePicker';
import DateRangePicker from '../../../../../components/shared/antd/DateTimePicker/DateRangePicker';
import ApplyFilterButton from '../../../../../components/shared/element/Button/ApplyFilterButton';
import PostCard from './PostCard';
import CommentDetail from './CommentDetail';
// import './post.scss';

export default function PostManagePage({ pageId, socialPage }) {
  const [rangeFilter, setRangeFilter] = useToggle(false);
  const [showComment, setShowComment] = useToggle(false);
  const getPost = useRef(true);
  const { data: listPost } = useGetSocialPost(
    pageId,
    getPost.current
  );
  getPost.current = false;

  const [width, setWidth] = useState(800);
  const handleResize = (event, { size }) => {
    event.stopPropagation();
    setWidth(size.width);
  };

  const listPostCard = (
    <div className="full-width flex-center post-with-filter">
      <div
        className={`filter-section flex-center ${
          showComment ? 'with-message' : ''
        }`}
      >
        <div className="filter-item flex-center">
          <ToolTipWrapper tooltip="Check to filter unread posts">
            <Switch />
          </ToolTipWrapper>
          Unread
        </div>
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
      <div
        className={`list-post-section ${
          showComment ? 'with-message' : ''
        }`}
      >
        {listPost?.map((item) => (
          <PostCard
            socialPage={socialPage}
            postData={item}
            showComment={(e) => {
              setShowComment(e);
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div key={pageId} className="post-container">
      <div id="post-comment" className="post-comment-container">
        {showComment ? (
          <>
            <Resizable
              width={width}
              height={0}
              handle={<div className="post-comment-handle" />}
              onResize={handleResize}
              minConstraints={[600, 0]}
              maxConstraints={[
                document.getElementById('post-comment')?.offsetWidth -
                  400,
                0,
              ]}
            >
              <div className="full-width">{listPostCard}</div>
            </Resizable>
            <div
              style={{
                width: `calc(100% - ${width}px)`,
              }}
            >
              <CommentDetail socialPage={socialPage} />
            </div>
          </>
        ) : (
          listPostCard
        )}
      </div>
    </div>
  );
}
