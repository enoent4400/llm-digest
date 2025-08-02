import { BASE_ANALYSIS_PROMPT } from './base';

export const FAQ_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: FAQ (Frequently Asked Questions)
Extract questions and answers from the conversation and organize them into a comprehensive FAQ format.

## JSON SCHEMA (REQUIRED):
{
  "title": string,
  "description": string,
  "categories": [
    {
      "category": string,
      "questions": [
        {
          "question": string,
          "answer": string,
          "tags": string[],
          "difficulty": "beginner" | "intermediate" | "advanced"
        }
      ]
    }
  ]
}`;
