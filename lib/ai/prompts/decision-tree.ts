import { BASE_ANALYSIS_PROMPT } from './base';

export const DECISION_TREE_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: DECISION TREE
Extract decision points, options, and outcomes from the conversation into a structured decision tree.

## JSON SCHEMA (REQUIRED):
{
  "title": "Decision tree title",
  "rootDecision": {
    "id": "root",
    "question": "Main decision or question",
    "description": "Context for this decision"
  },
  "nodes": [
    {
      "id": "node-id",
      "type": "decision|outcome",
      "question": "Decision question (for decision nodes)",
      "result": "Final outcome (for outcome nodes)",
      "options": [
        {
          "option": "Choice description",
          "leadsTo": "next-node-id",
          "pros": ["advantages"],
          "cons": ["disadvantages"]
        }
      ]
    }
  ]
}`;