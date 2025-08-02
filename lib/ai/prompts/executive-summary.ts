import { BASE_ANALYSIS_PROMPT } from './base';

export const EXECUTIVE_SUMMARY_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: EXECUTIVE SUMMARY
Create a comprehensive executive summary that captures the conversation's key insights, topics, and actionable takeaways.

## JSON SCHEMA (REQUIRED):
{
  "title": string,
  "summary": string,
  "mainTopics": [
    {
      "topic": string,
      "description": string,
      "importance": "high" | "medium" | "low"
    }
  ],
  "keyInsights": [
    {
      "insight": string,
      "category": "learning" | "strategy" | "tool" | "concept" | "warning",
      "applicability": string,
      "confidence": "high" | "medium" | "low"
    }
  ],
  "importantQuestions": [
    {
      "question": string,
      "answer": string,
      "relevance": string
    }
  ],
  "conversationFlow": {
    "startingPoint": string,
    "keyTransitions": string[],
    "conclusion": string
  },
  "practicalTakeaways": [
    {
      "action": string,
      "timeframe": "immediate" | "short-term" | "long-term",
      "difficulty": "easy" | "moderate" | "challenging"
    }
  ],
  "shareableQuotes": [
    {
      "text": string,
      "context": string,
      "author": "Human" | "Assistant"
    }
  ],
  "metadata": {
    "conversationLength": number,
    "complexity": "simple" | "moderate" | "complex",
    "domain": string,
    "completeness": "complete" | "partial" | "exploratory"
  }
}`;
