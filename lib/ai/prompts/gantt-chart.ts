import { BASE_ANALYSIS_PROMPT } from './base';

export const GANTT_CHART_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: GANTT CHART
Extract project timelines, phases, and dependencies to create a Gantt chart representation.

## JSON SCHEMA (REQUIRED):
{
  "title": string,
  "description": string,
  "timeline": {
    "start": string,
    "end": string,
    "totalDuration": string
  },
  "phases": [
    {
      "id": string,
      "name": string,
      "description": string,
      "startWeek": number,
      "duration": number,
      "priority": "high" | "medium" | "low",
      "status": "not-started" | "in-progress" | "completed" | "blocked",
      "dependencies": string[],
      "deliverables": string[]
    }
  ]
}`;
