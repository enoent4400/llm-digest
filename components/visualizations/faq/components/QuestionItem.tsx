"use client"

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { FAQItem, ImportanceLevel } from '@/types/digest';

interface QuestionItemProps {
  question: FAQItem;
  importanceColor: (importance: ImportanceLevel) => string;
}

export function QuestionItem({ question, importanceColor }: QuestionItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const copyableText = `Q: ${question.question}\nA: ${question.answer}`;
      await navigator.clipboard.writeText(copyableText);
      setCopied(true);
      toast.success("Copied to clipboard!", {
        description: "Question and answer copied.",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy", {
        description: "Please try again.",
        duration: 3000,
      });
    }
  };

  return (
    <Card className="border-gray-700">
      <div
        className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-100 mb-2">
              {question.question}
            </h3>
            {isOpen && (
              <div className="mt-3 text-gray-300">
                {question.answer}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="h-8 w-8 p-0"
            >
              <Icon icon={copied ? Check : Copy} size={16} className="text-gray-400" />
            </Button>
            {isOpen && (
              <Badge
                variant="secondary"
                className={`${importanceColor(question.importance)} capitalize`}
              >
                {question.importance}
              </Badge>
            )}
          </div>
        </div>

        {question.keywords && question.keywords.length > 0 && isOpen && (
          <div className="flex flex-wrap gap-1 mt-3">
            {question.keywords.map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        )}

        {question.category && isOpen && (
          <div className="mt-3">
            <Badge variant="default" className="bg-gray-700 text-gray-300">
              {question.category}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
