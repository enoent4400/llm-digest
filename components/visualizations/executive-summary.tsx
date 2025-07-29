"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { BookOpen, Target, Wrench, Lightbulb, AlertTriangle, MessageCircle, ClipboardList, Copy, Check, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import type {
  ExecutiveSummaryContent,
} from '@/types/digest';
import type { DigestResult } from '@/types/external';
import type { DigestRecord } from '@/types/database';
import type { ComplexityLevel } from '@/types/digest';

interface ExecutiveSummaryProps {
  digest?: ExecutiveSummaryContent;
  apiResponse?: DigestResult;
  databaseDigest?: DigestRecord;
  showMetadata?: boolean;
}

// Helper function to parse database digest content
function parseDatabaseDigest(dbDigest: DigestRecord): ExecutiveSummaryContent {
  const content = dbDigest.processed_content || {};

  return {
    title: content.title || dbDigest.title || dbDigest.conversation_title || 'Untitled',
    summary: content.summary || 'No summary available',
    mainTopics: content.mainTopics || [],
    keyInsights: content.keyInsights || [],
    importantQuestions: content.importantQuestions || [],
    conversationFlow: content.conversationFlow || {
      startingPoint: '',
      keyTransitions: [],
      conclusion: ''
    },
    practicalTakeaways: content.practicalTakeaways || [],
    shareableQuotes: content.shareableQuotes || [],
    metadata: content.metadata || {
      conversationLength: '0',
      complexity: 'simple',
      domain: 'General',
      completeness: 'unknown'
    }
  };
}

function generateCopyableText(content: ExecutiveSummaryContent): string {
  let text = `# ${content.title}\n\n${content.summary}\n\n`;

  if (content.keyInsights.length > 0) {
    text += '## Key Insights\n';
    content.keyInsights.forEach((insight, index) => {
      text += `${index + 1}. ${insight.insight}\n`;
      if (insight.applicability) {
        text += `   • ${insight.applicability}\n`;
      }
    });
    text += '\n';
  }

  if (content.practicalTakeaways.length > 0) {
    text += '## Action Items\n';
    content.practicalTakeaways.forEach((takeaway, index) => {
      text += `${index + 1}. ${takeaway.action} (${takeaway.timeframe}, ${takeaway.difficulty})\n`;
    });
    text += '\n';
  }

  if (content.shareableQuotes.length > 0) {
    text += '## Key Quotes\n';
    content.shareableQuotes.forEach((quote) => {
      text += `"${quote.text}" - ${quote.author}\n`;
    });
  }

  return text;
}

function getImportanceColor(importance: string): string {
  switch (importance) {
    case 'high': return 'bg-accent-error/10 border-accent-error/20 text-accent-error';
    case 'medium': return 'bg-accent-warning/10 border-accent-warning/20 text-accent-warning';
    case 'low': return 'bg-accent-success/10 border-accent-success/20 text-accent-success';
    default: return 'bg-gray-800/50 border-gray-700 text-gray-400';
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'learning': return BookOpen;
    case 'strategy': return Target;
    case 'tool': return Wrench;
    case 'concept': return Lightbulb;
    case 'warning': return AlertTriangle;
    default: return MessageCircle;
  }
}

function getTimeframeColor(timeframe: string): string {
  switch (timeframe) {
    case 'immediate': return 'bg-accent-error/10 border-accent-error/20 text-accent-error';
    case 'short-term': return 'bg-accent-warning/10 border-accent-warning/20 text-accent-warning';
    case 'long-term': return 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary';
    default: return 'bg-gray-800 border-gray-700 text-gray-300';
  }
}

export function ExecutiveSummary({ digest, databaseDigest, showMetadata = false }: ExecutiveSummaryProps) {
  // Parse the database digest into our structured format or use provided digest
  const content = databaseDigest
    ? parseDatabaseDigest(databaseDigest)
    : digest || {
        title: 'Untitled',
        summary: 'No summary available',
        mainTopics: [],
        keyInsights: [],
        importantQuestions: [],
        conversationFlow: {
          startingPoint: '',
          keyTransitions: [],
          conclusion: ''
        },
        practicalTakeaways: [],
        shareableQuotes: [],
        metadata: {
          conversationLength: '0',
          complexity: 'simple' as ComplexityLevel,
          domain: 'General',
          completeness: 'unknown'
        }
      };

  const handleCopy = async () => {
    try {
      const copyableText = generateCopyableText(content);
      await navigator.clipboard.writeText(copyableText);
      toast.success("Copied to clipboard!", {
        description: "Digest content has been copied as formatted text.",
        duration: 2000,
        icon: <Icon icon={Check} size={16} className="text-white" />,
      });
    } catch {
      toast.error("Failed to copy", {
        description: "Please try again or check your browser permissions.",
        duration: 3000,
      });
    }
  };

  // Check for error state
  const hasError = !content || !content.title || content.title === 'Untitled';

  if (hasError) {
    return (
      <Card className="border-accent-error/20">
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-accent-error/10 border border-accent-error/20 mx-auto mb-4 flex items-center justify-center rounded-lg">
              <Icon icon={AlertTriangle} size={32} className="text-accent-error" />
            </div>
            <h3 className="text-xl text-accent-error mb-2">
              Processing Error
            </h3>
            <p className="text-sm text-gray-400">
              There was an error processing this digest. Please try again or contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-3xl uppercase tracking-tight text-gray-100 -ml-1">
              {content.title}
            </CardTitle>
            <Button
              variant="default"
              size="sm"
              onClick={handleCopy}
              className="font-semibold"
            >
              <Icon icon={Copy} size={16} strokeWidth={2.5} className="text-white mr-2" />
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-100/90 leading-relaxed">
            {content.summary}
          </p>
        </CardContent>
      </Card>

      {/* Main Topics */}
      {content.mainTopics && content.mainTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl uppercase tracking-wide text-gray-100 flex items-center gap-2">
              <span className="w-8 h-8 bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center rounded-lg">
                <Icon icon={ClipboardList} size={20} strokeWidth={3} className="text-accent-primary" />
              </span>
              Main Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.mainTopics.map((topic, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className={`w-6 h-6 ${getImportanceColor(topic.importance)} border flex items-center justify-center rounded-lg flex-shrink-0 mt-1`}>
                    <span className="text-xs font-medium">{index + 1}</span>
                  </span>
                  <div>
                    <h4 className="font-semibold  text-gray-100">{topic.topic}</h4>
                    <p className="text-sm text-gray-100/70">{topic.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Insights */}
      {content.keyInsights && content.keyInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl uppercase tracking-wide text-gray-100 flex items-center gap-2">
              <span className="w-8 h-8 bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center rounded-lg">
                <Icon icon={Lightbulb} size={20} strokeWidth={3} className="text-accent-primary" />
              </span>
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.keyInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center rounded-lg flex-shrink-0 mt-1">
                    <Icon icon={getCategoryIcon(insight.category)} size={16} strokeWidth={2.5} className="text-accent-primary" />
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-100">{insight.insight}</p>
                    {insight.applicability && (
                      <p className="text-sm italic text-gray-100/70 mt-1">• {insight.applicability}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs uppercase tracking-wide text-gray-100/60">
                        {insight.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-md border ${insight.confidence === 'high' ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary' : insight.confidence === 'medium' ? 'bg-accent-warning/10 border-accent-warning/20 text-accent-warning' : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
                        {insight.confidence} confidence
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Practical Takeaways */}
      {content.practicalTakeaways && content.practicalTakeaways.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-100 flex items-center gap-2">
              <span className="w-8 h-8 bg-accent-warning/10 border border-accent-warning/20 flex items-center justify-center rounded-lg">
                <Icon icon={Check} size={20} className="text-accent-warning" />
              </span>
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.practicalTakeaways.map((takeaway, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-accent-primary border border-gray-700 flex items-center justify-center rounded-lg flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-100">{takeaway.action}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-md border ${getTimeframeColor(takeaway.timeframe)}`}>
                        {takeaway.timeframe}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-md border bg-gray-800 border-gray-700 text-gray-300">
                        {takeaway.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shareable Quotes */}
      {content.shareableQuotes && content.shareableQuotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl uppercase tracking-wide text-gray-100 flex items-center gap-2">
              <span className="w-8 h-8 bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center rounded-lg">
                <Icon icon={MessageCircle} size={20} strokeWidth={3} className="text-accent-primary" />
              </span>
              Key Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.shareableQuotes.map((quote, index) => (
                <div key={index} className="glass-card p-4">
                  <blockquote className="text-lg italic text-gray-100 mb-2">
                    &ldquo;{quote.text}&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-100/70">— {quote.author}</span>
                    <span className="text-gray-100/60">{quote.context}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Questions */}
      {content.importantQuestions && content.importantQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl uppercase tracking-wide text-gray-100 flex items-center gap-2">
              <span className="w-8 h-8 bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center rounded-lg">
                <Icon icon={HelpCircle} size={20} strokeWidth={3} className="text-accent-primary" />
              </span>
              Key Questions & Answers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.importantQuestions.map((qa, index) => (
                <div key={index} className="glass-card p-4">
                  <h4 className="text-gray-100 mb-2">Q: {qa.question}</h4>
                  <p className="text-gray-100/90 mb-2">A: {qa.answer}</p>
                  <p className="text-sm text-gray-100/70 italic">{qa.relevance}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
