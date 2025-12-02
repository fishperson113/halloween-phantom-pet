import { z } from 'zod';
import { ExpressionType } from './ExpressionType.js';
import { StructuredCommentaryResponse } from './StructuredCommentaryResponse.js';

/**
 * Zod schema for validating structured LLM responses
 */
export const CommentaryResponseSchema = z.object({
  commentary: z.string().min(1).max(200),
  expression: z.enum(['happy', 'neutral', 'concerned']),
  sentiment: z.number().min(-1).max(1).optional()
});

/**
 * Type guard to check if a value is a valid ExpressionType
 */
function isValidExpression(value: string): value is ExpressionType {
  return value === 'happy' || value === 'neutral' || value === 'concerned';
}

/**
 * Parses and validates a structured LLM response
 * @param rawResponse The raw response string from the LLM
 * @returns A validated StructuredCommentaryResponse
 */
export function parseStructuredResponse(rawResponse: string): StructuredCommentaryResponse {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(rawResponse);
    
    // Validate against schema
    const validated = CommentaryResponseSchema.parse(parsed);
    
    // Convert to our interface type
    return {
      commentary: validated.commentary,
      expression: validated.expression as ExpressionType,
      sentiment: validated.sentiment
    };
  } catch (error) {
    // Log the parsing failure for debugging
    console.warn('[CommentaryResponseSchema] Failed to parse structured response:', error);
    console.warn('[CommentaryResponseSchema] Raw response:', rawResponse);
    
    // Fallback: use the raw response as commentary with neutral expression
    return {
      commentary: rawResponse.substring(0, 200), // Truncate to max length
      expression: ExpressionType.Neutral
    };
  }
}

/**
 * Validates if a response string is a valid structured response
 * @param rawResponse The raw response string to validate
 * @returns True if the response is valid, false otherwise
 */
export function isValidStructuredResponse(rawResponse: string): boolean {
  try {
    const parsed = JSON.parse(rawResponse);
    CommentaryResponseSchema.parse(parsed);
    return true;
  } catch {
    return false;
  }
}
