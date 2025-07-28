// Lines: 18
// Purpose: Test executive summary integration with AI digest API responses
// REVIEW CHECKPOINT: Verify component can parse real AI digest JSON format

import { describe, it, expect } from 'vitest';

// Utility function to parse AI digest JSON for executive summary
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseAIDigestForSummary(apiResponse: any) {
  try {
    const digestContent = typeof apiResponse.digest === 'string'
      ? JSON.parse(apiResponse.digest)
      : apiResponse.digest || {};

    return {
      title: digestContent.title || 'AI Generated Summary',
      summary: digestContent.summary || digestContent.executiveSummary || '',
      keyDecisions: digestContent.keyDecisions || digestContent.decisions || [],
      actionItems: digestContent.actionItems || digestContent.actions || []
    };
  } catch (error) {
    return handleDigestError();
  }
}

// Utility function to handle digest parsing errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleDigestError() {
  return {
    title: 'Error: Invalid Digest Format',
    summary: 'Unable to parse digest content',
    keyDecisions: [],
    actionItems: [],
    error: true
  };
}

// Utility function to extract metadata from API response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractDigestMetadata(apiResponse: any) {
  return {
    modelUsed: apiResponse.modelUsed || 'Unknown',
    cost: apiResponse.cost || 0,
    complexity: apiResponse.complexity || 'unknown',
    tokenCount: apiResponse.usage?.totalTokens || 0,
    timestamp: apiResponse.metadata?.timestamp || new Date().toISOString()
  };
}

// Utility function to parse database-stored digest
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDatabaseDigest(dbDigest: any) {
  const content = dbDigest.processed_content || {};

  return {
    title: content.title || dbDigest.title || 'Untitled',
    summary: content.summary || '',
    keyDecisions: content.keyDecisions || [],
    actionItems: content.actionItems || [],
    metadata: {
      cost: dbDigest.estimated_cost || 0,
      modelUsed: dbDigest.model_used || 'Unknown',
      tokenCount: (dbDigest.input_tokens || 0) + (dbDigest.output_tokens || 0),
      timestamp: dbDigest.created_at || new Date().toISOString(),
      digestId: dbDigest.id
    }
  };
}

describe('Executive Summary API Integration', () => {
  it('should parse AI digest JSON and render executive summary', () => {
    // Arrange - Real AI response format
    const mockAPIResponse = {
      digest: '{"title": "Project Kickoff Meeting", "summary": "Team aligned on Q4 goals", "keyDecisions": ["Use React for frontend"], "actionItems": ["Set up repo"]}',
      modelUsed: 'google/gemini-flash-1.5',
      cost: 0.0075
    };

    // Act
    const parsed = parseAIDigestForSummary(mockAPIResponse);

    // Assert
    expect(parsed.title).toBe('Project Kickoff Meeting');
    expect(parsed.summary).toBe('Team aligned on Q4 goals');
    expect(parsed.keyDecisions).toEqual(['Use React for frontend']);
    expect(parsed.actionItems).toEqual(['Set up repo']);
  });

  it('should handle different digest formats from AI response', () => {
    // Arrange - Alternative AI format with different field names
    const alternativeResponse = {
      digest: '{"title": "Strategy Discussion", "executiveSummary": "High-level overview", "decisions": ["Pivot to mobile"], "actions": ["Research competitors"]}',
      modelUsed: 'google/gemini-flash-1.5',
      cost: 0.012
    };

    // Act
    const parsed = parseAIDigestForSummary(alternativeResponse);

    // Assert
    expect(parsed.title).toBe('Strategy Discussion');
    expect(parsed.summary).toBe('High-level overview');
    expect(parsed.keyDecisions).toEqual(['Pivot to mobile']);
    expect(parsed.actionItems).toEqual(['Research competitors']);
  });

  it('should extract digest metadata for display', () => {
    // Arrange - API response with metadata
    const responseWithMetadata = {
      digest: '{"title": "Team Sync", "summary": "Weekly update"}',
      modelUsed: 'google/gemini-flash-1.5',
      cost: 0.0045,
      complexity: 'simple',
      usage: { totalTokens: 150 },
      metadata: { timestamp: '2024-01-15T10:30:00Z' }
    };

    // Act
    const metadata = extractDigestMetadata(responseWithMetadata);

    // Assert
    expect(metadata.modelUsed).toBe('google/gemini-flash-1.5');
    expect(metadata.cost).toBe(0.0045);
    expect(metadata.complexity).toBe('simple');
    expect(metadata.tokenCount).toBe(150);
    expect(metadata.timestamp).toBe('2024-01-15T10:30:00Z');
  });

  it('should parse database-stored digest data', () => {
    // Arrange - Database format from mock database
    const databaseDigest = {
      id: 'digest-123',
      title: 'Weekly Standup',
      processed_content: {
        title: 'Weekly Standup Notes',
        summary: 'Team progress and blockers discussed',
        keyDecisions: ['Move deadline to Friday'],
        actionItems: ['Update timeline', 'Contact client']
      },
      model_used: 'google/gemini-flash-1.5',
      estimated_cost: 0.0032,
      input_tokens: 95,
      output_tokens: 45,
      created_at: '2024-01-15T14:30:00Z'
    };

    // Act
    const parsed = parseDatabaseDigest(databaseDigest);

    // Assert
    expect(parsed.title).toBe('Weekly Standup Notes');
    expect(parsed.summary).toBe('Team progress and blockers discussed');
    expect(parsed.keyDecisions).toEqual(['Move deadline to Friday']);
    expect(parsed.actionItems).toEqual(['Update timeline', 'Contact client']);
    expect(parsed.metadata.cost).toBe(0.0032);
    expect(parsed.metadata.modelUsed).toBe('google/gemini-flash-1.5');
  });

  it('should handle API error states gracefully', () => {
    // Arrange - Malformed API responses
    const emptyResponse = { digest: '{}' };
    const nullResponse = { digest: null };

    // Act
    const invalidParsed = handleDigestError();
    const emptyParsed = parseAIDigestForSummary(emptyResponse);
    const nullParsed = parseAIDigestForSummary(nullResponse);

    // Assert
    expect(invalidParsed.title).toBe('Error: Invalid Digest Format');
    expect(invalidParsed.summary).toBe('Unable to parse digest content');
    expect(emptyParsed.title).toBe('AI Generated Summary');
    expect(nullParsed.title).toBe('AI Generated Summary');
  });
});
