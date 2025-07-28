// JSON extraction for platforms with internal APIs
import { ProcessedConversation, Platform } from '../platform/types';
import { isValidClaudeShareUrl, parseClaudeConversation } from '../claude';

export async function extractFromJson(
  url: string,
  platform: string
): Promise<{ success: boolean; conversation?: ProcessedConversation; error?: string }> {
  try {
    switch (platform) {
      case 'claude':
        return await extractClaudeConversation(url);

      case 'copilot':
        return await extractCopilotConversation();

      default:
        return {
          success: false,
          error: `JSON extraction not implemented for platform: ${platform}`
        };
    }
  } catch (error) {
    return {
      success: false,
      error: `JSON extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function extractClaudeConversation(url: string) {
  // Use existing Claude parser

  if (!isValidClaudeShareUrl(url)) {
    return {
      success: false,
      error: 'Invalid Claude share URL format'
    };
  }

  const result = await parseClaudeConversation(url, {
    includeArtifacts: true,
    includeAttachments: false,
    maxMessages: 100,
    timeout: 15000
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error
    };
  }

  const conversation = result.conversation!;

  return {
    success: true,
    conversation: {
      messages: conversation.messages,
      title: conversation.title || 'Claude Conversation',
      platform: Platform.CLAUDE,
      model: conversation.model
    }
  };
}

async function extractCopilotConversation() {
  // Placeholder for Copilot internal API extraction
  return {
    success: false,
    error: 'Copilot extraction not yet implemented'
  };
}
