import { BASE_ANALYSIS_PROMPT } from './base';

export const GANTT_CHART_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: GANTT CHART
Extract project timelines, phases, and dependencies to create a Gantt chart representation.

## JSON SCHEMA (REQUIRED):
{
  "title": "Project title",
  "description": "Brief project overview",
  "timeline": {
    "start": "project-start-timeframe",
    "end": "project-end-timeframe",
    "totalDuration": "estimated-total-duration"
  },
  "phases": [
    {
      "id": "unique-phase-id",
      "name": "Phase name",
      "description": "What this phase accomplishes",
      "startWeek": 1,
      "duration": "duration-in-weeks",
      "priority": "high|medium|low",
      "status": "not-started|in-progress|completed|blocked",
      "dependencies": ["phase-ids-that-must-complete-first"],
      "deliverables": ["key-outputs-from-this-phase"]
    }
  ]
}`;