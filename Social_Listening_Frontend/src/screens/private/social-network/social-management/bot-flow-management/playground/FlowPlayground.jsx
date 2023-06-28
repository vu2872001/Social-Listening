import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  updateEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useMutation } from 'react-query';
import { updateBotFlow } from '../../../socialNetworkService';
import { notifyService } from '../../../../../../services/notifyService';
import ReceiveNode from './custom-node/ReceiveNode';
import RespondNode from './custom-node/RespondNode';
import SentimentAnalysis from './custom-node/SentimentAnalysis';
import NotifyAgent from './custom-node/NotifyAgent';
import BotflowNav from './BotflowNav';
import BotFlowMenu from './BotFlowMenu';
import useUpdateEffect from '../../../../../../components/hooks/useUpdateEffect';
import useEffectOnce from '../../../../../../components/hooks/useEffectOnce';

const nodeTypes = {
  Receive: ReceiveNode,
  SentimentAnalysis: SentimentAnalysis,
  Respond: RespondNode,
  NotifyAgent: NotifyAgent,
};

export default function FlowPlayground(props) {
  const { pageId, flowDetail, getCurrentFlow } = props;
  const extendData = useRef({
    nodes: [],
    edges: [],
    variables: [],
  });
  if (flowDetail?.extendData) {
    extendData.current = JSON.parse(flowDetail.extendData);
  }

  const reactFlowWrapper = useRef(null);
  const edgeUpdateSuccessful = useRef(true);
  const isDeleteNode = useRef(false);
  const isAddNode = useRef(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    extendData.current?.nodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    extendData.current?.edges
  );
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    edgeUpdateSuccessful.current = true;
    setEdges((els) => updateEdge(oldEdge, newConnection, els));
  }, []);

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  const deleteNodeById = (id) => {
    isDeleteNode.current = true;
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) =>
      eds.filter((edge) => edge.target !== id || edge.source === id)
    );
  };

  const deleteEdgeById = (id) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  };

  const syncDataFromNode = (id, data) => {
    setNodes((nds) =>
      nds.filter((node) => {
        if (node.id === id) {
          let dumpData = node.data;
          node.data = {
            ...dumpData,
            ...data,
          };
        }
        return node;
      })
    );
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds =
        reactFlowWrapper.current.getBoundingClientRect();

      const type = event.dataTransfer.getData(
        'application/reactflow'
      );

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      setNodes((nds) =>
        nds.concat({
          id: crypto.randomUUID(),
          type,
          position,
        })
      );
      isAddNode.current = true;
    },
    [reactFlowInstance]
  );

  const goBackMenu = () => {
    setSelectedNode(null);
  };

  const updateVariableInputNode = () => {
    edges.forEach((eds) => {
      const sourceNode = nodes.filter(
        (nds) => nds.id === eds.source
      )[0];
      const targetNode = nodes.filter(
        (nds) => nds.id === eds.target
      )[0];

      // if source output had variable
      if (sourceNode?.data?.output?.variable) {
        // and target input did not had variable
        if (
          targetNode?.data?.input?.variable !==
          sourceNode?.data?.output?.variable
        ) {
          // put input variable in the target
          syncDataFromNode(targetNode.id, {
            input: { variable: sourceNode.data.output.variable },
          });
        }
      }
    });
  };

  const refreshNodes = () => {
    nodes.map((node) => {
      // refresh all the handle in sentiment node
      if (node?.type === 'SentimentAnalysis') {
        syncDataFromNode(node?.id, {
          ['sentiment-output-handle-0']: true,
          ['sentiment-output-handle-1']: true,
          ['sentiment-output-handle-2']: true,
        });
      }

      node.connectable = true;
      return node;
    });
  };

  const disableSourceHandle = () => {
    refreshNodes();

    if (edges?.length > 0) {
      edges.forEach((eds) => {
        const sourceNode = nodes.filter(
          (nds) => nds.id === eds.source
        )[0];

        if (sourceNode?.type === 'SentimentAnalysis') {
          syncDataFromNode(sourceNode?.id, {
            [eds.sourceHandle]: false,
          });
        } else {
          setNodes((nds) => {
            let availableNode = nds?.filter(
              (nd) => nd?.id === sourceNode?.id
            )[0];
            if (availableNode) {
              availableNode.connectable = false;
            }
            return nds;
          });
        }
      });
    }

    // update the node already in the flow
    onNodesChange(
      nodes.map((nds) => {
        return { item: nds, type: 'reset' };
      })
    );
  };

  useEffectOnce(() => {
    disableSourceHandle();
  });

  useUpdateEffect(() => {
    // delete node also delete the selected one
    if (isDeleteNode.current) {
      goBackMenu();
    }
    isDeleteNode.current = false;

    if (
      isAddNode.current &&
      nodes?.length > 0 &&
      !selectedNode &&
      (nodes[nodes.length - 1]?.type === 'SentimentAnalysis' ||
        nodes[nodes.length - 1]?.type === 'Respond')
    ) {
      isAddNode.current = false;
      setSelectedNode(nodes[nodes.length - 1]);
    }

    if (selectedNode) {
      setSelectedNode(
        nodes.filter((nds) => nds.id === selectedNode.id)[0]
      );
    }
  }, [nodes]);

  useUpdateEffect(() => {
    // update variable for input handle when connected 2 nodes
    updateVariableInputNode();
    // disable all the target handle if it connected
    disableSourceHandle();
  }, [edges]);

  const goBackToTable = () => {
    getCurrentFlow(null);
  };

  const useUpdateBotFlow = useMutation(updateBotFlow, {
    onSuccess: (resp) => {
      if (resp) {
        notifyService.showSucsessMessage({
          description: 'Update flow successfully',
        });
      }
    },
  });
  const updateBotflow = () => {
    goBackMenu();

    useUpdateBotFlow.mutate({
      id: flowDetail?.id,
      body: {
        name: flowDetail?.name,
        tabId: pageId,
        data: {
          nodes: nodes,
          edges: edges,
          variables: nodes
            ?.filter((nds) => nds.data?.output?.variable)
            .map((nds) => nds.data?.output?.variable),
        },
      },
    });
  };

  return (
    <div className="react-flow-container" ref={reactFlowWrapper}>
      <BotflowNav
        flowDetail={flowDetail}
        updateFlow={updateBotflow}
        loadingUpdate={useUpdateBotFlow.isLoading}
        exit={goBackToTable}
      />
      <BotFlowMenu
        pageId={pageId}
        selectedNode={selectedNode}
        goBackMenu={goBackMenu}
      />
      <ReactFlow
        snapToGrid
        fitView
        nodes={nodes?.map((node) => {
          node.data = {
            ...node.data,
            syncData: syncDataFromNode,
            deleteNode: deleteNodeById,
            selectedNode: selectedNode,
          };
          return node;
        })}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onNodeClick={(e) => {
          const id = e.currentTarget.dataset.id;
          e.currentTarget.onkeydown = function (x) {
            if (
              x.key === 'Delete' &&
              nodes.filter((nds) => nds.id === id)[0].type !==
                'Receive'
            ) {
              deleteNodeById(id);
            }
          };
          setSelectedNode(nodes.filter((nds) => nds.id === id)[0]);
        }}
        onEdgeClick={(e) => {
          let id = e.currentTarget.dataset.testid;
          if (id?.includes('rf__edge-')) {
            id = id.substring(9);
          }
          e.currentTarget.onkeydown = function (x) {
            if (x.key === 'Delete') {
              deleteEdgeById(id);
            }
          };
        }}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <Controls />
        <Background variant="lines" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
