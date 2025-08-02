import { BASE_ANALYSIS_PROMPT } from './base';

export const KNOWLEDGE_GRAPH_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: KNOWLEDGE GRAPH
Extract entities, concepts, and relationships to create a knowledge graph representation.

## JSON SCHEMA (REQUIRED):
{
  "title": string,
  "entities": [
    {
      "id": string,
      "name": string,
      "type": "person" | "concept" | "tool" | "method" | "technology" | "other",
      "description": string,
      "importance": "high" | "medium" | "low"
    }
  ],
  "relationships": [
    {
      "id": string,
      "source": string,
      "target": string,
      "type": "uses" | "contains" | "requires" | "implements" | "related_to",
      "description": string
    }
  ]
}`;
