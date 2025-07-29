// AI Conversation Digest Generation System
// Supports multiple visualization formats with deterministic JSON outputs

import { EXECUTIVE_SUMMARY_PROMPT } from './executive-summary';
import { ACTION_PLAN_PROMPT } from './action-plan';
import { FAQ_PROMPT } from './faq';
import { MIND_MAP_PROMPT } from './mind-map';
import { KNOWLEDGE_GRAPH_PROMPT } from './knowledge-graph';
import { CODE_ORGANIZATION_PROMPT } from './code-organization';
import { GANTT_CHART_PROMPT } from './gantt-chart';
import { DECISION_TREE_PROMPT } from './decision-tree';
import { BLOG_POST_PROMPT } from './blog-post';

// Format-specific prompts with deterministic JSON schemas
export const DIGEST_FORMAT_PROMPTS = {
  'executive-summary': EXECUTIVE_SUMMARY_PROMPT,
  'action-plan': ACTION_PLAN_PROMPT,
  'faq': FAQ_PROMPT,
  'mind-map': MIND_MAP_PROMPT,
  'knowledge-graph': KNOWLEDGE_GRAPH_PROMPT,
  'code-organization': CODE_ORGANIZATION_PROMPT,
  'gantt-chart': GANTT_CHART_PROMPT,
  'decision-tree': DECISION_TREE_PROMPT,
  'blog-post': BLOG_POST_PROMPT
};

// Helper function to build complete digest generation prompt with conversation content
export function getDigestPrompt(conversationContent: string, conversationTitle?: string, format: keyof typeof DIGEST_FORMAT_PROMPTS = 'executive-summary'): string {
  const formatPrompt = DIGEST_FORMAT_PROMPTS[format];

  return `${formatPrompt}

## CONVERSATION TO ANALYZE
${conversationTitle ? `Title: ${conversationTitle}` : ''}

Content:
${conversationContent}

## IMPORTANT INSTRUCTIONS
1. Analyze the conversation thoroughly
2. Extract content according to the JSON schema above
3. Return ONLY valid JSON (no markdown formatting, no explanations)
4. Ensure all required fields are present
5. Focus on genuine value and actionability`;
}

// Get list of available digest formats
export function getAvailableFormats(): Array<keyof typeof DIGEST_FORMAT_PROMPTS> {
  return Object.keys(DIGEST_FORMAT_PROMPTS) as Array<keyof typeof DIGEST_FORMAT_PROMPTS>;
}

// Validate if a format is supported
export function isValidFormat(format: string): format is keyof typeof DIGEST_FORMAT_PROMPTS {
  return format in DIGEST_FORMAT_PROMPTS;
}