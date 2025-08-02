import { BASE_ANALYSIS_PROMPT } from './base';

export const ACTION_PLAN_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: ACTION PLAN
Extract and organize actionable steps, priorities, and implementation guidance from the conversation.

## JSON SCHEMA (REQUIRED):
{
  "title": string,
  "objective": string,
  "phases": [
    {
      "phase": string,
      "description": string,
      "duration": string,
      "priority": "high" | "medium" | "low"
    }
  ],
  "actions": [
    {
      "action": string,
      "description": string,
      "category": "planning" | "implementation" | "testing" | "review" | "maintenance",
      "priority": "high" | "medium" | "low",
      "timeframe": "immediate" | "short-term" | "long-term",
      "difficulty": "easy" | "moderate" | "challenging",
      "dependencies": string[],
      "resources": string[],
      "successCriteria": string
    }
  ],
  "milestones": [
    {
      "milestone": string,
      "description": string,
      "targetDate": string,
      "criteria": string[]
    }
  ],
  "risks": [
    {
      "risk": string,
      "impact": "high" | "medium" | "low",
      "mitigation": string
    }
  ],
  "resources": {
    "tools": string[],
    "skills": string[],
    "materials": string[]
  }
}`;
