import { BASE_ANALYSIS_PROMPT } from './base';

export const FAQ_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: FAQ (Frequently Asked Questions)
Extract questions and answers from the conversation and organize them into a comprehensive FAQ format.

## JSON SCHEMA (REQUIRED):
{
  "title": "FAQ title based on conversation topic",
  "description": "Brief overview of what this FAQ covers",
  "categories": [
    {
      "category": "Category name",
      "questions": [
        {
          "question": "The actual question asked",
          "answer": "Comprehensive answer provided",
          "tags": ["relevant", "topic", "tags"],
          "difficulty": "beginner|intermediate|advanced"
        }
      ]
    }
  ]
}`;