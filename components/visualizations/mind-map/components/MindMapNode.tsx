import React, { useEffect } from 'react';
import { NodeProps, Handle, Position, useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface MindMapNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  type: string;
  importance?: string;
  isCollapsed?: boolean;
  layoutDirection?: 'TB' | 'LR';
}

const MindMapNode: React.FC<NodeProps> = ({ data, isConnectable, id }) => {
  const nodeData = data as unknown as MindMapNodeData;
  const { setNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const handleToggleCollapse = () => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              isCollapsed: !nodeData.isCollapsed,
            },
          };
        }
        return node;
      })
    );
  };

  const hasChildren = nodeData.type !== 'detail'; // Assume details don't have children

  const getNodeStyle = () => {
    const baseStyle = {
      padding: '10px 14px',
      borderRadius: '12px',
      border: '2px solid',
      fontSize: '12px',
      fontWeight: 500,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      maxWidth: '220px',
      minWidth: '120px',
      wordWrap: 'break-word' as const,
      wordBreak: 'break-word' as const,
      whiteSpace: 'normal' as const,
      position: 'relative' as const,
      boxShadow: nodeData.isCollapsed ? '0 2px 4px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.15)',
    };

    const opacity = nodeData.isCollapsed ? 0.8 : 1;

    switch (nodeData.type) {
      case 'root':
        return {
          ...baseStyle,
          backgroundColor: '#6366f1',
          borderColor: '#4f46e5',
          color: 'white',
          fontSize: '14px',
          fontWeight: 600,
          opacity,
        };
      case 'topic':
        return {
          ...baseStyle,
          backgroundColor: '#8b5cf6',
          borderColor: '#7c3aed',
          color: 'white',
          opacity,
        };
      case 'subtopic':
        return {
          ...baseStyle,
          backgroundColor: '#ec4899',
          borderColor: '#db2777',
          color: 'white',
          opacity,
        };
      case 'detail':
        return {
          ...baseStyle,
          backgroundColor: '#f3f4f6',
          borderColor: '#d1d5db',
          color: '#374151',
          opacity,
        };
      default:
        return { ...baseStyle, opacity };
    }
  };

  // Dynamic handle positions based on layout direction
  const getHandlePositions = () => {
    const direction = nodeData.layoutDirection || 'TB';
    
    switch (direction) {
      case 'TB':
        return { target: Position.Top, source: Position.Bottom };
      case 'LR':
        return { target: Position.Left, source: Position.Right };
      default:
        return { target: Position.Top, source: Position.Bottom };
    }
  };

  const handlePositions = getHandlePositions();

  // Update node internals when layout direction changes
  useEffect(() => {
    updateNodeInternals(id);
  }, [nodeData.layoutDirection, id, updateNodeInternals]);

  return (
    <div style={getNodeStyle()} className="hover:shadow-xl transform hover:scale-105">
      <Handle
        type="target"
        position={handlePositions.target}
        id={`${id}-target`}
        isConnectable={isConnectable}
        style={{
          background: '#6b7280',
          width: '10px',
          height: '10px',
          border: '2px solid white',
          [handlePositions.target === Position.Top ? 'top' : 
           handlePositions.target === Position.Bottom ? 'bottom' :
           handlePositions.target === Position.Left ? 'left' : 'right']: '-5px',
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex-1 pr-2">{nodeData.label}</div>
        {hasChildren && (
          <button
            onClick={handleToggleCollapse}
            className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
            style={{
              color: nodeData.type === 'detail' ? '#374151' : 'white',
              opacity: 0.8,
            }}
          >
            {nodeData.isCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {nodeData.description && !nodeData.isCollapsed && (
        <div
          className="text-xs mt-2 leading-relaxed"
          style={{
            opacity: 0.85,
            borderTop: nodeData.type !== 'detail' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
            paddingTop: '6px',
          }}
        >
          {nodeData.description}
        </div>
      )}

      {nodeData.importance && !nodeData.isCollapsed && (
        <div
          className="text-xs mt-1 px-2 py-1 rounded-full bg-black bg-opacity-20 inline-block"
          style={{ fontSize: '10px' }}
        >
          {nodeData.importance}
        </div>
      )}

      <Handle
        type="source"
        position={handlePositions.source}
        id={`${id}-source`}
        isConnectable={isConnectable}
        style={{
          background: '#6b7280',
          width: '10px',
          height: '10px',
          border: '2px solid white',
          [handlePositions.source === Position.Top ? 'top' : 
           handlePositions.source === Position.Bottom ? 'bottom' :
           handlePositions.source === Position.Left ? 'left' : 'right']: '-5px',
        }}
      />
    </div>
  );
};

export default MindMapNode;
