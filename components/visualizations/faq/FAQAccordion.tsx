"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Copy, Check, HelpCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { FAQContent, FAQItem, ImportanceLevel } from '@/types/digest';
import type { DigestRecord } from '@/types/database';
import { QuestionItem } from './components/QuestionItem';
import { CategoryFilter } from './components/CategoryFilter';
import { EmptyState } from '../shared/EmptyState';

interface FAQAccordionProps {
  digest?: FAQContent;
  databaseDigest?: DigestRecord;
  showMetadata?: boolean;
}

// Helper function to parse database digest content
function parseDatabaseDigest(dbDigest: DigestRecord): FAQContent {
  const content = dbDigest.processed_content || {};

  // Flatten categories into questions array
  const allQuestions: FAQItem[] = [];
  const categories: string[] = [];

  if (content.categories && Array.isArray(content.categories)) {
    content.categories.forEach((cat: { category?: string; questions?: Array<{ id?: string; question?: string; answer?: string; importance?: string; tags?: string[]; keywords?: string[]; relatedQuestions?: string[] }> }) => {
      if (cat.category && !categories.includes(cat.category)) {
        categories.push(cat.category);
      }
      if (cat.questions && Array.isArray(cat.questions)) {
        cat.questions.forEach((q: { id?: string; question?: string; answer?: string; importance?: string; tags?: string[]; keywords?: string[]; relatedQuestions?: string[] }) => {
          allQuestions.push({
            id: q.id || Math.random().toString(36).substring(2, 11),
            question: q.question || '',
            answer: q.answer || '',
            category: cat.category || 'general',
            importance: (q.importance as ImportanceLevel) || 'medium',
            keywords: q.tags || q.keywords || [],
            relatedQuestions: q.relatedQuestions || []
          });
        });
      }
    });
  }

  return {
    title: content.title || dbDigest.title || dbDigest.conversation_title || 'FAQ',
    summary: content.description || content.summary || 'Frequently asked questions and answers',
    questions: allQuestions,
    categories: categories,
    topQuestions: content.topQuestions || allQuestions.slice(0, 5),
    metadata: content.metadata || {
      conversationLength: '0',
      complexity: 'simple',
      domain: 'General',
      completeness: 'unknown'
    }
  };
}

function generateCopyableText(content: FAQContent): string {
  let text = `# ${content.title}\n\n${content.summary}\n\n`;

  if (content.questions.length > 0) {
    content.questions.forEach((faq, index) => {
      text += `## ${index + 1}. ${faq.question}\n`;
      text += `${faq.answer}\n\n`;
      if (faq.category) {
        text += `**Category:** ${faq.category}\n`;
      }
      if (faq.keywords && faq.keywords.length > 0) {
        text += `**Keywords:** ${faq.keywords.join(', ')}\n`;
      }
      text += '\n';
    });
  }

  return text;
}

function getImportanceColor(importance: ImportanceLevel): string {
  switch (importance) {
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
}

export function FAQAccordion({ digest, databaseDigest, showMetadata = false }: FAQAccordionProps) {
  // Parse the database digest into our structured format or use provided digest
  const content = databaseDigest
    ? parseDatabaseDigest(databaseDigest)
    : digest || {
      title: 'FAQ',
      summary: 'Frequently asked questions and answers',
      questions: [],
      categories: [],
      topQuestions: [],
      metadata: {
        conversationLength: '0',
        complexity: 'simple',
        domain: 'General',
        completeness: 'unknown'
      }
    };

  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCopy = async () => {
    try {
      const copyableText = generateCopyableText(content);
      await navigator.clipboard.writeText(copyableText);
      setCopied(true);
      toast.success("Copied to clipboard!", {
        description: "FAQ content has been copied as formatted text.",
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

  // Filter questions by category and search query
  const filteredQuestions = content.questions.filter(question => {
    const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (question.keywords && question.keywords.some(keyword =>
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    return matchesCategory && matchesSearch;
  });

  // Check for error state
  const hasError = !content || !content.title;

  if (hasError) {
    return <EmptyState title="Processing Error" message="There was an error processing this FAQ." icon={AlertTriangle} />;
  }

  if (!content.questions || content.questions.length === 0) {
    return <EmptyState title="No Questions" message="This FAQ contains no questions and answers." icon={HelpCircle} />;
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
              {copied ? 'Copied!' : 'Copy FAQ'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Icon icon={HelpCircle} size={14} />
              {content.questions.length} questions
            </Badge>
            {content.categories && content.categories.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Icon icon={Search} size={14} />
                {content.categories.length} categories
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <CategoryFilter
          categories={content.categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* FAQ Questions */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <QuestionItem
            key={question.id}
            question={question}
            importanceColor={getImportanceColor}
          />
        ))}
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
