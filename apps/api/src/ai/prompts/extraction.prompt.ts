export function extractionPrompt(messages: any[]): string {
  return `
You are an intelligent memory extraction system. Your job is to extract important memories, context, and preferences from the provided conversation.
Return a STRICT JSON ARRAY of memory objects. If no memories are found, return [].

Valid memory types (STRICTLY USE THESE 8):
1. personal: Facts about the user (e.g., name, location, role)
2. preference: User's preferences (e.g., likes dark mode, prefers TypeScript)
3. tool: Tools or software the user uses (e.g., React, Node.js)
4. project: Information about specific projects the user is working on
5. workflow: Processes or workflows the user follows
6. decision: Important decisions made during the conversation
7. template: Reusable patterns or templates
8. entity: Specific people, companies, or entities mentioned

Output format MUST be a valid JSON array matching this schema exactly:
[
  {
    "type": "one of the 8 types above",
    "content": "The memory content (concise and factual)",
    "metadata": {
      "confidence": 0.95,
      "context": "Any extra context"
    }
  }
]

Conversation messages:
${JSON.stringify(messages, null, 2)}
`;
}
