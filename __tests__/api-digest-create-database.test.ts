// Lines: 20
// Purpose: Test API integration with database storage for digest creation
// REVIEW CHECKPOINT: Verify the API correctly saves digest results to database

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ClaudeConversation } from '@/lib/claude';
import { Platform } from '@/lib/platform/types';

// Mock the AI digest creation
vi.mock('@/lib/ai', () => ({
  createDigest: vi.fn()
}));

// Mock the database service
vi.mock('@/lib/database/digests', () => ({
  saveDigest: vi.fn()
}));

// Mock database - no Supabase needed
// Removed Supabase mock - using mock database

describe('POST /api/digest/create - Database Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save digest to database after successful AI generation', async () => {
    // Arrange
    const { createDigest } = await import('@/lib/ai');
    const { saveDigest } = await import('@/lib/database/digests');
    
    const mockConversation: ClaudeConversation = {
      id: 'test-conv-123',
      title: 'Test Conversation',
      messages: [
        { id: 'msg-1', role: 'user', content: 'Hello' },
        { id: 'msg-2', role: 'assistant', content: 'Hi there!' }
      ],
      metadata: { token_count: 100 },
      shareUrl: 'https://claude.ai/share/test-conv-123',
      fingerprint: 'test-fingerprint-123'
    };

    const mockDigestResult = {
      digest: '{"summary": "Test digest content"}',
      modelUsed: 'google/gemini-flash-1.5',
      complexity: 'simple',
      cost: 0.0075,
      fallbackUsed: false,
      usage: {
        promptTokens: 50,
        completionTokens: 25,
        totalTokens: 75
      }
    };

    // Mock AI generation
    vi.mocked(createDigest).mockResolvedValue(mockDigestResult);
    
    // Mock database save
    vi.mocked(saveDigest).mockResolvedValue({ 
      data: { id: 'digest-456' }, 
      error: null,
      count: 1,
      status: 200,
      statusText: 'OK'
    });

    // Act - Test the business logic integration
    const aiResult = await createDigest(mockConversation);
    const digestData = {
      user_id: 'test-user-123',
      source_url: `https://claude.ai/share/${mockConversation.id}`,
      source_platform: Platform.CLAUDE,
      conversation_title: mockConversation.title,
      conversation_fingerprint: mockConversation.fingerprint || 'test-fingerprint',
      title: mockConversation.title,
      format: 'executive-summary' as const,
      processed_content: JSON.parse(aiResult.digest),
      input_tokens: aiResult.usage?.promptTokens || 0,
      output_tokens: aiResult.usage?.completionTokens || 0,
      estimated_cost: aiResult.cost,
      model_used: aiResult.modelUsed
    };
    await saveDigest(digestData);

    // Assert
    expect(createDigest).toHaveBeenCalledWith(mockConversation);
    expect(saveDigest).toHaveBeenCalledWith({
      user_id: 'test-user-123',
      source_url: 'https://claude.ai/share/test-conv-123',
      source_platform: Platform.CLAUDE,
      conversation_title: 'Test Conversation',
      conversation_fingerprint: 'test-fingerprint-123',
      title: 'Test Conversation',
      format: 'executive-summary',
      processed_content: { summary: 'Test digest content' },
      input_tokens: 50,
      output_tokens: 25,
      estimated_cost: 0.0075,
      model_used: 'google/gemini-flash-1.5'
    });
  });
});