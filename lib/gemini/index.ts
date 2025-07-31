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
    // Extract code blocks with language information
    const codeBlocks = Array.from(element.querySelectorAll('code.code-container')).map(codeElement => {
      // Try to detect language from the content or class names
      let language = 'unknown';
      
      // Check if there's a comment indicating the file type
      const firstLine = codeElement.textContent?.trim().split('\n')[0] || '';
      if (firstLine.startsWith('#') && firstLine.includes('.py')) {
        language = 'python';
      } else if (firstLine.includes('.js') || firstLine.includes('.ts')) {
        language = 'javascript';
      } else if (firstLine.includes('.java')) {
        language = 'java';
      } else if (firstLine.includes('.cpp') || firstLine.includes('.c++')) {
        language = 'cpp';
      } else if (firstLine.includes('.c')) {
        language = 'c';
      } else if (firstLine.includes('.go')) {
        language = 'go';
      } else if (firstLine.includes('.rs')) {
        language = 'rust';
      } else if (firstLine.includes('.rb')) {
        language = 'ruby';
      } else if (firstLine.includes('.php')) {
        language = 'php';
      } else if (firstLine.includes('.swift')) {
        language = 'swift';
      } else if (firstLine.includes('.kt')) {
        language = 'kotlin';
      } else if (firstLine.includes('.scala')) {
        language = 'scala';
      } else if (firstLine.includes('.r')) {
        language = 'r';
      } else if (firstLine.includes('.m')) {
        language = 'matlab';
      } else if (firstLine.includes('.sh') || firstLine.includes('.bash')) {
        language = 'bash';
      } else if (firstLine.includes('.sql')) {
        language = 'sql';
      } else if (firstLine.includes('.html')) {
        language = 'html';
      } else if (firstLine.includes('.css')) {
        language = 'css';
      } else if (firstLine.includes('.xml')) {
        language = 'xml';
      } else if (firstLine.includes('.json')) {
        language = 'json';
      } else if (firstLine.includes('.yaml') || firstLine.includes('.yml')) {
        language = 'yaml';
      } else if (firstLine.includes('.md')) {
        language = 'markdown';
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
      tempElement.querySelectorAll('code.code-container').forEach((codeElement, index) => {
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
