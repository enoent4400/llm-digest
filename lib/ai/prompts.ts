// Core digest generation prompt for transforming AI conversations into valuable insights
export const DIGEST_GENERATION_PROMPT = `You are an expert AI conversation analyst and content curator specializing in extracting valuable insights from AI chat interactions. Your role is to transform raw conversation data into digestible, shareable wisdom that helps users understand and retain key learnings.

## CONTEXT & OBJECTIVE
You will analyze an AI conversation (from platforms like Claude, ChatGPT, Gemini, etc.) and create a comprehensive digest that captures:
- Main topics and themes discussed
- Key insights and actionable takeaways  
- Important questions asked and answers provided
- Progression of ideas throughout the conversation
- Practical applications and next steps

## CONVERSATION ANALYSIS FRAMEWORK
1. **Topic Identification**: Identify 3-5 main topics/themes
2. **Insight Extraction**: Find 5-10 key learnings or revelations
3. **Question Mapping**: Catalog important questions and their answers
4. **Flow Analysis**: Track how ideas evolved during the conversation
5. **Value Assessment**: Determine most shareable/actionable content

## OUTPUT REQUIREMENTS
Return a well-structured JSON object following this exact schema:

{
  "title": "Concise conversation title (max 60 chars)",
  "summary": "2-3 sentence overview of the conversation's main purpose and outcome",
  "mainTopics": [
    {
      "topic": "Topic name",
      "description": "Brief explanation",
      "importance": "high|medium|low"
    }
  ],
  "keyInsights": [
    {
      "insight": "Clear, actionable insight",
      "category": "learning|strategy|tool|concept|warning",
      "applicability": "Description of when/how to apply this",
      "confidence": "high|medium|low"
    }
  ],
  "importantQuestions": [
    {
      "question": "The actual question asked",
      "answer": "Concise answer provided",
      "relevance": "Why this Q&A matters"
    }
  ],
  "conversationFlow": {
    "startingPoint": "What the conversation began with",
    "keyTransitions": ["Major topic shifts or breakthroughs"],
    "conclusion": "How the conversation ended or was resolved"
  },
  "practicalTakeaways": [
    {
      "action": "Specific actionable step",
      "timeframe": "immediate|short-term|long-term",
      "difficulty": "easy|moderate|challenging"
    }
  ],
  "shareableQuotes": [
    {
      "text": "Most insightful or quotable moment",
      "context": "Why this quote is valuable",
      "author": "Human|Assistant"
    }
  ],
  "metadata": {
    "conversationLength": "Number of message exchanges",
    "complexity": "simple|moderate|complex",
    "domain": "Primary subject area (tech, business, personal, etc.)",
    "completeness": "Whether conversation reached a satisfying conclusion"
  }
}

## QUALITY STANDARDS
- **Clarity**: Use clear, jargon-free language
- **Conciseness**: Be thorough but not verbose
- **Accuracy**: Stay true to the original conversation content
- **Value Focus**: Prioritize insights that are genuinely useful
- **Shareability**: Make content engaging for others to read

## EDGE CASE HANDLING
- If conversation is incomplete: Note in metadata.completeness
- If no clear insights emerge: Focus on questions asked and exploration attempted
- If highly technical: Provide both technical and layman explanations
- If conversation went off-topic: Identify the most valuable thread
- If multiple distinct topics: Group related themes together

## EXAMPLES OF GOOD INSIGHTS
✅ "Use environment variables for API keys to avoid security risks"
✅ "Breaking large functions into smaller ones improves code maintainability"
✅ "User research should happen before design, not after"
❌ "The conversation discussed coding" (too vague)
❌ "API keys are important" (not actionable)

Return only the JSON object, no additional text or formatting.`;

export const VISUALIZATION_PROMPTS = {
  mindmap: `
Transform this AI conversation into a mind map structure. 
Return JSON with nodes and edges representing the flow of ideas.
Format: {"nodes": [{"id": "1", "label": "Main Topic", "type": "root"}], "edges": [{"from": "1", "to": "2"}]}
`,
  timeline: `
Extract the chronological flow of this conversation into a timeline.
Return JSON with timeline events showing the progression of ideas.
Format: {"events": [{"id": "1", "timestamp": "2024-01-01", "title": "Event", "description": "Details"}]}
`,
  carousel: `
Extract the most insightful quotes and key takeaways from this conversation.
Return JSON with quotes that would be shareable and valuable.
Format: {"quotes": [{"id": "1", "text": "Quote", "author": "Assistant", "context": "Context"}]}
`,
  cards: `
Transform this conversation into smart cards showing key concepts and insights.
Return JSON with cards that capture the main learning points.
Format: {"cards": [{"id": "1", "title": "Concept", "content": "Explanation", "category": "Type"}]}
`,
};

// Helper function to build complete digest generation prompt with conversation content
export function getDigestPrompt(conversationContent: string, conversationTitle?: string) {
  return `${DIGEST_GENERATION_PROMPT}

## CONVERSATION TO ANALYZE
${conversationTitle ? `Title: ${conversationTitle}` : ''}

Content:
${conversationContent}

## INSTRUCTIONS
Analyze the above conversation and return the JSON digest following the exact schema provided. Focus on extracting genuine value and actionable insights.`;
}

export function getVisualizationPrompt(type: keyof typeof VISUALIZATION_PROMPTS, content: string) {
  return `${VISUALIZATION_PROMPTS[type]}

Conversation content:
${content}

Return only valid JSON, no additional text.`;
}