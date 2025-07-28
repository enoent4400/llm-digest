// Platform types and interfaces
export enum Platform {
  CLAUDE = 'claude',
  CHATGPT = 'chatgpt',
  COPILOT = 'copilot',
  GEMINI = 'gemini',
  GROK = 'grok',
  PERPLEXITY = 'perplexity'
}

export interface PlatformConfig {
  name: string;
  urlPattern: RegExp;
  extractionMethod: 'html' | 'json' | 'md';
  hasInternalApi: boolean;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ProcessedConversation {
  messages: ConversationMessage[];
  title: string;
  platform: Platform;
  model?: string;
  [key: string]: unknown;
}

export interface ExtractionResult {
  success: boolean;
  conversation?: ProcessedConversation;
  error?: string;
  metadata?: {
    extractionTime: number;
    method: string;
    messageCount: number;
  };
}