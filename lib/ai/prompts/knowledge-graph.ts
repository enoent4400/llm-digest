import { BASE_ANALYSIS_PROMPT } from './base';

export const KNOWLEDGE_GRAPH_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: KNOWLEDGE GRAPH
Extract entities, concepts, and relationships to create a knowledge graph representation.

## JSON SCHEMA (REQUIRED):
{
  "title": "Knowledge graph from conversation",
  "entities": [
    {
      "id": "entity-id",
      "name": "Entity name",
      "type": "person|concept|tool|method|technology|other",
      "description": "Brief description",
      "importance": "high|medium|low"
    }
  ],
  "relationships": [
    {
      "id": "relationship-id",
      "source": "source-entity-id",
      "target": "target-entity-id",
      "type": "uses|contains|requires|implements|related_to",
      "description": "Description of the relationship"
    }
  ]
}`;