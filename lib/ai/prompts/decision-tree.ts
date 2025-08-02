import { BASE_ANALYSIS_PROMPT } from './base';

export const DECISION_TREE_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: DECISION TREE
Extract decision points, options, and outcomes from the conversation into a structured decision tree.

## JSON SCHEMA (REQUIRED):
{
  "title": string,
  "rootDecision": {
    "id": string,
    "question": string,
    "description": string
  },
  "nodes": [
    {
      "id": string,
      "type": "decision" | "outcome",
      "question"?: string,
      "result"?: string,
      "options": [
        {
          "option": string,
          "leadsTo": string,
          "pros": string[],
          "cons": string[]
        }
      ]
    }
  ]
}`;
