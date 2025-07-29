import { BASE_ANALYSIS_PROMPT } from './base';

export const CODE_ORGANIZATION_PROMPT = `${BASE_ANALYSIS_PROMPT}

## FORMAT: CODE BLOCKS EXTRACTION
Extract all code blocks from the conversation. Focus on making code copy-paste ready with proper formatting.

**IMPORTANT**: If no code blocks are found, return hasCodeBlocks: false.

## JSON SCHEMA (REQUIRED):
{
  "title": "Code from Chat",
  "hasCodeBlocks": true,
  "summary": "Brief description of the code discussed",
  "blocks": [
    {
      "id": "unique-block-id",
      "filename": "suggested-filename.ext",
      "language": "javascript|python|typescript|html|css|sql|bash|json|yaml|go|rust|java|cpp|csharp|php|ruby|swift|kotlin|other",
      "code": "// Clean, properly formatted code\\nfunction example() {\\n  return 'ready to copy';\\n}",
      "description": "Brief explanation of what this code does",
      "messageIndex": "conversation-message-number-where-code-appeared",
      "blockIndex": "index-of-this-block-within-that-message"
    }
  ],
  "metadata": {
    "totalBlocks": "total-number-of-code-blocks",
    "languages": ["list", "of", "unique", "languages", "found"],
    "conversationLength": "total-messages-in-conversation",
    "complexity": "simple|moderate|complex",
    "domain": "web|backend|mobile|data|devops|other",
    "completeness": "complete|partial|mixed"
  }
}

## ALTERNATE SCHEMA FOR NO CODE:
{
  "title": "No code blocks found",
  "hasCodeBlocks": false,
  "summary": "This conversation did not contain any code blocks",
  "blocks": [],
  "metadata": {
    "totalBlocks": 0,
    "languages": [],
    "conversationLength": "total-messages",
    "complexity": "simple",
    "domain": "discussion",
    "completeness": "n/a"
  }
}

## EXTRACTION GUIDELINES:
1. **File Naming**: Generate descriptive filenames based on code content (e.g., "UserAuth.ts", "api-client.js", "styles.css")
2. **Language Detection**: Identify language from syntax, file extensions, or context
3. **Code Formatting**: Clean up formatting, ensure proper indentation, remove conversation artifacts
4. **Description**: Write a concise explanation of what each code block does
5. **Tracking**: Note the message index and block index within that message for reference

## LANGUAGE MAPPING:
- JavaScript/JS → "javascript"
- TypeScript/TS → "typescript"
- Python/py → "python"
- HTML → "html"
- CSS/SCSS/SASS → "css"
- SQL → "sql"
- Shell/Bash → "bash"
- JSON → "json"
- YAML/YML → "yaml"
- Go → "go"
- Rust → "rust"
- Java → "java"
- C++ → "cpp"
- C -> "c"
- C# → "csharp"
- PHP → "php"
- Ruby → "ruby"
- Swift → "swift"
- Kotlin → "kotlin"
- Unknown/Other → "other"`;
