// Simplified Claude conversation parser
// Consolidated from multiple files with only essential functionality

// Types
export interface ClaudeMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  artifacts?: ClaudeArtifact[];
  attachments?: ClaudeAttachment[];
}

export type ArtifactType = 'text' | 'code' | 'html' | 'svg' | 'mermaid';

export interface ClaudeArtifact {
  id: string;
  type: ArtifactType;
  title?: string;
  content: string;
  language?: string;
}

export interface ClaudeAttachment {
  id: string;
  name: string;
  type: string;
  size?: number;
  url?: string;
}

export interface ClaudeConversationMetadata {
  created_at?: string;
  updated_at?: string;
  model?: string;
  token_count?: number;
  [key: string]: unknown;
}

export interface ClaudeConversation {
  id: string;
  title: string;
  messages: ClaudeMessage[];
  metadata: ClaudeConversationMetadata;
  shareUrl: string;
  fingerprint?: string;
  model?: string;
  [key: string]: unknown;
}

export interface ClaudeParsingOptions {
  includeArtifacts?: boolean;
  includeAttachments?: boolean;
  maxMessages?: number;
  timeout?: number;
}

export interface ClaudeParsingResult {
  success: boolean;
  conversation?: ClaudeConversation;
  error?: string;
  code?: string;
}

export class ClaudeParsingError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ClaudeParsingError';
  }
}

// URL validation
const CLAUDE_SHARE_REGEX = /^https:\/\/claude\.ai\/share\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/;

export function isValidClaudeShareUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return CLAUDE_SHARE_REGEX.test(url);
}

function extractConversationId(shareUrl: string): string {
  const match = shareUrl.match(CLAUDE_SHARE_REGEX);
  if (!match) {
    throw new ClaudeParsingError(
      'Invalid Claude share URL format. Expected: https://claude.ai/share/{conversation-id}',
      'INVALID_URL_FORMAT'
    );
  }
  return match[1];
}

// API fetching
const DEFAULT_OPTIONS: ClaudeParsingOptions = {
  includeArtifacts: true,
  includeAttachments: false,
  maxMessages: 1000,
  timeout: 10000
};

async function fetchClaudeApiData(shareUrl: string, options: ClaudeParsingOptions = {}): Promise<unknown> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const conversationId = extractConversationId(shareUrl);
  const apiEndpoint = `https://claude.ai/api/chat_snapshots/${conversationId}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

  try {
    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; LLMDigest/1.0)',
        'Referer': 'https://claude.ai/',
        'Origin': 'https://claude.ai'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new ClaudeParsingError('Conversation not found', 'CONVERSATION_NOT_FOUND');
      }
      if (response.status === 403) {
        throw new ClaudeParsingError('Access denied', 'ACCESS_DENIED');
      }
      if (response.status === 429) {
        throw new ClaudeParsingError('Rate limit exceeded', 'RATE_LIMITED');
      }
      throw new ClaudeParsingError(`HTTP ${response.status}`, 'HTTP_ERROR');
    }

    return await response.json();

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ClaudeParsingError) {
      throw error;
    }
    
    if ((error as { name?: string })?.name === 'AbortError') {
      throw new ClaudeParsingError(`Request timeout after ${opts.timeout}ms`, 'TIMEOUT');
    }
    
    throw new ClaudeParsingError(
      `Network error: ${(error as Error)?.message || 'Unknown error'}`,
      'NETWORK_ERROR'
    );
  }
}

// Data processing
function processMessage(rawMessage: unknown): ClaudeMessage {
  if (!rawMessage || typeof rawMessage !== 'object') {
    throw new ClaudeParsingError('Invalid message data', 'INVALID_MESSAGE');
  }

  const msg = rawMessage as Record<string, unknown>;
  const messageId = (msg.uuid as string) || (msg.id as string) || `msg_${Date.now()}_${Math.random()}`;
  const role = (msg.sender === 'human' || msg.role === 'user') ? 'user' : 'assistant';
  const content = (msg.text as string) || (msg.content as string) || '';
  
  const message: ClaudeMessage = {
    id: messageId,
    role,
    content,
    timestamp: (msg.created_at as string) || (msg.timestamp as string)
  };

  // Process artifacts if present
  if (msg.artifacts && Array.isArray(msg.artifacts)) {
    message.artifacts = msg.artifacts.map((rawArtifact: unknown): ClaudeArtifact => {
      const artifact = rawArtifact as Record<string, unknown>;
      return {
        id: (artifact.id as string) || (artifact.uuid as string) || `artifact_${Date.now()}`,
        type: (artifact.type as ArtifactType) || 'text',
        title: (artifact.title as string) || (artifact.name as string),
        content: (artifact.content as string) || (artifact.text as string) || '',
        language: artifact.language as string
      };
    });
  }

  // Process attachments if present
  if (msg.attachments && Array.isArray(msg.attachments)) {
    message.attachments = msg.attachments as ClaudeAttachment[];
  }

  return message;
}

function processClaudeConversation(rawData: unknown, shareUrl: string, options: ClaudeParsingOptions = {}): ClaudeConversation {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!rawData || typeof rawData !== 'object') {
    throw new ClaudeParsingError('No conversation data received', 'NO_DATA');
  }

  const data = rawData as Record<string, unknown>;
  const conversationId = (data.uuid as string) || (data.id as string) || extractConversationId(shareUrl);
  const title = (data.name as string) || (data.title as string) || 'Claude Conversation';
  
  let messages: ClaudeMessage[] = [];
  if (data.chat_messages && Array.isArray(data.chat_messages)) {
    messages = data.chat_messages
      .map((msg: unknown) => {
        try {
          return processMessage(msg);
        } catch (error) {
          console.warn('Failed to process message:', error);
          return null;
        }
      })
      .filter((msg: ClaudeMessage | null): msg is ClaudeMessage => msg !== null)
      .slice(0, opts.maxMessages);
  }

  return {
    id: conversationId,
    title: title.length > 100 ? title.substring(0, 100) + '...' : title,
    messages,
    metadata: {
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
      model: data.model as string,
      token_count: messages.reduce((total, msg) => total + msg.content.length, 0),
      ...(data.metadata as Record<string, unknown>)
    },
    shareUrl,
    model: data.model as string
  };
}

// Main export function
export async function parseClaudeConversation(
  shareUrl: string,
  options: ClaudeParsingOptions = {}
): Promise<ClaudeParsingResult> {
  try {
    const rawData = await fetchClaudeApiData(shareUrl, options);
    const conversation = processClaudeConversation(rawData, shareUrl, options);
    
    if (conversation.messages.length === 0) {
      throw new ClaudeParsingError('Conversation appears to be empty', 'EMPTY_CONVERSATION');
    }

    return {
      success: true,
      conversation
    };

  } catch (error) {
    if (error instanceof ClaudeParsingError) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
    
    return {
      success: false,
      error: (error as Error)?.message || 'Unknown parsing error',
      code: 'UNKNOWN_ERROR'
    };
  }
}