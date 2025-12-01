import { CodeContext } from './CodeContext.js';
import { PetType } from './PetType.js';

/**
 * Interface representing a request for pet commentary
 */
export interface CommentaryRequest {
  codeContext: CodeContext;
  petType: PetType;
  personality: string;
  timestamp: number;
}
