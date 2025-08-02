import { BASE_ANALYSIS_PROMPT } from './base';

export const BLOG_POST_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: BLOG POST
Transform the conversation into a well-structured blog post with engaging content.

## JSON SCHEMA (REQUIRED):
{
  "title": string,
  "subtitle"?: string,
  "introduction": string,
  "sections": [
    {
      "heading": string,
      "content": string,  // markdown format
      "type": "introduction" | "main-content" | "example" | "conclusion"
    }
  ],
  "keyTakeaways": string[],
  "tags": string[],
  "targetAudience": string,
  "readingTime": number  // minutes
}`;
