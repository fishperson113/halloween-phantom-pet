import { ExpressionType } from './ExpressionType.js';

/**
 * Interface representing a structured LLM response with commentary and expression
 */
export interface StructuredCommentaryResponse {
  commentary: string;  // The text to display in the speech bubble
  expression: ExpressionType;  // Which expression animation to show
  sentiment?: number;  // Optional: -1 to 1 scale for fine-grained sentiment
}
