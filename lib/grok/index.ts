// Grok conversation parser using HTML extraction
import { extractFromPage } from '../parsers/html';
import { ConversationMessage, ProcessedConversation, Platform } from '../platform/types';

interface GrokExtractionOptions {
  timeout?: number;
  includeMetadata?: boolean;
}

const DEFAULT_OPTIONS: Required<GrokExtractionOptions> = {
  timeout: 15000,
  includeMetadata: true
};

export async function parseGrokConversation(
  url: string,
  options: GrokExtractionOptions = {}
): Promise<{ success: boolean; conversation?: ProcessedConversation; error?: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const result = await extractFromPage(url, {
      timeout: opts.timeout,
      waitForSelector: '.response-content-markdown, .message-bubble',
      extractMessages: extractGrokMessages,
      extractTitle: extractGrokTitle
    });
    
    if (result.success && result.conversation) {
      result.conversation.platform = Platform.GROK;
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: `Grok parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function extractGrokMessages(): Promise<ConversationMessage[]> {
  const messages: ConversationMessage[] = [];
  
  // Extract assistant responses from response-content-markdown divs
  const assistantElements = document.querySelectorAll('.response-content-markdown');
  assistantElements.forEach(element => {
    const content = element.textContent?.trim() || '';
    if (content) {
      messages.push({
        role: 'assistant',
        content: content
      });
    }
  });
  
  // Extract user messages from message-bubble divs
  const userElements = document.querySelectorAll('.message-bubble');
  userElements.forEach(element => {
    const content = element.textContent?.trim() || '';
    if (content) {
      messages.push({
        role: 'user',
        content: content
      });
    }
  });
  
  // If no messages found with specific classes, try broader selectors
  if (messages.length === 0) {
    console.log('No messages found with specific selectors, trying fallback selectors');
    
    // Try to find any divs with "prose" class (common for content)
    const proseElements = document.querySelectorAll('.prose');
    proseElements.forEach(element => {
      const content = element.textContent?.trim() || '';
      if (content && content.length > 50) {
        messages.push({
          role: 'assistant', // Default to assistant for prose content
          content: content
        });
      }
    });
    
    // Try to find any divs with "markdown" in the class
    const markdownElements = document.querySelectorAll('[class*="markdown"]');
    markdownElements.forEach(element => {
      const content = element.textContent?.trim() || '';
      if (content && content.length > 50) {
        messages.push({
          role: 'assistant',
          content: content
        });
      }
    });
    
    // Try to find any divs with "message" in the class
    const messageElements = document.querySelectorAll('[class*="message"]');
    messageElements.forEach(element => {
      const content = element.textContent?.trim() || '';
      if (content && content.length > 30) {
        messages.push({
          role: 'user',
          content: content
        });
      }
    });
  }
  
  console.log(`Found ${messages.length} messages in Grok conversation`);
  return messages.filter(msg => msg.content && (msg.role === 'user' || msg.role === 'assistant'));
}

async function extractGrokTitle(): Promise<string> {
  // Try to extract title from the page title
  const titleElement = document.querySelector('title');
  let title = titleElement?.textContent?.trim() || 'Grok Conversation';
  
  // Clean up the title (remove "Grok" prefix if present)
  title = title.replace(/^Grok\s*[-:]\s*/i, '').trim();
  
  // If title is still generic, try to use the first user message
  if (title === 'Grok Conversation' || title === 'Grok' || !title) {
    const firstUserMessage = document.querySelector('.message-bubble');
    if (firstUserMessage) {
      const content = firstUserMessage.textContent?.trim() || '';
      if (content) {
        title = content.slice(0, 100) + (content.length > 100 ? '...' : '');
      }
    }
  }
  
  return title || 'Grok Conversation';
}

export function isValidGrokUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  // Match format: https://grok.com/share/bGVnYWN5_ec3f4beb-b811-4f88-baa8-b283b46ad60f
  return /^https:\/\/grok\.com\/share\/[a-zA-Z0-9_-]+$/.test(url);
}