import React from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';

interface MindMapNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  type: string;
  importance?: string;
  isCollapsed?: boolean;
}

const MindMapNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const nodeData = data as unknown as MindMapNodeData;

  const getNodeStyle = () => {
    const baseStyle = {
      padding: '8px 12px',
      borderRadius: '8px',
      border: '2px solid',
      fontSize: '12px',
      fontWeight: 500,
      transition: 'all 0.2s',
      cursor: 'pointer',
      maxWidth: '200px',
      wordWrap: 'break-word' as const,
      wordBreak: 'break-word' as const,
      whiteSpace: 'normal' as const,
    };

    switch (nodeData.type) {
      case 'root':
        return {
          ...baseStyle,
          backgroundColor: '#6366f1',
          borderColor: '#4f46e5',
          color: 'white',
          fontSize: '14px',
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
      {nodeData.description && !nodeData.isCollapsed && (
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

export default MindMapNode;
