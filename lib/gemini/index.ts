// Google Gemini conversation parser
import { extractFromPage } from '../parsers/html';
import { ConversationMessage, ProcessedConversation, Platform } from '../platform/types';

interface GeminiExtractionOptions {
  timeout?: number;
  includeMetadata?: boolean;
}

const DEFAULT_OPTIONS: Required<GeminiExtractionOptions> = {
  timeout: 15000,
  includeMetadata: true
};

export async function parseGeminiConversation(
  url: string,
  options: GeminiExtractionOptions = {}
): Promise<{ success: boolean; conversation?: ProcessedConversation; error?: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    console.log(`Starting Gemini extraction from URL: ${url}`);
    
    const result = await extractFromPage(url, {
      timeout: opts.timeout,
      waitForSelector: '.user-query-container, .response-container',
      extractMessages: extractGeminiMessages,
      extractTitle: extractGeminiTitle
    });

    if (result.success && result.conversation) {
      result.conversation.platform = Platform.GEMINI;
      console.log(`Successfully extracted ${result.conversation.messages.length} messages from Gemini`);
    } else {
      console.log(`Browser extraction failed, error: ${result.error}`);
    }

    return result;
  } catch (error) {
    console.error('Gemini parsing error:', error);
    return {
      success: false,
      error: `Gemini parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function extractGeminiMessages(): Promise<ConversationMessage[]> {
  const messages: ConversationMessage[] = [];
  
  // Extract user messages from elements with 'user-query-container' class
  const userElements = document.querySelectorAll('.user-query-container');
  Array.from(userElements).forEach(element => {
    const content = element.textContent?.trim() || '';
    if (content) {
      messages.push({
        role: 'user',
        content: content
      });
    }
  });
  
  // Extract assistant messages from elements with 'response-container' class
  const assistantElements = document.querySelectorAll('.response-container');
  Array.from(assistantElements).forEach(element => {
    const content = element.textContent?.trim() || '';
    if (content) {
      messages.push({
        role: 'assistant',
        content: content
      });
    }
  });
  
  return messages.filter(msg => msg.content && (msg.role === 'user' || msg.role === 'assistant'));
}

async function extractGeminiTitle(): Promise<string> {
  const titleElement = document.querySelector('title');
  return titleElement?.textContent?.replace(/^Gemini - /, '').trim() || 'Gemini Conversation';
}

export function isValidGeminiUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return /^https:\/\/(g\.co\/gemini\/share|gemini\.google\.com\/share)\/[a-zA-Z0-9]+$/.test(url);
}
