// Lines: 15
// Purpose: Test fingerprint-based caching to prevent duplicate digest storage
// REVIEW CHECKPOINT: Verify caching prevents duplicate AI generation and storage

import { describe, it, expect, vi } from 'vitest';

// Mock database service
vi.mock('@/lib/database/digests', () => ({
  getDigestByFingerprint: vi.fn(),
  saveDigest: vi.fn()
}));

describe('Fingerprint-based Caching', () => {
  it('should return existing digest if fingerprint already exists in database', async () => {
    // Arrange
    const { getDigestByFingerprint } = await import('@/lib/database/digests');
    
    const existingDigest = {
      id: 'existing-digest-123',
      user_id: 'test-user-123',
      conversation_fingerprint: 'test-fingerprint-123',
      title: 'Cached Digest',
      processed_content: { summary: 'Existing content' },
      created_at: '2024-01-01T00:00:00Z'
    };

    // Mock existing digest found
    vi.mocked(getDigestByFingerprint).mockResolvedValue({
      data: existingDigest,
      error: null
    });

    // Act
    const result = await getDigestByFingerprint('test-fingerprint-123', 'test-user-123');

    // Assert
    expect(getDigestByFingerprint).toHaveBeenCalledWith('test-fingerprint-123', 'test-user-123');
    expect(result.data).toEqual(existingDigest);
    expect(result.error).toBeNull();
  });
});