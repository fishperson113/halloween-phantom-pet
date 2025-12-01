import { PetConfig } from '../models/PetConfig.js';
import { PetType } from '../models/PetType.js';

/**
 * Default sprite configurations for all pet types.
 * These configurations define the animation frames and timing for each pet.
 * 
 * Users can provide their own sprite sheets by placing PNG files in the resources/sprites directory.
 * See SPRITE_GUIDE.md for detailed instructions on creating custom sprite sheets.
 */
export const SPRITE_CONFIGS: Record<PetType, PetConfig> = {
  [PetType.Pumpkin]: {
    type: PetType.Pumpkin,
    spriteSheet: 'pumpkin-sprites.png',
    frameWidth: 64,
    frameHeight: 64,
    idleFrames: [0, 1, 2, 3],
    walkLeftFrames: [4, 5, 6, 7],
    walkRightFrames: [8, 9, 10, 11],
    interactionFrames: [12, 13, 14, 15],
    frameDuration: 150
  },
  [PetType.Skeleton]: {
    type: PetType.Skeleton,
    spriteSheet: 'skeleton-sprites.png',
    frameWidth: 64,
    frameHeight: 64,
    idleFrames: [0, 1, 2, 3],
    walkLeftFrames: [4, 5, 6, 7],
    walkRightFrames: [8, 9, 10, 11],
    interactionFrames: [12, 13, 14, 15],
    frameDuration: 150
  },
  [PetType.Ghost]: {
    type: PetType.Ghost,
    spriteSheet: 'ghost-sprites.png',
    frameWidth: 64,
    frameHeight: 64,
    idleFrames: [0, 1, 2, 3],
    walkLeftFrames: [4, 5, 6, 7],
    walkRightFrames: [8, 9, 10, 11],
    interactionFrames: [12, 13, 14, 15],
    frameDuration: 150
  }
};

/**
 * Get the sprite configuration for a specific pet type
 */
export function getSpriteConfig(petType: PetType): PetConfig {
  return SPRITE_CONFIGS[petType];
}
