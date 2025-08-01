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
      waitForSelector: '.message, .content, .text, .query-container, .model-response',
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

  // Try multiple selectors for user messages
  const userSelectors = [
    '.user-query-container',
    '[data-role="user"]',
    '.query-container',
    '.message-container[data-message-author="user"]',
    '.message-container.user',
    '[data-message-author="user"]',
    '.request-container',
    '.user-message'
  ];

  // Try multiple selectors for assistant messages
  const assistantSelectors = [
    '.response-container',
    '[data-role="assistant"]',
    '.model-response',
    '.message-container[data-message-author="assistant"]',
    '.message-container.assistant',
    '[data-message-author="assistant"]',
    '.gemini-response',
    '.assistant-message'
  ];

  // Try to find user messages with various selectors
  let userElements: NodeListOf<Element> | null = null;
  for (const selector of userSelectors) {
    userElements = document.querySelectorAll(selector);
    if (userElements.length > 0) {
      console.log(`Found ${userElements.length} user elements with selector: ${selector}`);
      // Log first few elements' content for debugging
      Array.from(userElements).slice(0, 3).forEach((el, i) => {
        console.log(`User element ${i + 1} content preview: ${el.textContent?.substring(0, 100) || 'empty'}`);
      });
      break;
    }
  }

  if (userElements && userElements.length > 0) {
    Array.from(userElements).forEach(element => {
      const content = element.textContent?.trim() || '';
      if (content) {
        messages.push({
          role: 'user',
          content: content
        });
      }
    });
  }

  // Try to find assistant messages with various selectors
  let assistantElements: NodeListOf<Element> | null = null;
  for (const selector of assistantSelectors) {
    assistantElements = document.querySelectorAll(selector);
    if (assistantElements.length > 0) {
      console.log(`Found ${assistantElements.length} assistant elements with selector: ${selector}`);
      // Log first few elements' content for debugging
      Array.from(assistantElements).slice(0, 3).forEach((el, i) => {
        console.log(`Assistant element ${i + 1} content preview: ${el.textContent?.substring(0, 100) || 'empty'}`);
      });
      break;
    }
  }

  if (assistantElements && assistantElements.length > 0) {
    Array.from(assistantElements).forEach(element => {
      // Extract code blocks with language information
      const codeBlocks = Array.from(element.querySelectorAll('code')).map(codeElement => {
        // Try to detect language from the content or class names
        let language = 'unknown';

        // Check for explicit language attributes or classes
        if (codeElement.className.includes('language-')) {
          language = codeElement.className.split('language-')[1].split(' ')[0];
        } else if (codeElement.getAttribute('data-language')) {
          language = codeElement.getAttribute('data-language') || 'unknown';
        }

        // Check if there's a comment indicating the file type
        const firstLine = codeElement.textContent?.trim().split('\n')[0] || '';
        if (firstLine.startsWith('#')) {
          // More precise file extension matching to avoid substring matches
          if (/\.(py|pyw|py3)$/.test(firstLine)) {
            language = 'python';
          } else if (/\.(js|ts|jsx|tsx)$/.test(firstLine)) {
            language = 'javascript';
          } else if (/\.(java)$/.test(firstLine)) {
            language = 'java';
          } else if (/\.(cpp|c\+\+|cc|cxx)$/.test(firstLine)) {
            language = 'cpp';
          } else if (/\.(c|h)$/.test(firstLine)) {
            language = 'c';
          } else if (/\.(go)$/.test(firstLine)) {
            language = 'go';
          } else if (/\.(rs)$/.test(firstLine)) {
            language = 'rust';
          } else if (/\.(rb)$/.test(firstLine)) {
            language = 'ruby';
          } else if (/\.(php)$/.test(firstLine)) {
            language = 'php';
          } else if (/\.(swift)$/.test(firstLine)) {
            language = 'swift';
          } else if (/\.(kt|kts)$/.test(firstLine)) {
            language = 'kotlin';
          } else if (/\.(scala)$/.test(firstLine)) {
            language = 'scala';
          } else if (/\.(r)$/.test(firstLine)) {
            language = 'r';
          } else if (/\.(m)$/.test(firstLine)) {
            language = 'matlab';
          } else if (/\.(sh|bash)$/.test(firstLine)) {
            language = 'bash';
          } else if (/\.(sql)$/.test(firstLine)) {
            language = 'sql';
          } else if (/\.(html|htm)$/.test(firstLine)) {
            language = 'html';
          } else if (/\.(css)$/.test(firstLine)) {
            language = 'css';
          } else if (/\.(xml)$/.test(firstLine)) {
            language = 'xml';
          } else if (/\.(json)$/.test(firstLine)) {
            language = 'json';
          } else if (/\.(yaml|yml)$/.test(firstLine)) {
            language = 'yaml';
          } else if (/\.(md|markdown)$/.test(firstLine)) {
            language = 'markdown';
          }
        }

        // Also check for hljs classes that might indicate language
        const hljsClasses = Array.from(codeElement.querySelectorAll('[class*="hljs-"]'));
        if (hljsClasses.length > 0 && language === 'unknown') {
          // Common patterns in hljs classes can help identify language
          const classText = hljsClasses.map(el => el.className).join(' ');
          if (classText.includes('hljs-keyword') && classText.includes('hljs-built_in')) {
            language = 'python'; // Good default for many languages
          }
        }

        return {
          language: language,
          content: codeElement.textContent?.trim() || ''
        };
      });

      // Get the text content
      let content = element.textContent?.trim() || '';

      // If we have code blocks, replace them with JSON-friendly formatted versions
      if (codeBlocks.length > 0) {
        // Create a temporary element to manipulate the content
        const tempElement = element.cloneNode(true) as HTMLElement;

        // Replace each code block with a formatted version that's JSON-safe
        tempElement.querySelectorAll('code').forEach((codeElement, index) => {
          const codeBlock = codeBlocks[index];
          if (codeBlock) {
            // Use a JSON-safe format with escaped characters
            const formattedCode = `
              CODE_BLOCK_START:${codeBlock.language}:${encodeURIComponent(codeBlock.content)}:CODE_BLOCK_END
            `;

            // Replace the code element with a text node containing the formatted code
            const textNode = document.createTextNode(formattedCode);
            codeElement.parentNode?.replaceChild(textNode, codeElement);
          }
        });

        // Get the final content with formatted code blocks
        content = tempElement.textContent?.trim() || '';
      }

      if (content) {
        messages.push({
          role: 'assistant',
          content: content
        });
      }
    });
  }

  // If we still haven't found messages, try a more general approach
  if (messages.length === 0) {
    console.log('Trying general approach to find messages...');

    // Look for any elements that might contain messages
    const messageContainers = document.querySelectorAll('.message, .msg, .content, .text, .query, .response');
    console.log(`Found ${messageContainers.length} potential message containers with general selectors`);

    if (messageContainers.length > 0) {
      // Log first few elements' content and classes for debugging
      Array.from(messageContainers).slice(0, 5).forEach((el, i) => {
        console.log(`General element ${i + 1} classes: ${Array.from(el.classList).join(', ')}`);
        console.log(`General element ${i + 1} content preview: ${el.textContent?.substring(0, 100) || 'empty'}`);
      });

      // Try to determine role based on structure or classes
      Array.from(messageContainers).forEach(element => {
        const text = element.textContent?.trim() || '';
        if (text) {
          // Try to determine if this is a user or assistant message
          let role: 'user' | 'assistant' = 'assistant';

          // Check for user indicators
          if (
            element.classList.contains('user') ||
            element.getAttribute('data-role') === 'user' ||
            element.closest('[data-message-author="user"]') ||
            element.closest('.query-container') ||
            element.classList.contains('request')
          ) {
            role = 'user';
          }

          messages.push({
            role: role,
            content: text
          });
        }
      });
    }
  }

  console.log(`Total messages extracted: ${messages.length}`);
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
  return /^https:\/\/(g\.co\/gemini\/share|gemini\.google\.com\/(share|app))\/[a-zA-Z0-9]+/.test(url);
}
