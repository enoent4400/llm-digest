"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { AlertCircle } from 'lucide-react';
import type { ActionItem } from '@/types/digest';
import { ActionCard } from './ActionCard';

interface PhaseColumnProps {
  title: string;
  actions: ActionItem[];
  priorityColor: (priority: string) => string;
  timeframeColor: (timeframe: string) => string;
}

export function PhaseColumn({ title, actions, priorityColor, timeframeColor }: PhaseColumnProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100 flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="secondary" className="text-xs">
            {actions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon icon={AlertCircle} size={24} className="mx-auto mb-2 text-gray-600" />
            <p className="text-sm">No actions in this phase</p>
          </div>
        ) : (
          <div className="space-y-4">
            {actions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                priorityColor={priorityColor}
                timeframeColor={timeframeColor}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
