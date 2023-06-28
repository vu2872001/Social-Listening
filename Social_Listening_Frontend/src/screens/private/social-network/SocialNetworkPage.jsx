import { useRef } from 'react';
import { useGetSocialGroups } from './socialNetworkService';
import PageCard from './PageCard';
import AddNewPage from './add-new-social/AddNewPage';
import LoadingWrapper from '../../../components/shared/antd/LoadingWrapper';
import ElementWithPermission from '../../../components/shared/element/ElementWithPermission';
import './socialNetwork.scss';

export default function SocialNetworkPage() {
  const firstRender = useRef(true);
  const { data, isFetching, refetch } = useGetSocialGroups(
    firstRender.current
  );
  firstRender.current = false;
  const listPageConnected = data?.map((item) => {
    let extendData = null;
    if (item?.SocialNetwork?.extendData) {
      extendData = JSON.parse(item?.SocialNetwork?.extendData);
    }
    return extendData?.id;
  });

  function updateSocialGroups() {
    firstRender.current = true;
    refetch();
  }

  return (
    <div className="social-network-contain">
      <LoadingWrapper
        className="social-manage-page"
        loading={isFetching}
      >
        <div className="social-network">
          <ElementWithPermission permission="connect-social-network">
            <AddNewPage listPageConnected={listPageConnected} />
          </ElementWithPermission>
          {data?.map((item, index) => (
            <PageCard
              key={index}
              socialNetworkData={item}
              type={item?.SocialNetwork?.socialType}
              updateSocialGroups={updateSocialGroups}
            />
          ))}
        </div>
      </LoadingWrapper>
    </div>
  );
}
