import { BASE_ANALYSIS_PROMPT } from './base';

export const BLOG_POST_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: BLOG POST
Transform the conversation into a well-structured blog post with engaging content.

## JSON SCHEMA (REQUIRED):
{
  "title": "Engaging blog post title",
  "subtitle": "Optional subtitle or tagline",
  "introduction": "Hook and overview paragraph",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Section content in markdown format",
      "type": "introduction|main-content|example|conclusion"
    }
  ],
  "keyTakeaways": ["Main points readers should remember"],
  "tags": ["relevant", "blog", "tags"],
  "targetAudience": "Who this post is written for",
  "readingTime": "estimated-reading-time-minutes"
}`;