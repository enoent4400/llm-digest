import { describe, it, expect, beforeEach } from 'vitest';
import { saveDigest, getDigestById, getUserDigests, updateDigest, getDigestByFingerprint, deleteDigest, type DigestData } from '@/lib/database/digests';
import { Platform } from '@/lib/platform/types';

const mockDigestData: DigestData = {
  user_id: 'test-user-123',
  source_url: 'https://claude.ai/chat/test-conversation',
  source_platform: Platform.CLAUDE,
  conversation_title: 'Test Conversation',
  conversation_fingerprint: 'test-fingerprint-abc',
  title: 'Test Digest Title',
  format: 'executive-summary',
  processed_content: { summary: 'This is a test summary' },
  input_tokens: 150,
  output_tokens: 300,
  estimated_cost: 0.02,
  model_used: 'gpt-4'
};

describe('Mock Database Operations', () => {
  it('should save a digest successfully', async () => {
    const result = await saveDigest(mockDigestData);
    
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data?.id).toBeDefined();
    expect(result.data?.title).toBe(mockDigestData.title);
    expect(result.data?.user_id).toBe(mockDigestData.user_id);
  });

  it('should retrieve a digest by ID', async () => {
    // First save a digest
    const saveResult = await saveDigest(mockDigestData);
    const digestId = saveResult.data!.id;
    
    // Then retrieve it
    const getResult = await getDigestById(digestId);
    
    expect(getResult.error).toBeNull();
    expect(getResult.data).toBeDefined();
    expect(getResult.data?.id).toBe(digestId);
    expect(getResult.data?.title).toBe(mockDigestData.title);
  });

  it('should return error for non-existent digest ID', async () => {
    const result = await getDigestById('non-existent-id');
    
    expect(result.error).toBeDefined();
    expect(result.data).toBeNull();
    expect(result.error?.message).toBe('Digest not found');
  });

  it('should retrieve user digests with limit', async () => {
    // Save multiple digests for the same user
    await saveDigest(mockDigestData);
    await saveDigest({ ...mockDigestData, title: 'Second Digest' });
    await saveDigest({ ...mockDigestData, title: 'Third Digest' });
    
    // Retrieve user digests with limit
    const result = await getUserDigests(mockDigestData.user_id, 2);
    
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data!.length).toBeLessThanOrEqual(2);
    expect(result.data![0].user_id).toBe(mockDigestData.user_id);
  });

  it('should update a digest successfully', async () => {
    // Save a digest first
    const saveResult = await saveDigest(mockDigestData);
    const digestId = saveResult.data!.id;
    
    // Update the digest
    const updates = { title: 'Updated Title', estimated_cost: 0.05 };
    const updateResult = await updateDigest(digestId, updates);
    
    expect(updateResult.error).toBeNull();
    expect(updateResult.data).toBeDefined();
    expect(updateResult.data?.title).toBe('Updated Title');
    expect(updateResult.data?.estimated_cost).toBe(0.05);
  });

  it('should find digest by fingerprint and user ID', async () => {
    // Save a digest
    await saveDigest(mockDigestData);
    
    // Find by fingerprint
    const result = await getDigestByFingerprint(
      mockDigestData.conversation_fingerprint,
      mockDigestData.user_id
    );
    
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data?.conversation_fingerprint).toBe(mockDigestData.conversation_fingerprint);
    expect(result.data?.user_id).toBe(mockDigestData.user_id);
  });

  it('should delete a digest successfully', async () => {
    // Save a digest
    const saveResult = await saveDigest(mockDigestData);
    const digestId = saveResult.data!.id;
    
    // Delete the digest
    const deleteResult = await deleteDigest(digestId, mockDigestData.user_id);
    
    expect(deleteResult.error).toBeNull();
    expect(deleteResult.data).toBeDefined();
    expect(deleteResult.data?.id).toBe(digestId);
    
    // Verify it's deleted
    const getResult = await getDigestById(digestId);
    expect(getResult.error).toBeDefined();
    expect(getResult.data).toBeNull();
  });

  it('should prevent deleting digest with wrong user ID', async () => {
    // Save a digest
    const saveResult = await saveDigest(mockDigestData);
    const digestId = saveResult.data!.id;
    
    // Try to delete with wrong user ID
    const deleteResult = await deleteDigest(digestId, 'wrong-user-id');
    
    expect(deleteResult.error).toBeDefined();
    expect(deleteResult.data).toBeNull();
    expect(deleteResult.error?.message).toBe('Unauthorized');
  });
});

describe('Data Validation', () => {
  it('should handle all required digest format types', async () => {
    const formats: Array<'executive-summary' | 'action-plan' | 'faq' | 'mind-map'> = [
      'executive-summary',
      'action-plan', 
      'faq',
      'mind-map'
    ];
    
    for (const format of formats) {
      const result = await saveDigest({ ...mockDigestData, format });
      expect(result.error).toBeNull();
      expect(result.data?.format).toBe(format);
    }
  });

  it('should handle all supported platforms', async () => {
    const platforms = [
      Platform.CLAUDE,
      Platform.CHATGPT,
      Platform.GEMINI
    ];
    
    for (const platform of platforms) {
      const result = await saveDigest({ ...mockDigestData, source_platform: platform });
      expect(result.error).toBeNull();
      expect(result.data?.source_platform).toBe(platform);
    }
  });

  it('should handle optional fields correctly', async () => {
    const minimalData: DigestData = {
      user_id: 'test-user',
      source_url: 'https://example.com',
      source_platform: Platform.CLAUDE,
      conversation_title: 'Test',
      conversation_fingerprint: 'test-fp',
      title: 'Test',
      format: 'executive-summary',
      processed_content: {},
      input_tokens: 0,
      output_tokens: 0,
      estimated_cost: 0,
      model_used: ''
    };
    
    const result = await saveDigest(minimalData);
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
  });
});