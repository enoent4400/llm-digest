// Mock database implementation for testing migration
// In-memory database implementation for testing and development

import { DigestData, DigestRecord } from '@/types/database';

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
    created: now,
    updated: now,
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
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
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