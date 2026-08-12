import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FlashcardGenerationResult {
  question: string;
  answer: string;
  category?: string;
  tech?: string;
}

export interface FlashcardTransformResult {
  question: string;
  answer: string | string[];
  type: 'basic' | 'multiple_choice' | 'true_false' | 'fill_blank' | 'code_snippet';
  options?: string[];
}

export interface DocumentFlashcardsResult {
  flashcards: FlashcardGenerationResult[];
}

export type GenerateFlashcardExistingCard = {
  question: string;
  answer: string;
};

export type GenerateFlashcardOptions = {
  /** Q&A pairs already in the deck; model must not repeat or closely paraphrase these. */
  existingCards?: GenerateFlashcardExistingCard[];
};

function truncateForPrompt(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

/**
 * Generate a flashcard from user-provided topic/context
 */
export async function generateFlashcard(
  topic: string,
  context?: string,
  options?: GenerateFlashcardOptions,
): Promise<FlashcardGenerationResult> {
  const maxExistingInPrompt = 60;
  const rawExisting = options?.existingCards ?? [];
  const trimmedExisting = rawExisting.slice(0, maxExistingInPrompt).map((c) => ({
    question: truncateForPrompt(c.question, 280),
    answer: truncateForPrompt(c.answer, 280),
  }));

  let userPrompt = `Generate a single educational flashcard about "${topic}". ${context ? `Context: ${context}` : ''}

CRITICAL — Format: basic Q&A only. One clear question and one concise plain-text answer. Do not produce multiple choice, true/false wording, fill-in-the-blank with blanks, or code-snippet style cards.`;

  if (trimmedExisting.length > 0) {
    userPrompt += `

The following question/answer pairs are ALREADY in this deck. You MUST create a different card: another angle, subtopic, or detail within the same topic. Do not repeat or closely paraphrase any existing question or answer.

`;
    trimmedExisting.forEach((c, i) => {
      userPrompt += `${i + 1}. Q: ${c.question}\n   A: ${c.answer}\n`;
    });
  }

  userPrompt += `

Return a JSON object with this exact structure:
{
  "question": "The question text",
  "answer": "The answer text",
  "category": "Optional category name",
  "tech": "Optional technology name (e.g., JavaScript, React)"
}

Make the question clear and educational. The answer should be concise but complete.`;

  const temperature = trimmedExisting.length > 0 ? 0.85 : 0.7;

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are an educational assistant that creates high-quality basic Q&A flashcards (plain question + short text answer only). Always return valid JSON.',
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature,
        response_format: { type: 'json_object' },
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content) as FlashcardGenerationResult;
      
      // Validate required fields
      if (!result.question || !result.answer) {
        throw new Error('Invalid flashcard structure from AI');
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on validation errors or syntax errors
      if (error instanceof SyntaxError || lastError.message.includes('Invalid flashcard')) {
        throw lastError;
      }
      
      // Retry on API errors (rate limits, network issues)
      if (error instanceof OpenAI.APIError) {
        if (attempt < maxRetries && (error.status === 429 || error.status === 500 || error.status === 503)) {
          // Exponential backoff: wait 1s, 2s, 4s
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
          continue;
        }
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      
      // For other errors, retry once
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
      
      throw lastError;
    }
  }
  
  throw lastError || new Error('Failed to generate flashcard after retries');
}

/**
 * Generate multiple flashcards from document text
 */
export async function generateFlashcardsFromText(
  text: string,
  maxCards: number = 10,
): Promise<FlashcardGenerationResult[]> {
  const prompt = `Extract key educational concepts from the following text and create ${maxCards} flashcards.

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

Create diverse, high-quality flashcards covering the main concepts.`;

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an educational assistant that extracts key concepts and creates flashcards. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content) as DocumentFlashcardsResult;
      
      if (!Array.isArray(result.flashcards)) {
        throw new Error('Invalid flashcards array from AI');
      }

      // Validate and limit results
      const validFlashcards = result.flashcards
        .filter((card) => card.question && card.answer)
        .slice(0, maxCards);

      if (validFlashcards.length === 0) {
        throw new Error('No valid flashcards generated');
      }

      return validFlashcards;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on validation errors
      if (lastError.message.includes('No valid flashcards') || error instanceof SyntaxError) {
        throw lastError;
      }
      
      // Retry on API errors
      if (error instanceof OpenAI.APIError) {
        if (attempt < maxRetries && (error.status === 429 || error.status === 500 || error.status === 503)) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
          continue;
        }
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
      
      throw lastError;
    }
  }
  
  throw lastError || new Error('Failed to generate flashcards after retries');
}

/**
 * Transform a flashcard to a different format
 */
export async function transformFlashcard(
  currentQuestion: string,
  currentAnswer: string,
  currentType: string,
  targetType: 'basic' | 'multiple_choice' | 'true_false' | 'fill_blank' | 'code_snippet',
): Promise<FlashcardTransformResult> {
  let prompt = `Transform this flashcard from "${currentType}" format to "${targetType}" format.

Current Question: ${currentQuestion}
Current Answer: ${currentAnswer}

`;

  if (targetType === 'multiple_choice') {
    prompt += `Create a multiple choice question with 4 options. Return JSON:
{
  "question": "The question text",
  "answer": ["correct answer text"],
  "type": "multiple_choice",
  "options": ["option1", "option2", "option3", "option4"]
}`;
  } else if (targetType === 'true_false') {
    prompt += `Create a true/false question. Return JSON:
{
  "question": "The question text",
  "answer": "true" or "false",
  "type": "true_false"
}`;
  } else if (targetType === 'fill_blank') {
    prompt += `Create a fill-in-the-blank question. Return JSON:
{
  "question": "Question with ___ blank",
  "answer": "The answer",
  "type": "fill_blank"
}`;
  } else if (targetType === 'code_snippet') {
    prompt += `Create a code snippet question. Return JSON:
{
  "question": "Question about code (use \`\`\`javascript for code blocks)",
  "answer": "Answer explaining the code",
  "type": "code_snippet"
}`;
  } else {
    prompt += `Create a basic Q&A flashcard. Return JSON:
{
  "question": "The question text",
  "answer": "The answer text",
  "type": "basic"
}`;
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an educational assistant that transforms flashcards between formats. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content) as FlashcardTransformResult;
      
      // Validate required fields
      if (!result.question || !result.answer || !result.type) {
        throw new Error('Invalid flashcard structure from AI');
      }

      // Ensure type matches target
      result.type = targetType;

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on validation errors
      if (lastError.message.includes('Invalid flashcard') || error instanceof SyntaxError) {
        throw lastError;
      }
      
      // Retry on API errors
      if (error instanceof OpenAI.APIError) {
        if (attempt < maxRetries && (error.status === 429 || error.status === 500 || error.status === 503)) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
          continue;
        }
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
      
      throw lastError;
    }
  }
  
  throw lastError || new Error('Failed to transform flashcard after retries');
}

export { openai };


