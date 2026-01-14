import OpenAI from 'openai';
import { generateObject, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Vercel AI SDK OpenAI provider
const aiOpenAI = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze with OpenAI using structured output
 * @param prompt - The prompt to send to OpenAI
 * @param schema - Optional Zod schema for structured output
 * @returns Structured response or text
 */
export async function analyzeWithOpenAI<T = string>(
  prompt: string,
  schema?: any
): Promise<T> {
  if (schema) {
    // Use Vercel AI SDK for structured output with schema validation
    const result = await generateObject({
      model: aiOpenAI('gpt-4o-mini'),
      schema,
      prompt,
    });
    return result.object as T;
  } else {
    // Use for text generation
    const result = await generateText({
      model: aiOpenAI('gpt-4o-mini'),
      prompt,
    });
    return result.text as T;
  }
}

/**
 * Chat completion with OpenAI
 * @param messages - Array of messages
 * @param options - Additional options
 * @returns Response content
 */
export async function chatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'json_object' | 'text';
  }
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: options?.model || 'gpt-4o-mini',
    messages,
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.maxTokens,
    ...(options?.responseFormat === 'json_object' && {
      response_format: { type: 'json_object' },
    }),
  });

  return response.choices[0].message.content || '';
}

/**
 * Generate structured JSON response
 * @param systemPrompt - System instructions
 * @param userPrompt - User request
 * @param options - Additional options
 * @returns Parsed JSON response
 */
export async function generateJSON<T = any>(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<T> {
  const response = await openai.chat.completions.create({
    model: options?.model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: options?.temperature ?? 0.3,
  });

  const content = response.choices[0].message.content || '{}';
  return JSON.parse(content) as T;
}

/**
 * Stream text generation from OpenAI
 * @param prompt - The prompt
 * @param onChunk - Callback for each chunk
 */
export async function streamText(
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      onChunk(content);
    }
  }
}

// Export the raw OpenAI client for direct access
export { openai };
