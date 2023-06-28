import { useState } from 'react';
import FlowPlayground from './playground/FlowPlayground';
import TableBotFlow from './table/TableBotFlow';

export default function BotFlowManagePage({ pageId, socialPage }) {
  const [flowDetail, setFlowDetail] = useState(null);

  return (
    <>
      {!flowDetail ? (
        <TableBotFlow pageId={pageId} getCurrentFlow={setFlowDetail} />
      ) : (
        <FlowPlayground
          pageId={pageId}
          flowDetail={flowDetail}
          getCurrentFlow={setFlowDetail}
        />
      )}
    </>
  );
}
