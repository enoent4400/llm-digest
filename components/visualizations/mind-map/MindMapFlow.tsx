'use client';

import React, { useCallback, useLayoutEffect } from 'react';
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
  Panel,
  NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Download } from 'lucide-react';
import { Button } from '../../ui/button';
import { MindMapContent, MindMapNode } from '../../../types/digest';
import { EmptyState } from '../shared/EmptyState';
import type { DigestRecord } from '../../../types/database';

interface MindMapNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  type: string;
  importance?: string;
}

// Custom node component
const MindMapNodeComponent: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const nodeData = data as unknown as MindMapNodeData;

  const getNodeStyle = () => {
    const baseStyle = {
      padding: '12px 20px',
      borderRadius: '8px',
      border: '2px solid',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.2s',
      cursor: 'pointer',
    };

    switch (nodeData.type) {
      case 'root':
        return {
          ...baseStyle,
          backgroundColor: '#6366f1',
          borderColor: '#4f46e5',
          color: 'white',
          fontSize: '16px',
          fontWeight: 600,
        };
      case 'topic':
        return {
          ...baseStyle,
          backgroundColor: '#8b5cf6',
          borderColor: '#7c3aed',
          color: 'white',
        };
      case 'subtopic':
        return {
          ...baseStyle,
          backgroundColor: '#ec4899',
          borderColor: '#db2777',
          color: 'white',
        };
      case 'detail':
        return {
          ...baseStyle,
          backgroundColor: '#f3f4f6',
          borderColor: '#d1d5db',
          color: '#374151',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={getNodeStyle()} className="hover:shadow-lg">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
      />
      <div>{nodeData.label}</div>
      {nodeData.description && (
        <div className="text-xs mt-1 opacity-80">{nodeData.description}</div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
      />
    </div>
  );
};

const nodeTypes = {
  mindMapNode: MindMapNodeComponent,
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

const MindMapFlow: React.FC<MindMapFlowProps> = ({ databaseDigest }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

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

  useLayoutEffect(() => {
    if (!databaseDigest?.processed_content) return;

    const content = databaseDigest.processed_content as MindMapContent;
    if (!content.nodes || !content.edges) return;

    // Transform MindMapNode to ReactFlow Node
    const flowNodes: Node<MindMapNodeData>[] = content.nodes.map((node: MindMapNode) => ({
      id: node.id,
      type: 'mindMapNode',
      position: node.data.position || { x: 0, y: 0 },
      data: {
        label: node.label,
        description: node.data.description,
        type: node.type,
        importance: node.data.importance,
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

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export mind map');
  };

  if (!databaseDigest?.processed_content) {
    return <EmptyState title="No Data" message="No mind map data available" />;
  }

  const content = databaseDigest.processed_content as MindMapContent;

  return (
    <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-gray-50">
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
        <Controls>
          <button
            onClick={() => onLayout('TB')}
            title="Top to Bottom"
            className="react-flow__controls-button"
          >
            TB
          </button>
          <button
            onClick={() => onLayout('LR')}
            title="Left to Right"
            className="react-flow__controls-button"
          >
            LR
          </button>
        </Controls>
        <MiniMap />
        <Panel position="top-right" className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExport}
            className="bg-white"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </Panel>
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

export default MindMapFlow;
