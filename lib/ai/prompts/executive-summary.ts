import { BASE_ANALYSIS_PROMPT } from './base';

export const EXECUTIVE_SUMMARY_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: EXECUTIVE SUMMARY
Create a comprehensive executive summary that captures the conversation's key insights, topics, and actionable takeaways.

## JSON SCHEMA (REQUIRED):
{
  "title": "Concise conversation title (max 60 chars)",
  "summary": "2-3 sentence overview of the conversation's main purpose and outcome",
  "mainTopics": [
    {
      "topic": "Topic name",
      "description": "Brief explanation",
      "importance": "high|medium|low"
    }
  ],
  "keyInsights": [
    {
      "insight": "Clear, actionable insight",
      "category": "learning|strategy|tool|concept|warning",
      "applicability": "Description of when/how to apply this",
      "confidence": "high|medium|low"
    }
  ],
  "importantQuestions": [
    {
      "question": "The actual question asked",
      "answer": "Concise answer provided",
      "relevance": "Why this Q&A matters"
    }
  ],
  "conversationFlow": {
    "startingPoint": "What the conversation began with",
    "keyTransitions": ["Major topic shifts or breakthroughs"],
    "conclusion": "How the conversation ended or was resolved"
  },
  "practicalTakeaways": [
    {
      "action": "Specific actionable step",
      "timeframe": "immediate|short-term|long-term",
      "difficulty": "easy|moderate|challenging"
    }
  ],
  "shareableQuotes": [
    {
      "text": "Most insightful or quotable moment",
      "context": "Why this quote is valuable",
      "author": "Human|Assistant"
    }
  ],
  "metadata": {
    "conversationLength": "Number of message exchanges",
    "complexity": "simple|moderate|complex",
    "domain": "Primary subject area (tech, business, personal, etc.)",
    "completeness": "complete|partial|exploratory"
  }
}`;