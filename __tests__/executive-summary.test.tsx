// Lines: 15
// Purpose: Test executive summary data formatting
// REVIEW CHECKPOINT: Verify executive summary processes digest data correctly

import { describe, it, expect } from 'vitest';

// Utility function to format digest data for executive summary
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatExecutiveSummary(digest: any) {
  const safeDigest = digest || {};
  return {
    title: safeDigest.title || 'Untitled Digest',
    summary: safeDigest.summary || '',
    hasContent: !!(safeDigest.title && safeDigest.summary),
    keyDecisions: safeDigest.keyDecisions || [],
    hasKeyDecisions: !!(safeDigest.keyDecisions && safeDigest.keyDecisions.length > 0),
    actionItems: safeDigest.actionItems || [],
    hasActionItems: !!(safeDigest.actionItems && safeDigest.actionItems.length > 0)
  };
}

// Utility function to generate copyable text

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateCopyableText(digest: any) {
  const formatted = formatExecutiveSummary(digest);
  let text = `# ${formatted.title}\n\n${formatted.summary}\n\n`;

  if (formatted.hasKeyDecisions) {
    text += '## Key Decisions\n';
    formatted.keyDecisions.forEach((decision: string) => {
      text += `• ${decision}\n`;
    });
    text += '\n';
  }

  if (formatted.hasActionItems) {
    text += '## Action Items\n';
    formatted.actionItems.forEach((item: string) => {
      text += `• ${item}\n`;
    });
  }

  return text;
}

describe('Executive Summary Formatting', () => {
  it('should format digest data correctly', () => {
    // Arrange
    const mockDigest = {
      title: 'Project Planning Discussion',
      summary: 'Team discussed Q4 roadmap and resource allocation.'
    };

    // Act
    const formatted = formatExecutiveSummary(mockDigest);

    // Assert
    expect(formatted.title).toBe('Project Planning Discussion');
    expect(formatted.summary).toBe('Team discussed Q4 roadmap and resource allocation.');
    expect(formatted.hasContent).toBe(true);
  });

  it('should format key decisions as bullet points', () => {
    // Arrange
    const mockDigest = {
      title: 'Strategy Meeting',
      keyDecisions: ['Prioritize mobile app development', 'Hire 2 additional developers']
    };

    // Act
    const formatted = formatExecutiveSummary(mockDigest);

    // Assert
    expect(formatted.keyDecisions).toEqual(['Prioritize mobile app development', 'Hire 2 additional developers']);
    expect(formatted.hasKeyDecisions).toBe(true);
  });

  it('should format action items with clear structure', () => {
    // Arrange
    const mockDigest = {
      title: 'Planning Session',
      actionItems: ['Create job postings', 'Update project timeline', 'Schedule follow-up meeting']
    };

    // Act
    const formatted = formatExecutiveSummary(mockDigest);

    // Assert
    expect(formatted.actionItems).toEqual(['Create job postings', 'Update project timeline', 'Schedule follow-up meeting']);
    expect(formatted.hasActionItems).toBe(true);
  });

  it('should handle empty or malformed digest data gracefully', () => {
    // Arrange
    const emptyDigest = {};
    const nullDigest = null;

    // Act
    const emptyFormatted = formatExecutiveSummary(emptyDigest);
    const nullFormatted = formatExecutiveSummary(nullDigest);

    // Assert
    expect(emptyFormatted.title).toBe('Untitled Digest');
    expect(emptyFormatted.summary).toBe('');
    expect(emptyFormatted.hasContent).toBe(false);
    expect(nullFormatted.title).toBe('Untitled Digest');
  });

  it('should generate copyable text format', () => {
    // Arrange
    const mockDigest = {
      title: 'Team Meeting',
      summary: 'Discussed project status',
      keyDecisions: ['Deploy next week'],
      actionItems: ['Update docs']
    };

    // Act
    const copyableText = generateCopyableText(mockDigest);

    // Assert
    expect(copyableText).toContain('Team Meeting');
    expect(copyableText).toContain('Discussed project status');
    expect(copyableText).toContain('Deploy next week');
    expect(copyableText).toContain('Update docs');
  });
});
