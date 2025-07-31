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
  return Array.from(messageElements).map(element => {
    const role = element.getAttribute('data-turn') as 'user' | 'assistant';

    // Extract code blocks with language information
    const codeBlocks = Array.from(element.querySelectorAll('code')).map(codeElement => {
      const languageMatch = codeElement.className.match(/language-(\w+)/);
      const language = languageMatch ? languageMatch[1] : 'unknown';
      return {
        language: language,
        content: codeElement.textContent?.trim() || ''
      };
    });

    // Get the text content excluding code blocks
    let content = element.textContent?.trim() || '';

    // If we have code blocks, replace them with JSON-friendly formatted versions
    if (codeBlocks.length > 0) {
      // Create a temporary element to manipulate the content
      const tempElement = element.cloneNode(true) as HTMLElement;

      // Replace each code block with a formatted version that's JSON-safe
      tempElement.querySelectorAll('code').forEach((codeElement, index) => {
        const codeBlock = codeBlocks[index];
        // Use a JSON-safe format with escaped characters
        const formattedCode = `
          CODE_BLOCK_START:${codeBlock.language}:${encodeURIComponent(codeBlock.content)}:CODE_BLOCK_END
        `;

        // Replace the code element with a text node containing the formatted code
        const textNode = document.createTextNode(formattedCode);
        codeElement.parentNode?.replaceChild(textNode, codeElement);
      });

      // Get the final content with formatted code blocks
      content = tempElement.textContent?.trim() || '';
    }

    return {
      role: role,
      content: content
    };
  }).filter(msg => msg.content && (msg.role === 'user' || msg.role === 'assistant'));
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
