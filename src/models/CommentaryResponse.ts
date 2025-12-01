import { PetType } from './PetType.js';

/**
 * Interface representing a response from pet commentary generation
 */
export interface CommentaryResponse {
  message: string;
  petType: PetType;
  timestamp: number;
  success: boolean;
  error?: string;
}
