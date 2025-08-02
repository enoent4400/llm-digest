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
  MarkerType,
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
  layoutDirection?: 'TB' | 'LR';
}

const nodeTypes = {
  mindMapNode: MindMapNode,
};

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Enhanced spacing for better visual hierarchy
  const isHorizontal = direction === 'LR';
  const spacing = {
    nodesep: isHorizontal ? 180 : 140,
    ranksep: isHorizontal ? 250 : 200,
  };

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: spacing.nodesep,
    ranksep: spacing.ranksep,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    // Dynamic node sizing based on type and content
    const nodeData = node.data as MindMapNodeData;
    const baseWidth = 200;
    const baseHeight = 80;

    let width = baseWidth;
    let height = baseHeight;

    // Adjust size based on node type
    if (nodeData.type === 'root') {
      width = 240;
      height = 90;
    } else if (nodeData.type === 'detail') {
      width = 180;
      height = 70;
    }

    // Adjust for description length
    if (nodeData.description && !nodeData.isCollapsed) {
      height += Math.min(40, Math.ceil(nodeData.description.length / 30) * 15);
    }

    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Center positioning with type-based offsets
    const xOffset = nodeWithPosition.width / 2;
    const yOffset = nodeWithPosition.height / 2;

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - xOffset,
        y: nodeWithPosition.y - yOffset,
      },
      data: {
        ...node.data,
        layoutDirection: direction,
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
  const [currentLayout, setCurrentLayout] = useState<'TB' | 'LR'>('TB');
  const reactFlowInstance = useReactFlow();

  const onLayout = useCallback(
    (direction: 'TB' | 'LR') => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      setCurrentLayout(direction);
    },
    [nodes, edges, setNodes, setEdges]
  );

  const handleLayoutChange = useCallback(
    (direction: 'TB' | 'LR') => {
      onLayout(direction);
    },
    [onLayout]
  );

  const handleExpandAll = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isCollapsed: false,
        },
      }))
    );
  }, [setNodes]);

  const handleCollapseAll = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isCollapsed: node.data.type !== 'root',
        },
      }))
    );
  }, [setNodes]);

  const handleExport = async () => {
    if (reactFlowInstance) {
      const flowElement = document.querySelector('.react-flow') as HTMLElement | null;
      if (flowElement) {
        try {
          const dataUrl = await toPng(flowElement, {
            backgroundColor: 'transparent',
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
        layoutDirection: content.layout?.direction || 'TB',
      },
    }));

    // Transform MindMapEdge to ReactFlow Edge with curved, free-flowing styling
    const flowEdges: Edge[] = content.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'bezier',
      animated: Boolean(edge.data?.strength && edge.data.strength > 0.7),
      style: {
        stroke: '#6b7280',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: '#6b7280',
      },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      flowNodes,
      flowEdges,
      content.layout?.direction || 'TB'
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setCurrentLayout(content.layout?.direction || 'TB');
  }, [databaseDigest, setNodes, setEdges]);

  if (!databaseDigest?.processed_content) {
    return <EmptyState title="No Data" message="No mind map data available" />;
  }

  const content = databaseDigest.processed_content as MindMapContent;

  return (
    <>
      <style>{`
        .react-flow-controls-custom .react-flow__controls-button {
          background-color: #374151 !important;
          border: 1px solid #6b7280 !important;
          color: white !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        .react-flow-controls-custom .react-flow__controls-button:hover {
          background-color: #4b5563 !important;
        }
        .react-flow-controls-custom .react-flow__controls-button svg {
          fill: white !important;
        }
      `}</style>
      <div className={`w-full ${isFullscreen ? 'h-screen fixed top-0 left-0 right-0 bottom-0 z-50' : 'h-[800px]'} border rounded-lg overflow-hidden bg-background react-flow-controls-custom`}>
        <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.4, maxZoom: 0.8 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap />
        <MindMapControls
          onExport={handleExport}
          onReset={handleReset}
          onToggleFullscreen={handleToggleFullscreen}
          onLayoutChange={handleLayoutChange}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          isFullscreen={isFullscreen}
          currentLayout={currentLayout}
        />
      </ReactFlow>
      {content.summary && (
        <div className="p-4 bg-card border-t">
          <h3 className="font-semibold text-sm mb-1 text-foreground">Summary</h3>
          <p className="text-sm text-muted-foreground">{content.summary}</p>
        </div>
      )}
      </div>
    </>
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