'use client';

import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { toPng } from 'html-to-image';
import MindMapNode from './components/MindMapNode';
import MindMapControls from './components/MindMapControls';
import { MindMapContent } from '../../../types/digest';
import { EmptyState } from '../shared/EmptyState';
import type { DigestRecord } from '../../../types/database';

interface MindMapNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  type: string;
  importance?: string;
  isCollapsed?: boolean;
}

const nodeTypes = {
  mindMapNode: MindMapNode,
};

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'BT' | 'LR' | 'RL' = 'TB'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 150 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 100,
        y: nodeWithPosition.y - 40,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

interface MindMapFlowProps {
  databaseDigest: DigestRecord;
}

const MindMapFlowInner: React.FC<MindMapFlowProps> = ({ databaseDigest }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const reactFlowInstance = useReactFlow();

  const onLayout = useCallback(
    (direction: 'TB' | 'BT' | 'LR' | 'RL') => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges]
  );

  const handleExport = async () => {
    if (reactFlowInstance) {
      const flowElement = document.querySelector('.react-flow') as HTMLElement | null;
      if (flowElement) {
        try {
          const dataUrl = await toPng(flowElement, {
            backgroundColor: '#f7f9fb',
            width: flowElement.scrollWidth,
            height: flowElement.scrollHeight,
          });

          const link = document.createElement('a');
          link.download = 'mind-map.png';
          link.href = dataUrl;
          link.click();
        } catch (error) {
          console.error('Error exporting mind map:', error);
        }
      }
    }
  };

  const handleReset = () => {
    onLayout(databaseDigest.processed_content?.layout?.direction || 'TB');
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useLayoutEffect(() => {
    if (!databaseDigest?.processed_content) return;

    const content = databaseDigest.processed_content as MindMapContent;
    if (!content.nodes || !content.edges) return;

    // Transform MindMapNode to ReactFlow Node

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flowNodes: Node<MindMapNodeData>[] = content.nodes.map((node: any) => ({
      id: node.id,
      type: 'mindMapNode',
      position: node.data.position || { x: 0, y: 0 },
      data: {
        label: node.label,
        description: node.data.description,
        type: node.type,
        importance: node.data.importance,
        isCollapsed: node.data.isCollapsed || false,
      },
    }));

    // Transform MindMapEdge to ReactFlow Edge
    const flowEdges: Edge[] = content.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: Boolean(edge.data?.strength && edge.data.strength > 0.7),
      style: {
        stroke: '#9ca3af',
        strokeWidth: 2,
      },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      flowNodes,
      flowEdges,
      content.layout?.direction || 'TB'
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [databaseDigest, setNodes, setEdges]);

  if (!databaseDigest?.processed_content) {
    return <EmptyState title="No Data" message="No mind map data available" />;
  }

  const content = databaseDigest.processed_content as MindMapContent;

  return (
    <div className={`w-full ${isFullscreen ? 'h-screen fixed top-0 left-0 right-0 bottom-0 z-50' : 'h-[600px]'} border rounded-lg overflow-hidden bg-gray-50`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap />
        <MindMapControls
          onExport={handleExport}
          onReset={handleReset}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
        />
      </ReactFlow>
      {content.summary && (
        <div className="p-4 bg-white border-t">
          <h3 className="font-semibold text-sm mb-1">Summary</h3>
          <p className="text-sm text-gray-600">{content.summary}</p>
        </div>
      )}
    </div>
  );
};

const MindMapFlow: React.FC<MindMapFlowProps> = ({ databaseDigest }) => {
  return (
    <ReactFlowProvider>
      <MindMapFlowInner databaseDigest={databaseDigest} />
    </ReactFlowProvider>
  );
};

export default MindMapFlow;
