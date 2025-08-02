import React from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import { Download, Maximize, Minimize, RefreshCw, RotateCw, Expand, Shrink } from 'lucide-react';
import { Button } from '../../../ui/button';

interface MindMapControlsProps {
  onExport: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onLayoutChange: (direction: 'TB' | 'LR') => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  isFullscreen: boolean;
  currentLayout: 'TB' | 'LR';
}

const MindMapControls: React.FC<MindMapControlsProps> = ({
  onExport,
  onReset,
  onToggleFullscreen,
  onLayoutChange,
  onExpandAll,
  onCollapseAll,
  isFullscreen,
  currentLayout,
}) => {
  const { fitView } = useReactFlow();

  const handleFitView = () => {
    fitView({ padding: 0.2 });
  };

  const getNextLayout = () => {
    const layouts: Array<'TB' | 'LR'> = ['TB', 'LR'];
    const currentIndex = layouts.indexOf(currentLayout);
    return layouts[(currentIndex + 1) % layouts.length];
  };

  const getLayoutLabel = (layout: string) => {
    switch (layout) {
      case 'TB': return 'Top → Bottom';
      case 'LR': return 'Left → Right';
      default: return layout;
    }
  };

  return (
    <>
      <Panel position="top-right" className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleFitView}
          title="Fit view"
        >
          <RefreshCw className="w-4 h-4 text-secondary-foreground" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onLayoutChange(getNextLayout())}
          title={`Current: ${getLayoutLabel(currentLayout)} - Click to rotate`}
        >
          <RotateCw className="w-4 h-4 text-secondary-foreground" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onExpandAll}
          title="Expand all nodes"
        >
          <Expand className="w-4 h-4 text-secondary-foreground" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onCollapseAll}
          title="Collapse all nodes"
        >
          <Shrink className="w-4 h-4 text-secondary-foreground" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onExport}
          title="Export as image"
        >
          <Download className="w-4 h-4 text-secondary-foreground" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onReset}
          title="Reset layout"
        >
          <RefreshCw className="w-4 h-4 text-secondary-foreground" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 text-secondary-foreground" />
          ) : (
            <Maximize className="w-4 h-4 text-secondary-foreground" />
          )}
        </Button>
      </Panel>

      <Panel position="top-left" className="bg-secondary p-2 rounded shadow-lg border">
        <div className="text-xs text-secondary-foreground">
          Layout: {getLayoutLabel(currentLayout)}
        </div>
      </Panel>
    </>
  );
};

export default MindMapControls;
