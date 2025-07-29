import { BASE_ANALYSIS_PROMPT } from './base';

export const MIND_MAP_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: MIND MAP
Create a hierarchical mind map structure that visualizes the conversation's topics and relationships.

## JSON SCHEMA (REQUIRED):
{
  "title": "Central topic or theme",
  "centralNode": {
    "id": "root",
    "text": "Main conversation topic",
    "type": "central"
  },
  "branches": [
    {
      "id": "branch-id",
      "text": "Branch topic",
      "parentId": "root",
      "level": 1,
      "type": "branch|subtopic|detail",
      "children": ["child-node-ids"]
    }
  ]
}`;