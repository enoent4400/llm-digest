import OpenAI from 'openai';
type ComplexityLevel = 'simple' | 'medium' | 'complex';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || 'test-key',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://llmdigest.ai',
    'X-Title': 'LLMDigest',
  },
});

export interface ModelSelection {
  model: string;
  complexity: ComplexityLevel;
  costPerToken: number;
}

export function getModel(): ModelSelection {
  return {
    model: 'google/gemini-flash-1.5',
    complexity: 'simple', // All conversations treated as simple since we use one model
    costPerToken: 0.000075 // $0.075 per million input tokens
  };
}

export function calculateActualCost(selection: ModelSelection, actualTokens: number): number {
  return selection.costPerToken * actualTokens;
}


export interface TotalCostBreakdown {
  totalCost: number;
  breakdown: {
    simple: number;
    medium: number;
    complex: number;
  };
}

export { openai };
