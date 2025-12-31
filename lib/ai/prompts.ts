/**
 * Prompt templates for AI flashcard generation
 * These are used by the OpenAI service functions
 */

export const FLASHCARD_GENERATION_PROMPT = (topic: string, context?: string) => `
Generate a single educational flashcard about "${topic}". ${context ? `Context: ${context}` : ''}

Return a JSON object with this exact structure:
{
  "question": "The question text",
  "answer": "The answer text",
  "category": "Optional category name",
  "tech": "Optional technology name (e.g., JavaScript, React)"
}

Make the question clear and educational. The answer should be concise but complete.
`;

export const DOCUMENT_FLASHCARDS_PROMPT = (text: string, maxCards: number) => `
Extract key educational concepts from the following text and create ${maxCards} flashcards.

Text:
${text.substring(0, 8000)}${text.length > 8000 ? '...' : ''}

Return a JSON object with this exact structure:
{
  "flashcards": [
    {
      "question": "Question text",
      "answer": "Answer text",
      "category": "Optional category",
      "tech": "Optional technology"
    }
  ]
}

Create diverse, high-quality flashcards covering the main concepts.
`;

export const FLASHCARD_TRANSFORM_PROMPT = (
  currentQuestion: string,
  currentAnswer: string,
  currentType: string,
  targetType: string,
) => {
  const basePrompt = `Transform this flashcard from "${currentType}" format to "${targetType}" format.

Current Question: ${currentQuestion}
Current Answer: ${currentAnswer}

`;

  switch (targetType) {
    case 'multiple_choice':
      return `${basePrompt}Create a multiple choice question with 4 options. Return JSON:
{
  "question": "The question text",
  "answer": ["correct answer text"],
  "type": "multiple_choice",
  "options": ["option1", "option2", "option3", "option4"]
}`;

    case 'true_false':
      return `${basePrompt}Create a true/false question. Return JSON:
{
  "question": "The question text",
  "answer": "true" or "false",
  "type": "true_false"
}`;

    case 'fill_blank':
      return `${basePrompt}Create a fill-in-the-blank question. Return JSON:
{
  "question": "Question with ___ blank",
  "answer": "The answer",
  "type": "fill_blank"
}`;

    case 'code_snippet':
      return `${basePrompt}Create a code snippet question. Return JSON:
{
  "question": "Question about code (use \`\`\`javascript for code blocks)",
  "answer": "Answer explaining the code",
  "type": "code_snippet"
}`;

    default:
      return `${basePrompt}Create a basic Q&A flashcard. Return JSON:
{
  "question": "The question text",
  "answer": "The answer text",
  "type": "basic"
}`;
  }
};

