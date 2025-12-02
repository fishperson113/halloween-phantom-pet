import { PetType } from './PetType.js';

/**
 * Interface representing the configuration for a pet's sprite animations
 */
export interface PetConfig {
  type: PetType;
  spriteSheet: string;  // Path to PNG sprite map
  frameWidth: number;
  frameHeight: number;
  idleFrames: number[];
  walkLeftFrames: number[];
  walkRightFrames: number[];
  interactionFrames: number[];
  happyExpressionFrames: number[];  // 2-3 frames for happy expression
  neutralExpressionFrames: number[];  // 2-3 frames for neutral expression
  concernedExpressionFrames: number[];  // 2-3 frames for concerned expression
  frameDuration: number;  // milliseconds per frame
}
