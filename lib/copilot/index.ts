// Microsoft Copilot conversation parser
import { fetchContent } from '../utils/http-client';
import { ConversationMessage, ProcessedConversation, Platform } from '../platform/types';

interface CopilotExtractionOptions {
  timeout?: number;
  includeMetadata?: boolean;
}

const DEFAULT_OPTIONS: Required<CopilotExtractionOptions> = {
  timeout: 15000,
  includeMetadata: true
};

export async function parseCopilotConversation(
  url: string,
  options: CopilotExtractionOptions = {}
): Promise<{ success: boolean; conversation?: ProcessedConversation; error?: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Copilot has internal API endpoints - use JSON extraction
    const apiUrl = convertShareUrlToApiUrl(url);
    const response = await fetchContent(apiUrl, { timeout: opts.timeout });
    console.log('Copilot API response:', response);
    console.log('URL', apiUrl)

    if (!response.success) {
      return {
        success: false,
        error: `Failed to fetch Copilot data: ${response.error}`
      };
    }

    if (!response.content) {
      return {
        success: false,
        error: 'No content received from Copilot API'
      };
    }

    const conversation = await processCopilotData(JSON.parse(response.content));

    return {
      success: true,
      conversation
    };
  } catch (error) {
    return {
      success: false,
      error: `Copilot parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

function convertShareUrlToApiUrl(shareUrl: string): string {
  // Extract conversation ID and convert to internal API endpoint
  const conversationId = extractCopilotConversationId(shareUrl);
  return `https://copilot.microsoft.com/c/api/conversations/shares/${conversationId}`;
}

function extractCopilotConversationId(url: string): string {
  // Extract conversation ID from share URL: https://copilot.microsoft.com/shares/<conversationId>
  const match = url.match(/\/shares\/([^/?]+)/);
  if (!match) {
    throw new Error('Invalid Copilot share URL format');
  }
  return match[1];
}

async function processCopilotData(data: unknown): Promise<ProcessedConversation> {
  const dataObj = data as {
    conversationTitle?: string;
    messages?: Array<{
      id: string;
      author: 'ai' | 'human';
      createdAt: string;
      content: Array<{
        type: 'text' | 'image';
        text?: string;
        url?: string;
      }>;
    }>;
  };

  if (!dataObj.messages || !Array.isArray(dataObj.messages)) {
    throw new Error('Invalid Copilot conversation data: messages not found');
  }

  const title = dataObj.conversationTitle || 'Microsoft Copilot Conversation';
  
  // Convert Copilot messages to our standard format
  const messages: ConversationMessage[] = dataObj.messages
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // Sort by timestamp
    .map((msg): ConversationMessage => {
      // Combine all text content from the message parts
      const textContent = msg.content
        .filter(part => part.type === 'text' && part.text)
        .map(part => part.text)
        .join('\n');

      // Check for images
      const hasImages = msg.content.some(part => part.type === 'image');
      const imageNote = hasImages ? '\n\n[Note: This message contained images that are not included in the digest]' : '';

      return {
        role: msg.author === 'human' ? 'user' : 'assistant',
        content: textContent + imageNote,
        timestamp: msg.createdAt
      };
    })
    .filter(msg => msg.content.trim() !== ''); // Remove empty messages

  if (messages.length === 0) {
    throw new Error('No valid messages found in Copilot conversation');
  }

  return {
    messages,
    title,
    platform: Platform.COPILOT
  };
}

export function isValidCopilotUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return /^https:\/\/copilot\.microsoft\.com\/shares\/[a-zA-Z0-9_-]+$/.test(url);
}
