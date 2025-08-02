"use client"

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { AlertTriangle, Clock, Target } from 'lucide-react';
import type { ActionItem } from '@/types/digest';

interface ActionCardProps {
  action: ActionItem;
  priorityColor: (priority: string) => string;
  timeframeColor: (timeframe: string) => string;
}

export function ActionCard({ action, priorityColor, timeframeColor }: ActionCardProps) {
  return (
    <Card className="p-4 glass-card">
      <div className="space-y-3">
        {/* Action Title */}
        <h3 className="font-semibold text-gray-100 leading-tight">
          {action.title}
        </h3>

        {/* Action Description */}
        {action.description && (
          <p className="text-sm text-gray-300 leading-relaxed">
            {action.description}
          </p>
        )}

        {/* Category */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs px-2 py-1">
            {action.category}
          </Badge>
        </div>

        {/* Priority and Timeframe */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className={`text-xs px-2 py-1 ${priorityColor(action.priority)}`}
          >
            <Icon icon={Target} size={12} className="mr-1" />
            {action.priority} priority
          </Badge>

          <Badge
            variant="secondary"
            className={`text-xs px-2 py-1 ${timeframeColor(action.timeframe)}`}
          >
            <Icon icon={Clock} size={12} className="mr-1" />
            {action.timeframe}
          </Badge>

          {action.difficulty && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {action.difficulty}
            </Badge>
          )}
        </div>

        {/* Dependencies */}
        {action.dependencies && action.dependencies.length > 0 && (
          <div className="pt-2 border-t border-gray-700">
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <Icon icon={AlertTriangle} size={12} />
              Dependencies
            </div>
            <div className="flex flex-wrap gap-1">
              {action.dependencies.map((dep, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-gray-800 border-gray-700">
                  {dep}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
