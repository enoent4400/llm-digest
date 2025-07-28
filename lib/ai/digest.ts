// Universal conversation interface that works with any platform
interface UniversalConversation {
  id: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  fingerprint?: string;
}
import { getModel, calculateActualCost, type TotalCostBreakdown, openai } from './router';
import { getDigestPrompt } from './prompts';

export interface DigestResult {
  digest: string;
  modelUsed: string;
  complexity: string;
  cost: number;
  fallbackUsed: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    openRouterCost?: number;
  };
}

export async function createDigest(conversation: UniversalConversation): Promise<DigestResult> {
  // Step 1: Get model (simplified - no complexity analysis needed)
  const modelSelection = getModel();

  // Step 2: Prepare conversation content for AI analysis
  const conversationContent = conversation.messages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n\n');

  // Step 3: Generate digest using OpenRouter API with retry logic
  const prompt = getDigestPrompt(conversationContent, conversation.title);
  
  let response;
  let retries = 3;
  
  while (retries > 0) {
    try {
      response = await openai.chat.completions.create({
        model: modelSelection.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        // Enable OpenRouter usage accounting
        ...({ usage: { include: true } } as Record<string, unknown>),
      });
      break; // Success, exit retry loop
    } catch (error: unknown) {
      console.log(`OpenRouter API attempt failed, retries left: ${retries - 1}`, error instanceof Error ? error.message : String(error));
      retries--;
      if (retries === 0) throw error; // Re-throw if no retries left
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
    }
  }

  if (!response) {
    throw new Error('Failed to get response from OpenRouter API after retries');
  }

  // Log the full response structure for debugging
  console.log('OpenRouter API response structure:', {
    hasChoices: !!response.choices,
    choicesLength: response.choices?.length,
    responseKeys: Object.keys(response),
    firstChoice: response.choices?.[0] ? Object.keys(response.choices[0]) : 'no choices'
  });

  // Validate response structure
  if (!response.choices || !Array.isArray(response.choices) || response.choices.length === 0) {
    console.error('Invalid OpenRouter response structure:', response);
    
    // If response has an error field, show that specifically
    if ('error' in response) {
      const errorMsg = typeof response.error === 'string' ? response.error : 
                      typeof response.error === 'object' && response.error && 'message' in response.error ? 
                      String(response.error.message) : JSON.stringify(response.error);
      throw new Error(`OpenRouter API error: ${errorMsg}`);
    }
    
    throw new Error(`Invalid OpenRouter API response: missing or empty choices array. Response keys: ${Object.keys(response).join(', ')}`);
  }

  const digest = response.choices[0]?.message?.content || '{}';
  const usage = response.usage;
  const tokenUsage = usage?.total_tokens || 0;
  
  // Use OpenRouter's cost if available, otherwise fallback to our calculation
  const cost = (usage as { cost?: number })?.cost || calculateActualCost(modelSelection, tokenUsage);

  return {
    digest,
    modelUsed: modelSelection.model,
    complexity: modelSelection.complexity,
    cost,
    fallbackUsed: false,
    usage: usage ? {
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      openRouterCost: (usage as { cost?: number })?.cost,
    } : undefined,
  };
}


export function calculateDigestCosts(results: DigestResult[]): TotalCostBreakdown {
  const breakdown = { simple: 0, medium: 0, complex: 0 };
  let totalCost = 0;

  for (const result of results) {
    totalCost += result.cost;
    breakdown[result.complexity as keyof typeof breakdown] += result.cost;
  }

  return { totalCost, breakdown };
}
