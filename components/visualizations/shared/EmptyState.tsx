"use client"

import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: LucideIcon;
}

export function EmptyState({ title, message, icon: IconComponent }: EmptyStateProps) {
  return (
    <Card className="border-gray-700">
      <CardContent className="text-center py-12">
        {IconComponent && (
          <div className="w-16 h-16 bg-gray-800 border border-gray-700 mx-auto mb-4 flex items-center justify-center rounded-lg">
            <Icon icon={IconComponent} size={32} className="text-gray-500" />
          </div>
        )}
        <h3 className="text-xl font-semibold text-gray-400 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          {message}
        </p>
      </CardContent>
    </Card>
  );
}
