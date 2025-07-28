// External package type re-exports and extensions
// Centralized imports and type extensions for external dependencies

// === Package Type Re-exports ===

// Claude Parser package types
export type {
  ClaudeConversation,
  ClaudeMessage,
  ClaudeArtifact,
  ClaudeParsingResult,
  ClaudeParsingOptions
} from '@/lib/claude';

// AI package types
export type {
  DigestResult
} from '@/lib/ai';

// Cache package types (define locally if not exported)
export interface CacheKey {
  key: string;
  tags?: string[];
}

export interface CachePattern {
  pattern: string;
  ttl?: number;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

// Database types are defined locally in our database module

// UI package types (define locally if not exported correctly)
export interface ButtonVariant {
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

// === Database User Types ===
// Removed Supabase types - using PocketBase/local auth instead

// === React Hook Form Types ===

export interface FormRef {
  submit: () => void;
  reset: () => void;
  setFocus: (name: string) => void;
}

// === Framer Motion Types ===

export interface MotionVariants {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animate: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exit?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transition?: any;
}

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  staggerChildren?: number;
}

// === OpenRouter/AI Model Types ===

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: number;
    completion: number;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens?: number;
  };
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant' | 'user' | 'system';
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// === Browser API Types ===

export interface WebGPUInfo {
  supported: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter?: any; // GPUAdapter - WebGPU types not available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  device?: any; // GPUDevice - WebGPU types not available
}

export interface TransformersConfig {
  model: string;
  quantized?: boolean;
  device?: 'auto' | 'gpu' | 'cpu';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progress_callback?: (progress: any) => void;
}

// === IndexedDB Types ===

export interface IDBConfig {
  dbName: string;
  version: number;
  objectStores: Array<{
    name: string;
    keyPath?: string;
    autoIncrement?: boolean;
    indexes?: Array<{
      name: string;
      keyPath: string;
      unique?: boolean;
    }>;
  }>;
}

export interface CachedEmbedding {
  id: string;
  text: string;
  embedding: number[];
  model: string;
  createdAt: number;
  expiresAt?: number;
}

// === Chrome Extension Types ===

export interface ChromeMessage {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
  tabId?: number;
  frameId?: number;
}

export interface ExtensionConfig {
  manifestVersion: 3;
  permissions: string[];
  host_permissions: string[];
  content_scripts: Array<{
    matches: string[];
    js: string[];
    css?: string[];
  }>;
}

// === Webhook Types ===

export interface WebhookPayload {
  event: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  timestamp: string;
  signature?: string;
}

export interface PaddleWebhook {
  alert_name: string;
  alert_id: string;
  checkout_id?: string;
  subscription_id?: string;
  user_id?: string;
  status?: string;
  event_time: string;
}

// === Analytics Types ===

export interface PlausibleEvent {
  name: string;
  url?: string;
  domain?: string;
  props?: Record<string, string | number>;
}

export interface AnalyticsConfig {
  domain: string;
  apiHost?: string;
  trackLocalhost?: boolean;
  exclude?: string[];
}

// === Error Tracking Types ===

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  eventId?: string;
}

export interface ErrorReport {
  error: Error;
  errorInfo: ErrorInfo;
  userId?: string;
  userAgent: string;
  timestamp: string;
  url: string;
}

// === Type Utilities ===

// Utility type to make all properties optional except specified ones
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Utility type to make all properties required except specified ones
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;

// Utility type for async function return types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;
