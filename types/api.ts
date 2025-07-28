// API request and response types for the web application
// Centralized definitions for all API endpoints

import type { ClaudeConversation } from '@/lib/claude';
import type { DigestResult } from '@/lib/ai';
import { DigestWithStatus } from './database';
// Removed Supabase session import

// Base API response structure
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Error response structure
export interface ApiError {
  error: string;
  code?: string;
  details?: string;
  timestamp?: string;
}

// === Digest Creation API Types ===

export interface CreateDigestRequest {
  conversation: ClaudeConversation;
  options?: {
    visualizationType?: 'executive-summary' | 'knowledge-graph' | 'code-organization' | 'mind-map' | 'gantt-chart' | 'decision-tree' | 'blog-post';
    regenerate?: boolean;
    existingDigestId?: string;
  };
}

export interface CreateDigestResponse {
  success: boolean;
  digestId: string;
  result: DigestResult;
  metadata: {
    conversationId: string;
    messageCount: number;
    processing: {
      timestamp: string;
      options: CreateDigestRequest['options'];
      cached?: boolean;
    };
  };
}

// === Claude Share Link Parsing API Types ===

export interface ClaudeShareRequest {
  shareUrl: string;
  options?: {
    includeArtifacts?: boolean;
    includeAttachments?: boolean;
    maxMessages?: number;
    timeout?: number;
  };
}

export interface ClaudeShareResponse {
  success: boolean;
  conversation: ClaudeConversation;
  metadata?: {
    parseTime: number;
    messageCount: number;
    hasArtifacts: boolean;
    hasAttachments: boolean;
  };
}

// === Authentication API Types ===

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    created_at: string;
  };
  // Removed session type - no auth in open-source version
  error?: string;
}

// === Digest Retrieval API Types ===

export interface GetDigestRequest {
  id: string;
}

export interface GetDigestResponse {
  success: boolean;
  digest?: DigestWithStatus // Should be DigestWithStatus from database.ts
  error?: string;
}

// === Future API Types ===

export interface DigestListRequest {
  userId: string;
  limit?: number;
  offset?: number;
  status?: 'all' | 'completed' | 'processing' | 'pending' | 'failed';
  sortBy?: 'newest' | 'oldest' | 'title';
}

export interface DigestListResponse {
  success: boolean;
  digests: []; // Should be DigestWithStatus[]
  total: number;
  hasMore: boolean;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

// Generic error responses for specific status codes
export interface UnauthorizedResponse extends ApiError {
  code: 'UNAUTHORIZED';
  error: 'Authentication required';
}

export interface BadRequestResponse extends ApiError {
  code: 'BAD_REQUEST';
  error: string;
  details?: string;
}

export interface InternalServerErrorResponse extends ApiError {
  code: 'INTERNAL_SERVER_ERROR';
  error: 'Internal server error';
  details?: string;
}
