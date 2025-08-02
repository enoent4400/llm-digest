export type SourcePlatform = 'claude' | 'chatgpt' | 'gemini' | 'perplexity' | 'copilot' | 'grok';
export type DigestFormat = 'executive-summary' | 'action-plan' | 'faq' | 'mind-map' | 'knowledge-graph' | 'code-organization' | 'gantt-chart' | 'decision-tree' | 'blog-post';

// Core digest database entity
export interface DigestData {
  user_id: string;
  source_url: string;
  source_platform: SourcePlatform;
  conversation_title: string;
  conversation_fingerprint: string;
  title: string;
  format: DigestFormat;
  raw_content?: any;
  processed_content: any;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  model_used: string;
  metadata?: Record<string, any>;
}

// Full digest record with database-generated fields
export interface DigestRecord extends DigestData {
  id: string;
  created: string;
  updated: string;
  status?: 'pending' | 'processing' | 'completed';
}

// User profile related types
export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  subscription_tier?: 'free' | 'pro' | 'enterprise';
  subscription_status?: 'active' | 'inactive' | 'cancelled';
  usage_count?: number;
  usage_limit?: number;
}

// Usage analytics types
export interface UsageRecord {
  id: string;
  user_id: string;
  action_type: 'digest_created' | 'digest_viewed' | 'digest_shared' | 'api_call';
  resource_id?: string; // digest_id for digest actions
  metadata?: Record<string, any>;
  cost?: number;
  created_at: string;
}

// Database query filter types
export interface DigestFilters {
  userId: string;
  platform?: SourcePlatform;
  format?: DigestFormat;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface DigestQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Database operation result types
export interface DatabaseResult<T> {
  data: T | null;
  error: any | null; // Database error type
}

export interface DatabaseListResult<T> {
  data: T[] | null;
  error: any | null;
  count?: number;
}

// Specific database operation types
export interface SaveDigestParams extends DigestData { }

export interface UpdateDigestParams {
  title?: string;
  processed_content?: any;
  input_tokens?: number;
  output_tokens?: number;
  estimated_cost?: number;
  model_used?: string;
  metadata?: Record<string, any>;
}

// Cache-related types
export interface DigestCacheKey {
  fingerprint: string;
  userId: string;
  format?: DigestFormat;
}

export interface CachedDigest {
  digest: DigestRecord;
  cachedAt: string;
  expiresAt: string;
}

// Analytics aggregation types
export interface UserUsageStats {
  totalDigests: number;
  digestsThisMonth: number;
  totalCost: number;
  costThisMonth: number;
  averageCostPerDigest: number;
  favoriteFormat: DigestFormat;
  mostUsedPlatform: SourcePlatform;
  createdAt: string;
}

export interface PlatformStats {
  platform: SourcePlatform;
  totalDigests: number;
  averageCost: number;
  successRate: number;
  averageProcessingTime: number;
}

// Migration and seed types
export interface MigrationRecord {
  version: string;
  applied_at: string;
  description?: string;
}

export interface SeedData {
  users: Partial<UserProfile>[];
  digests: Partial<DigestRecord>[];
  usage: Partial<UsageRecord>[];
}
