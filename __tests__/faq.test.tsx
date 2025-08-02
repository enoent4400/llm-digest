import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FAQAccordion } from '@/components/visualizations/faq';
import { FAQContent } from '@/types/digest';

describe('FAQ Visualization', () => {
  const mockFAQContent: FAQContent = {
    title: 'Test FAQ',
    summary: 'This is a test FAQ summary',
    questions: [
      {
        id: '1',
        question: 'What is this?',
        answer: 'This is a test question',
        category: 'general',
        importance: 'high',
        keywords: ['test', 'faq'],
        relatedQuestions: []
      },
      {
        id: '2',
        question: 'How does it work?',
        answer: 'It works by testing components',
        category: 'technical',
        importance: 'medium',
        keywords: ['how', 'technical'],
        relatedQuestions: []
      }
    ],
    categories: ['general', 'technical'],
    topQuestions: [],
    metadata: {
      conversationLength: '5',
      complexity: 'simple',
      domain: 'Testing',
      completeness: 'complete'
    }
  };

  it('should render FAQ title and summary', () => {
    render(<FAQAccordion digest={mockFAQContent} />);

    expect(screen.getByText('Test FAQ')).toBeInTheDocument();
    expect(screen.getByText('This is a test FAQ summary')).toBeInTheDocument();
  });

  it('should render question items', () => {
    render(<FAQAccordion digest={mockFAQContent} />);

    expect(screen.getByText('What is this?')).toBeInTheDocument();
    expect(screen.getByText('How does it work?')).toBeInTheDocument();
  });

  it('should render category filter when categories exist', () => {
    render(<FAQAccordion digest={mockFAQContent} />);

    expect(screen.getByText('All categories')).toBeInTheDocument();
  });

  it('should handle empty FAQ content gracefully', () => {
    const emptyFAQContent: FAQContent = {
      title: 'Empty FAQ',
      summary: 'No questions available',
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

    render(<FAQAccordion digest={emptyFAQContent} />);

    expect(screen.getByText('No Questions')).toBeInTheDocument();
  });
});
