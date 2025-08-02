import React from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import { Download, Maximize, Minimize, RefreshCw } from 'lucide-react';
import { Button } from '../../../ui/button';

interface MindMapControlsProps {
  onExport: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

const MindMapControls: React.FC<MindMapControlsProps> = ({
  onExport,
  onReset,
  onToggleFullscreen,
  isFullscreen,
}) => {
  const { fitView } = useReactFlow();

  const handleFitView = () => {
    fitView({ padding: 0.2 });
  };

  return (
    <Panel position="top-right" className="flex gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={handleFitView}
        title="Fit view"
        className="bg-white"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={onExport}
        title="Export as image"
        className="bg-white"
      >
        <Download className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={onReset}
        title="Reset layout"
        className="bg-white"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={onToggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        className="bg-white"
      >
        {isFullscreen ? (
          <Minimize className="w-4 h-4" />
        ) : (
          <Maximize className="w-4 h-4" />
        )}
      </Button>
    </Panel>
  );
};

export default MindMapControls;
