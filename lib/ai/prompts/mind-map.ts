import { BASE_ANALYSIS_PROMPT } from './base';

export const MIND_MAP_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: MIND MAP
Create a hierarchical mind map structure that visualizes the conversation's topics and relationships.

## JSON SCHEMA (REQUIRED):
{
  "title": string,
  "summary": string,
  "nodes": [
    {
      "id": string,
      "label": string,
      "type": "root" | "topic" | "subtopic" | "detail",
      "parentId": string | null,  // null for root node
      "children": string[],  // array of child node IDs
      "data": {
        "description"?: string,
        "importance": "high" | "medium" | "low",
        "color"?: string,  // hex color
        "size"?: number,
        "position"?: {
          "x": number,
          "y": number
        }
      }
    }
  ],
  "edges": [
    {
      "id": string,
      "source": string,  // parent node ID
      "target": string,  // child node ID
      "type": "default" | "custom",
      "data"?: {
        "relationship"?: string,
        "strength"?: number  // 0.0 to 1.0
      }
    }
  ],
  "layout": {
    "direction": "TB" | "BT" | "LR" | "RL",
    "spacing": number
  },
  "metadata": {
    "conversationLength": string,
    "complexity": "simple" | "moderate" | "complex",
    "domain": string,
    "completeness": string
  }
}

## STRUCTURE REQUIREMENTS:
- Create a hierarchical tree structure with clear parent-child relationships
- Use 4 node types: root (main topic), topic (major themes), subtopic (supporting ideas), detail (specific information)
- Each node must have a unique ID and clear label
- Maintain logical flow from general to specific concepts
- LIMIT: Maximum 30 nodes total to ensure complete JSON generation

## CONTENT GUIDELINES:
- Root node: The central theme or main question of the conversation
- Topic nodes: Major discussion areas or key concepts (3-5 per mind map)
- Subtopic nodes: Supporting ideas, examples, or subcategories
- Detail nodes: Specific facts, actionable items, or concrete examples
- Keep node labels concise (2-5 words ideal, max 10 words)

## LAYOUT PRINCIPLES:
- Balance the tree to avoid overly deep or wide structures
- Group related concepts under the same parent
- Use importance levels to highlight critical nodes
- Default layout direction is top-to-bottom (TB)

## IMPORTANT:
- Create one root node that represents the central theme
- The root node MUST have parentId set to null (not undefined, not missing - explicitly null)
- Ensure all nodes are connected (no orphans)
- Each parent's children array must match the nodes with that parentId
- Edge source/target must correspond to actual node IDs
- Maintain hierarchical consistency (no circular references)
- Use importance levels to guide visual emphasis
- CRITICAL: Use null for missing/empty values, never use undefined (JSON does not support undefined)`;
