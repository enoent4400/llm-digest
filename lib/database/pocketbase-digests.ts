// PocketBase database implementation for digests

import { DigestData, DigestRecord, DigestFormat, SourcePlatform } from '@/types/database';

// PocketBase configuration
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const COLLECTION_NAME = 'digests';

class PocketBaseClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api/${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PocketBase request failed: ${response.status} ${error}`);
    }

    // Handle empty responses (common for DELETE operations)
    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');
    
    // If no content or not JSON, return empty object
    if (
      response.status === 204 || 
      contentLength === '0' || 
      !contentType?.includes('application/json')
    ) {
      return {};
    }

    // Check if response has actual content before parsing JSON
    const text = await response.text();
    if (!text.trim()) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      console.error('Failed to parse JSON response:', text);
      throw new Error('Invalid JSON response from PocketBase');
    }
  }

  async create(collection: string, data: Record<string, unknown>) {
    return this.request(`collections/${collection}/records`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getById(collection: string, id: string) {
    return this.request(`collections/${collection}/records/${id}`);
  }

  async list(collection: string, filter?: string, limit?: number) {
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    if (limit) params.append('perPage', limit.toString());

    return this.request(`collections/${collection}/records?${params.toString()}`);
  }

  async update(collection: string, id: string, data: Record<string, unknown>) {
    return this.request(`collections/${collection}/records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(collection: string, id: string) {
    return this.request(`collections/${collection}/records/${id}`, {
      method: 'DELETE',
    });
  }
}

const pb = new PocketBaseClient(POCKETBASE_URL);

// Transform PocketBase record to our format
function transformRecord(record: Record<string, unknown>): DigestRecord {
  // Compute status based on processed_content
  let status: 'pending' | 'processing' | 'completed' = 'pending';
  if (record.processed_content && Object.keys(record.processed_content).length > 0) {
    status = 'completed';
  } else if (record.raw_content && Object.keys(record.raw_content).length > 0) {
    status = 'processing';
  }

  return {
    id: record.id as string,
    user_id: record.user_id as string,
    source_url: record.source_url as string,
    source_platform: record.source_platform as SourcePlatform,
    conversation_title: record.conversation_title as string,
    conversation_fingerprint: record.conversation_fingerprint as string,
    title: record.title as string,
    format: record.format as DigestFormat,
    processed_content: record.processed_content as Record<string, unknown> || {},
    input_tokens: (record.input_tokens as number) || 0,
    output_tokens: (record.output_tokens as number) || 0,
    estimated_cost: (record.estimated_cost as number) || 0,
    model_used: (record.model_used as string) || '',
    raw_content: record.raw_content as Record<string, unknown>,
    metadata: record.metadata as Record<string, unknown> | undefined,
    created: (record.created as string) || new Date().toISOString(),
    updated: (record.updated as string) || (record.created as string) || new Date().toISOString(),
    status,
  };
}

export async function saveDigest(data: DigestData) {
  try {
    const record = await pb.create(COLLECTION_NAME, data as unknown as Record<string, unknown>);
    return { data: transformRecord(record), error: null };
  } catch (error) {
    return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function getDigestById(id: string) {
  try {
    const record = await pb.getById(COLLECTION_NAME, id);
    console.log('Fetched digest record:', record);
    return { data: transformRecord(record), error: null };
  } catch (error) {
    return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function getUserDigests(userId: string, limit = 10) {
  try {
    const filter = `user_id='${userId}'`;
    const response = await pb.list(COLLECTION_NAME, filter, limit);
    const records = response.items?.map(transformRecord) || [];
    return { data: records, error: null };
  } catch (error) {
    return { data: [], error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function updateDigest(id: string, updates: Partial<DigestData>) {
  try {
    const record = await pb.update(COLLECTION_NAME, id, updates as unknown as Record<string, unknown>);
    return { data: transformRecord(record), error: null };
  } catch (error) {
    return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function getDigestByFingerprint(fingerprint: string, userId: string) {
  try {
    const filter = `conversation_fingerprint='${fingerprint}' && user_id='${userId}'`;
    const response = await pb.list(COLLECTION_NAME, filter, 1);
    const record = response.items?.[0];

    if (!record) {
      return { data: null, error: { message: 'Digest not found' } };
    }

    return { data: transformRecord(record), error: null };
  } catch (error) {
    return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function deleteDigest(id: string, userId: string) {
  try {
    // First verify ownership
    const { data: existing, error: fetchError } = await getDigestById(id);

    if (fetchError || !existing) {
      return { data: null, error: { message: 'Digest not found' } };
    }

    if (existing.user_id !== userId) {
      return { data: null, error: { message: 'Unauthorized' } };
    }

    await pb.delete(COLLECTION_NAME, id);
    return { data: { id }, error: null };
  } catch (error) {
    return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}
