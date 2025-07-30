// Main parsers interface - routes to platform-specific parsers
import { ProcessedConversation, Platform } from '../platform/types';
import { detectPlatform } from '../platform/detection';

// Platform-specific parsers
import { parseChatGptConversation, isValidChatGptUrl } from '../chatgpt';
import { parseGeminiConversation, isValidGeminiUrl } from '../gemini';
import { parseCopilotConversation, isValidCopilotUrl } from '../copilot';
import { parseGrokConversation, isValidGrokUrl } from '../grok';
import { parseClaudeConversation, isValidClaudeShareUrl } from '../claude';

export interface ExtractionResult {
  success: boolean;
  conversation?: ProcessedConversation;
  error?: string;
  platform?: Platform;
  metadata?: {
    extractionTime: number;
    method: string;
    messageCount: number;
  };
}

export async function extractConversation(url: string): Promise<ExtractionResult> {
  const startTime = Date.now();

  try {
    const platformResult = detectPlatform(url);

    if (!platformResult.success) {
      return {
        success: false,
        error: platformResult.error,
        metadata: {
          extractionTime: Date.now() - startTime,
          method: 'unknown',
          messageCount: 0
        }
      };
    }

    const platform = platformResult.platform!;
    let result;

    switch (platform) {
      case Platform.CHATGPT:
        if (!isValidChatGptUrl(url)) {
          return {
            success: false,
            error: 'Invalid ChatGPT URL format',
            metadata: { extractionTime: Date.now() - startTime, method: 'html', messageCount: 0 }
          };
        }
        result = await parseChatGptConversation(url);
        break;

      case Platform.CLAUDE:
        if (!isValidClaudeShareUrl(url)) {
          return {
            success: false,
            error: 'Invalid Claude URL format',
            metadata: { extractionTime: Date.now() - startTime, method: 'json', messageCount: 0 }
          };
        }
        const claudeResult = await parseClaudeConversation(url);
        if (claudeResult.success && claudeResult.conversation) {
          result = {
            success: true,
            conversation: {
              messages: claudeResult.conversation.messages,
              title: claudeResult.conversation.title,
              platform: Platform.CLAUDE
            }
          };
        } else {
          result = { success: false, error: claudeResult.error };
        }
        break;

      case Platform.GEMINI:
        if (!isValidGeminiUrl(url)) {
          return {
            success: false,
            error: 'Invalid Gemini URL format',
            metadata: { extractionTime: Date.now() - startTime, method: 'html', messageCount: 0 }
          };
        }
        result = await parseGeminiConversation(url);
        break;

      case Platform.COPILOT:
        if (!isValidCopilotUrl(url)) {
          return {
            success: false,
            error: 'Invalid Copilot URL format',
            metadata: { extractionTime: Date.now() - startTime, method: 'json', messageCount: 0 }
          };
        }
        result = await parseCopilotConversation(url);
        break;

      case Platform.GROK:
        if (!isValidGrokUrl(url)) {
          return {
            success: false,
            error: 'Invalid Grok URL format',
            metadata: { extractionTime: Date.now() - startTime, method: 'md', messageCount: 0 }
          };
        }
        result = await parseGrokConversation(url);
        break;

      default:
        return {
          success: false,
          error: `Platform ${platform} is not yet supported`,
          metadata: {
            extractionTime: Date.now() - startTime,
            method: 'unknown',
            messageCount: 0
          }
        };
    }

    const extractionTime = Date.now() - startTime;

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        platform,
        metadata: {
          extractionTime,
          method: getMethodForPlatform(platform),
          messageCount: 0
        }
      };
    }

    return {
      success: true,
      conversation: result.conversation,
      platform,
      metadata: {
        extractionTime,
        method: getMethodForPlatform(platform),
        messageCount: result.conversation?.messages.length || 0
      }
    };

  } catch (error) {
    const extractionTime = Date.now() - startTime;
    return {
      success: false,
      error: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: {
        extractionTime,
        method: 'unknown',
        messageCount: 0
      }
    };
  }
}

function getMethodForPlatform(platform: Platform): string {
  switch (platform) {
    case Platform.CHATGPT:
    case Platform.GROK:
    case Platform.GEMINI:
      return 'html';
    case Platform.CLAUDE:
    case Platform.COPILOT:
      return 'json';
    default:
      return 'unknown';
  }
}

// Export individual parsers for direct use
export {
  parseChatGptConversation,
  parseGeminiConversation,
  parseCopilotConversation,
  parseGrokConversation,
  parseClaudeConversation
};

// Re-export types for convenience
export * from '../platform/types';
