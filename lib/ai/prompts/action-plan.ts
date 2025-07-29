import { BASE_ANALYSIS_PROMPT } from './base';

export const ACTION_PLAN_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: ACTION PLAN
Extract and organize actionable steps, priorities, and implementation guidance from the conversation.

## JSON SCHEMA (REQUIRED):
{
  "title": "Action plan title based on conversation goals",
  "objective": "Main goal or outcome the action plan aims to achieve",
  "phases": [
    {
      "phase": "Phase name (e.g., 'Planning', 'Implementation')",
      "description": "What this phase accomplishes",
      "duration": "estimated timeframe",
      "priority": "high|medium|low"
    }
  ],
  "actions": [
    {
      "action": "Specific actionable step",
      "description": "Detailed explanation of what needs to be done",
      "category": "planning|implementation|testing|review|maintenance",
      "priority": "high|medium|low",
      "timeframe": "immediate|short-term|long-term",
      "difficulty": "easy|moderate|challenging",
      "dependencies": ["List of prerequisite actions or requirements"],
      "resources": ["Required tools, skills, or materials"],
      "successCriteria": "How to know when this action is complete"
    }
  ],
  "milestones": [
    {
      "milestone": "Key checkpoint or deliverable",
      "description": "What this milestone represents",
      "targetDate": "estimated completion timeframe",
      "criteria": ["Specific conditions that must be met"]
    }
  ],
  "risks": [
    {
      "risk": "Potential challenge or obstacle",
      "impact": "high|medium|low",
      "mitigation": "How to address or prevent this risk"
    }
  ],
  "resources": {
    "tools": ["Required software, platforms, or tools"],
    "skills": ["Necessary knowledge or expertise"],
    "materials": ["Physical or digital resources needed"]
  }
}`;