// ChatGPT conversation parser using HTML extraction
import { extractFromPage } from '../parsers/html';
import { ConversationMessage, ProcessedConversation, Platform } from '../platform/types';

interface ChatGptExtractionOptions {
  timeout?: number;
  includeMetadata?: boolean;
}

const DEFAULT_OPTIONS: Required<ChatGptExtractionOptions> = {
  timeout: 15000,
  includeMetadata: true
};

export async function parseChatGptConversation(
  url: string,
  options: ChatGptExtractionOptions = {}
): Promise<{ success: boolean; conversation?: ProcessedConversation; error?: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const result = await extractFromPage(url, {
      timeout: opts.timeout,
      waitForSelector: '[data-turn]',
      extractMessages: extractChatGptMessages,
      extractTitle: extractChatGptTitle
    });
    
    if (result.success && result.conversation) {
      result.conversation.platform = Platform.CHATGPT;
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: `ChatGPT parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function extractChatGptMessages(): Promise<ConversationMessage[]> {
  const messageElements = document.querySelectorAll('[data-turn]');
  return Array.from(messageElements).map(element => ({
    role: element.getAttribute('data-turn') as 'user' | 'assistant',
    content: element.textContent?.trim() || ''
  })).filter(msg => msg.content && (msg.role === 'user' || msg.role === 'assistant'));
}

async function extractChatGptTitle(): Promise<string> {
  const titleElement = document.querySelector('title');
  return titleElement?.textContent?.replace(/^ChatGPT - /, '').trim() || 'ChatGPT Conversation';
}

// URL validation
export function isValidChatGptUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return /^https:\/\/chatgpt\.com\/share\/[a-f0-9-]+$/.test(url);
}
