// Mock database implementation for testing migration
// In-memory database implementation for testing and development

import { Platform } from '@/lib/platform/types';

export interface DigestData {
  user_id: string;
  source_url: string;
  source_platform: Platform;
  conversation_title: string;
  conversation_fingerprint: string;
  title: string;
  format: 'executive-summary' | 'action-plan' | 'faq' | 'mind-map';
  processed_content: Record<string, unknown>;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  model_used: string;
  raw_content?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface DigestRecord extends DigestData {
  id: string;
  created: string;
  updated: string;
  // Legacy aliases for backward compatibility
  created_at: string;
  updated_at: string;
}

// In-memory storage (will be replaced with PocketBase)
const mockDigests: Map<string, DigestRecord> = new Map();

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function createTimestamp(): string {
  return new Date().toISOString();
}

export async function saveDigest(data: DigestData) {
  const id = generateId();
  const now = createTimestamp();
  
  const record: DigestRecord = {
    ...data,
    id,
    status: data.status || 'completed',
    created: now,
    updated: now,
    created_at: now, // Legacy alias
    updated_at: now, // Legacy alias
  };
  
  mockDigests.set(id, record);
  
  return { data: record, error: null };
}

export async function getDigestById(id: string) {
  const record = mockDigests.get(id);
  
  if (!record) {
    return { data: null, error: { message: 'Digest not found' } };
  }
  
  return { data: record, error: null };
}

export async function getUserDigests(userId: string, limit = 10) {
  const userDigests = Array.from(mockDigests.values())
    .filter(digest => digest.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
  
  return { data: userDigests, error: null };
}

export async function updateDigest(id: string, updates: Partial<DigestData>) {
  const existing = mockDigests.get(id);
  
  if (!existing) {
    return { data: null, error: { message: 'Digest not found' } };
  }
  
  const updatedTime = createTimestamp();
  const updated: DigestRecord = {
    ...existing,
    ...updates,
    updated: updatedTime,
    updated_at: updatedTime, // Legacy alias
  };
  
  mockDigests.set(id, updated);
  
  return { data: updated, error: null };
}

export async function getDigestByFingerprint(fingerprint: string, userId: string) {
  const record = Array.from(mockDigests.values())
    .find(digest => 
      digest.conversation_fingerprint === fingerprint && 
      digest.user_id === userId
    );
  
  if (!record) {
    return { data: null, error: { message: 'Digest not found' } };
  }
  
  return { data: record, error: null };
}

export async function deleteDigest(id: string, userId: string) {
  const existing = mockDigests.get(id);
  
  if (!existing) {
    return { data: null, error: { message: 'Digest not found' } };
  }
  
  if (existing.user_id !== userId) {
    return { data: null, error: { message: 'Unauthorized' } };
  }
  
  mockDigests.delete(id);
  
  return { data: { id }, error: null };
}