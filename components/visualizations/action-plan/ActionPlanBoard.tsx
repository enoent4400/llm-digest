"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { ActionPlanContent, ActionItem } from '@/types/digest';
import type { DigestRecord } from '@/types/database';
import { PhaseColumn } from './components/PhaseColumn';
import { EmptyState } from '../shared/EmptyState';

interface ActionPlanBoardProps {
  digest?: ActionPlanContent;
  databaseDigest?: DigestRecord;
  showMetadata?: boolean;
}

// Helper function to parse database digest content
function parseDatabaseDigest(dbDigest: DigestRecord): ActionPlanContent {
  const content = dbDigest.processed_content || {};

  // Convert action plan actions to the legacy ActionItem format for timeline grouping
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legacyActionItems: ActionItem[] = (content.actions || content.actionItems || []).map((action: any) => ({
    id: action.id || Math.random().toString(36).substr(2, 9),
    title: action.action || action.title || 'Untitled Action',
    description: action.description || '',
    priority: action.priority || 'medium',
    timeframe: action.timeframe || 'short-term',
    difficulty: action.difficulty || 'moderate',
    dependencies: action.dependencies || [],
    category: action.category || 'general'
  }));

  return {
    title: content.title || dbDigest.title || dbDigest.conversation_title || 'Action Plan',
    objective: content.objective || 'No objective specified',
    summary: content.summary || 'No summary available',
    phases: content.phases || [],
    actions: content.actions || content.actionItems || [],
    actionItems: legacyActionItems,
    milestones: content.milestones || [],
    risks: content.risks || [],
    resources: content.resources || {
      tools: [],
      skills: [],
      materials: []
    },
    categories: content.categories || [],
    timeline: content.timeline || {
      immediate: legacyActionItems.filter(item => item.timeframe === 'immediate'),
      shortTerm: legacyActionItems.filter(item => item.timeframe === 'short-term'),
      longTerm: legacyActionItems.filter(item => item.timeframe === 'long-term')
    },
    metadata: content.metadata || {
      conversationLength: '0',
      complexity: 'simple',
      domain: 'General',
      completeness: 'unknown'
    }
  };
}

// Helper function to group actions by timeframe
function groupActionsByTimeframe(actions: ActionItem[]): ActionPlanContent['timeline'] {
  const immediate: ActionItem[] = [];
  const shortTerm: ActionItem[] = [];
  const longTerm: ActionItem[] = [];

  actions.forEach(action => {
    switch (action.timeframe) {
      case 'immediate':
        immediate.push(action);
        break;
      case 'short-term':
        shortTerm.push(action);
        break;
      case 'long-term':
        longTerm.push(action);
        break;
      default:
        shortTerm.push(action);
    }
  });

  return { immediate, shortTerm, longTerm };
}

function generateCopyableText(content: ActionPlanContent): string {
  let text = `# ${content.title}\n\n${content.summary}\n\n`;

  if (content.actionItems.length > 0) {
    text += '## Action Items\n\n';
    content.actionItems.forEach((action, index) => {
      text += `${index + 1}. ${action.title}\n`;
      text += `   Category: ${action.category}\n`;
      text += `   Priority: ${action.priority}\n`;
      text += `   Timeframe: ${action.timeframe}\n`;
      text += `   Difficulty: ${action.difficulty}\n`;
      if (action.description) {
        text += `   Description: ${action.description}\n`;
      }
      if (action.dependencies && action.dependencies.length > 0) {
        text += `   Dependencies: ${action.dependencies.join(', ')}\n`;
      }
      text += '\n';
    });
  }

  return text;
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
}

function getTimeframeColor(timeframe: string): string {
  switch (timeframe) {
    case 'immediate': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'short-term': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'long-term': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
}

export function ActionPlanBoard({ digest, databaseDigest, showMetadata = false }: ActionPlanBoardProps) {
  // Parse the database digest into our structured format or use provided digest
  const content = databaseDigest
    ? parseDatabaseDigest(databaseDigest)
    : digest || {
      title: 'Action Plan',
      objective: 'No objective specified',
      summary: 'No summary available',
      phases: [],
      actions: [],
      actionItems: [],
      milestones: [],
      risks: [],
      resources: {
        tools: [],
        skills: [],
        materials: []
      },
      categories: [],
      timeline: {
        immediate: [],
        shortTerm: [],
        longTerm: []
      },
      metadata: {
        conversationLength: '0',
        complexity: 'simple',
        domain: 'General',
        completeness: 'unknown'
      }
    };

  // Ensure timeline is properly grouped
  const timeline = content.timeline || groupActionsByTimeframe(content.actionItems);

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const copyableText = generateCopyableText(content);
      await navigator.clipboard.writeText(copyableText);
      setCopied(true);
      toast.success("Copied to clipboard!", {
        description: "Action plan has been copied as formatted text.",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy", {
        description: "Please try again or check your browser permissions.",
        duration: 3000,
      });
    }
  };

  // Check for error state
  const hasError = !content || !content.title;

  if (hasError) {
    return <EmptyState title="Processing Error" message="There was an error processing this action plan." icon={AlertTriangle} />;
  }

  if (!content.actionItems || content.actionItems.length === 0) {
    return <EmptyState title="No Action Items" message="This action plan contains no actionable items." icon={Calendar} />;
  }

  return (
    <div className="space-y-6">
      {/* Main Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-semibold text-gray-100 mb-2">
                {content.title}
              </CardTitle>
              {content.summary && (
                <p className="text-gray-300 leading-relaxed">
                  {content.summary}
                </p>
              )}
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleCopy}
              className="font-semibold whitespace-nowrap"
            >
              <Icon icon={copied ? Check : Copy} size={16} className="text-white mr-2" />
              {copied ? 'Copied!' : 'Copy Plan'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Icon icon={Calendar} size={14} />
              {content.actionItems.length} actions
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Icon icon={Clock} size={14} />
              {timeline.immediate.length} immediate
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Icon icon={Clock} size={14} />
              {timeline.shortTerm.length} short-term
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Icon icon={Clock} size={14} />
              {timeline.longTerm.length} long-term
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PhaseColumn
          title="Immediate Actions"
          actions={timeline.immediate}
          priorityColor={getPriorityColor}
          timeframeColor={getTimeframeColor}
        />
        <PhaseColumn
          title="Short-term Actions"
          actions={timeline.shortTerm}
          priorityColor={getPriorityColor}
          timeframeColor={getTimeframeColor}
        />
        <PhaseColumn
          title="Long-term Actions"
          actions={timeline.longTerm}
          priorityColor={getPriorityColor}
          timeframeColor={getTimeframeColor}
        />
      </div>

      {/* Metadata */}
      {showMetadata && content.metadata && (
        <Card>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
              <div className="text-center">
                <span className="block font-semibold text-gray-100/70 mb-1">Domain</span>
                <span className="text-gray-100">{content.metadata.domain}</span>
              </div>
              <div className="text-center">
                <span className="block font-semibold text-gray-100/70 mb-1">Complexity</span>
                <span className="text-gray-100 capitalize">{content.metadata.complexity}</span>
              </div>
              <div className="text-center">
                <span className="block font-semibold text-gray-100/70 mb-1">Length</span>
                <span className="text-gray-100">{content.metadata.conversationLength} exchanges</span>
              </div>
              <div className="text-center">
                <span className="block font-semibold text-gray-100/70 mb-1">Completeness</span>
                <span className="text-gray-100 capitalize">{content.metadata.completeness}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
