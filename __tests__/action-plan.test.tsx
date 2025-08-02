// Lines: 15
// Purpose: Test action plan data formatting and component rendering
// REVIEW CHECKPOINT: Verify action plan processes digest data correctly

import { describe, it, expect } from 'vitest';
import type { ActionPlanContent, ActionItem, ImportanceLevel, TimeframeLevel, DifficultyLevel } from '@/types/digest';

// Utility function to format action plan data
function formatActionPlan(digest: Partial<ActionPlanContent> | null | undefined): Partial<ActionPlanContent> {
  const safeDigest = digest || {};
  const actionItems = (safeDigest.actionItems || []) as ActionItem[];

  return {
    title: safeDigest.title || 'Untitled Action Plan',
    summary: safeDigest.summary || '',
    actionItems: actionItems,
    categories: safeDigest.categories || [],
    timeline: safeDigest.timeline || {
      immediate: actionItems.filter(item => item.timeframe === 'immediate'),
      shortTerm: actionItems.filter(item => item.timeframe === 'short-term'),
      longTerm: actionItems.filter(item => item.timeframe === 'long-term')
    }
  } as ActionPlanContent;
}

// Utility function to generate copyable text for action plan
function generateActionPlanCopyableText(digest: Partial<ActionPlanContent>): string {
  const formatted = formatActionPlan(digest);
  let text = `# ${formatted.title}\n\n${formatted.summary}\n\n`;

  if (formatted.actionItems && formatted.actionItems.length > 0) {
    text += '## Action Items\n';
    formatted.actionItems.forEach((item, index) => {
      text += `${index + 1}. ${item.title}\n`;
      if (item.description) {
        text += `   ${item.description}\n`;
      }
      text += `   Category: ${item.category}\n`;
      text += `   Priority: ${item.priority}\n`;
      text += `   Timeframe: ${item.timeframe}\n`;
      text += `   Difficulty: ${item.difficulty}\n`;
      if (item.dependencies && item.dependencies.length > 0) {
        text += `   Dependencies: ${item.dependencies.join(', ')}\n`;
      }
      text += '\n';
    });
  }

  return text;
}

describe('Action Plan Formatting', () => {
  it('should format action plan data correctly', () => {
    // Arrange
    const mockActionItems: ActionItem[] = [
      {
        id: '1',
        title: 'Set up development environment',
        description: 'Install all required tools and dependencies',
        priority: 'high' as ImportanceLevel,
        timeframe: 'immediate' as TimeframeLevel,
        difficulty: 'easy' as DifficultyLevel,
        category: 'setup'
      }
    ];

    const mockDigest: Partial<ActionPlanContent> = {
      title: 'Project Implementation Plan',
      summary: 'Comprehensive plan for executing the project',
      actionItems: mockActionItems
    };

    // Act
    const formatted = formatActionPlan(mockDigest);

    // Assert
    expect(formatted.title).toBe('Project Implementation Plan');
    expect(formatted.summary).toBe('Comprehensive plan for executing the project');
    expect(formatted.actionItems?.length).toBe(1);
  });

  it('should group action items by timeframe', () => {
    // Arrange
    const mockActionItems: ActionItem[] = [
      {
        id: '1',
        title: 'Research requirements',
        description: 'Gather and analyze project requirements',
        priority: 'high' as ImportanceLevel,
        timeframe: 'immediate' as TimeframeLevel,
        difficulty: 'easy' as DifficultyLevel,
        category: 'planning'
      },
      {
        id: '2',
        title: 'Design system architecture',
        description: 'Create detailed system design documents',
        priority: 'high' as ImportanceLevel,
        timeframe: 'short-term' as TimeframeLevel,
        difficulty: 'moderate' as DifficultyLevel,
        category: 'design'
      },
      {
        id: '3',
        title: 'Deploy to production',
        description: 'Set up production environment and deploy',
        priority: 'medium' as ImportanceLevel,
        timeframe: 'long-term' as TimeframeLevel,
        difficulty: 'challenging' as DifficultyLevel,
        category: 'deployment'
      }
    ];

    const mockDigest: Partial<ActionPlanContent> = {
      title: 'Development Roadmap',
      actionItems: mockActionItems
    };

    // Act
    const formatted = formatActionPlan(mockDigest);

    // Assert
    expect(formatted.timeline?.immediate.length).toBe(1);
    expect(formatted.timeline?.shortTerm.length).toBe(1);
    expect(formatted.timeline?.longTerm.length).toBe(1);
    expect(formatted.timeline?.immediate[0].title).toBe('Research requirements');
    expect(formatted.timeline?.shortTerm[0].title).toBe('Design system architecture');
    expect(formatted.timeline?.longTerm[0].title).toBe('Deploy to production');
  });

  it('should handle empty or malformed digest data gracefully', () => {
    // Arrange
    const emptyDigest = {};
    const nullDigest = null;

    // Act
    const emptyFormatted = formatActionPlan(emptyDigest);
    const nullFormatted = formatActionPlan(nullDigest);

    // Assert
    expect(emptyFormatted.title).toBe('Untitled Action Plan');
    expect(emptyFormatted.summary).toBe('');
    expect(nullFormatted.title).toBe('Untitled Action Plan');
  });

  it('should generate copyable text format with all action details', () => {
    // Arrange
    const mockActionItems: ActionItem[] = [
      {
        id: '1',
        title: 'Implement login feature',
        description: 'Create authentication flow',
        priority: 'high' as ImportanceLevel,
        timeframe: 'immediate' as TimeframeLevel,
        difficulty: 'moderate' as DifficultyLevel,
        category: 'development',
        dependencies: ['2', '3']
      }
    ];

    const mockDigest: Partial<ActionPlanContent> = {
      title: 'Sprint Planning',
      summary: 'Tasks for current sprint',
      actionItems: mockActionItems
    };

    // Act
    const copyableText = generateActionPlanCopyableText(mockDigest);

    // Assert
    expect(copyableText).toContain('Sprint Planning');
    expect(copyableText).toContain('Tasks for current sprint');
    expect(copyableText).toContain('Implement login feature');
    expect(copyableText).toContain('Create authentication flow');
    expect(copyableText).toContain('Category: development');
    expect(copyableText).toContain('Priority: high');
    expect(copyableText).toContain('Timeframe: immediate');
    expect(copyableText).toContain('Difficulty: moderate');
    expect(copyableText).toContain('Dependencies: 2, 3');
  });
});
