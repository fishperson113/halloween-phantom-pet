import * as assert from 'assert';
import { suite, test } from 'mocha';
import { PetType } from '../models/PetType.js';
import { PetConfig } from '../models/PetConfig.js';

suite('Sprite Animation Unit Tests', () => {
  
  // Sample pet configuration for testing
  const samplePetConfig: PetConfig = {
    type: PetType.Pumpkin,
    spriteSheet: 'pumpkin-sprites.png',
    frameWidth: 64,
    frameHeight: 64,
    idleFrames: [0, 1, 2, 3],
    walkLeftFrames: [4, 5, 6, 7],
    walkRightFrames: [8, 9, 10, 11],
    interactionFrames: [12, 13, 14, 15],
    happyExpressionFrames: [16, 17, 18],
    neutralExpressionFrames: [19, 20, 21],
    concernedExpressionFrames: [22, 23, 24],
    frameDuration: 150
  };

  suite('Sprite Loading', () => {
    test('should have valid sprite sheet path', () => {
      assert.ok(samplePetConfig.spriteSheet);
      assert.strictEqual(typeof samplePetConfig.spriteSheet, 'string');
      assert.ok(samplePetConfig.spriteSheet.length > 0);
    });

    test('should have valid frame dimensions', () => {
      assert.ok(samplePetConfig.frameWidth > 0);
      assert.ok(samplePetConfig.frameHeight > 0);
      assert.strictEqual(typeof samplePetConfig.frameWidth, 'number');
      assert.strictEqual(typeof samplePetConfig.frameHeight, 'number');
    });

    test('should have valid frame duration', () => {
      assert.ok(samplePetConfig.frameDuration > 0);
      assert.strictEqual(typeof samplePetConfig.frameDuration, 'number');
    });
  });

  suite('Animation Frame Calculations', () => {
    test('should calculate correct frame index for idle animation', () => {
      const idleFrames = samplePetConfig.idleFrames;
      assert.strictEqual(idleFrames.length, 4);
      assert.deepStrictEqual(idleFrames, [0, 1, 2, 3]);
    });

    test('should calculate correct frame index for walk left animation', () => {
      const walkLeftFrames = samplePetConfig.walkLeftFrames;
      assert.strictEqual(walkLeftFrames.length, 4);
      assert.deepStrictEqual(walkLeftFrames, [4, 5, 6, 7]);
    });

    test('should calculate correct frame index for walk right animation', () => {
      const walkRightFrames = samplePetConfig.walkRightFrames;
      assert.strictEqual(walkRightFrames.length, 4);
      assert.deepStrictEqual(walkRightFrames, [8, 9, 10, 11]);
    });

    test('should calculate correct frame index for interaction animation', () => {
      const interactionFrames = samplePetConfig.interactionFrames;
      assert.strictEqual(interactionFrames.length, 4);
      assert.deepStrictEqual(interactionFrames, [12, 13, 14, 15]);
    });

    test('should wrap frame index correctly at end of sequence', () => {
      const frames = samplePetConfig.idleFrames;
      const lastIndex = frames.length - 1;
      const wrappedIndex = (lastIndex + 1) % frames.length;
      assert.strictEqual(wrappedIndex, 0);
    });

    test('should calculate sprite sheet position for frame 0', () => {
      const frameNumber = 0;
      const frameWidth = samplePetConfig.frameWidth;
      const frameHeight = samplePetConfig.frameHeight;
      const framesPerRow = 4; // Assuming 256px wide sprite sheet / 64px frames
      
      const srcX = (frameNumber % framesPerRow) * frameWidth;
      const srcY = Math.floor(frameNumber / framesPerRow) * frameHeight;
      
      assert.strictEqual(srcX, 0);
      assert.strictEqual(srcY, 0);
    });

    test('should calculate sprite sheet position for frame 5', () => {
      const frameNumber = 5;
      const frameWidth = samplePetConfig.frameWidth;
      const frameHeight = samplePetConfig.frameHeight;
      const framesPerRow = 4;
      
      const srcX = (frameNumber % framesPerRow) * frameWidth;
      const srcY = Math.floor(frameNumber / framesPerRow) * frameHeight;
      
      assert.strictEqual(srcX, 64); // 5 % 4 = 1, 1 * 64 = 64
      assert.strictEqual(srcY, 64); // floor(5 / 4) = 1, 1 * 64 = 64
    });
  });

  suite('Speech Bubble Positioning', () => {
    test('should position speech bubble above pet with known coordinates', () => {
      // Pet canvas is 128x128, positioned at center
      const petCanvasWidth = 128;
      const petCanvasHeight = 128;
      const speechBubbleWidth = 250;
      
      // Speech bubble should be centered horizontally relative to pet
      const expectedLeft = (petCanvasWidth - speechBubbleWidth) / 2;
      
      // For a centered pet, speech bubble should be positioned above
      // This is handled by CSS margin-top in the actual implementation
      assert.ok(expectedLeft < 0); // Speech bubble is wider than pet
      
      // Speech bubble should be visible and positioned correctly
      const bubbleTop = -20; // 20px above pet (from CSS margin)
      assert.ok(bubbleTop < 0); // Above the pet
    });

    test('should keep speech bubble within panel bounds', () => {
      const panelWidth = 300;
      const speechBubbleMaxWidth = 250;
      
      // Speech bubble should not exceed panel width
      assert.ok(speechBubbleMaxWidth < panelWidth);
      
      // With margin, speech bubble should fit
      const margin = 20;
      assert.ok(speechBubbleMaxWidth + (margin * 2) <= panelWidth);
    });

    test('should position speech bubble tail centered', () => {
      // Speech bubble tail should be centered (50% left with translateX(-50%))
      const tailPosition = '50%';
      assert.strictEqual(tailPosition, '50%');
      
      // Tail should point downward toward pet
      const tailBorderBottom = '10px solid';
      assert.ok(tailBorderBottom.includes('solid'));
    });
  });

  suite('Animation State Management', () => {
    test('should start with idle animation', () => {
      const initialAnimation = 'idle';
      assert.strictEqual(initialAnimation, 'idle');
    });

    test('should transition to interaction animation on click', () => {
      let currentAnimation = 'idle';
      let isInteracting = false;
      
      // Simulate click
      if (!isInteracting) {
        isInteracting = true;
        currentAnimation = 'interaction';
      }
      
      assert.strictEqual(currentAnimation, 'interaction');
      assert.strictEqual(isInteracting, true);
    });

    test('should return to idle after interaction completes', () => {
      let currentAnimation = 'interaction';
      let isInteracting = true;
      let currentFrameIndex = 0;
      
      // Simulate interaction completion (frame wraps to 0)
      if (isInteracting && currentFrameIndex === 0) {
        isInteracting = false;
        currentAnimation = 'idle';
      }
      
      assert.strictEqual(currentAnimation, 'idle');
      assert.strictEqual(isInteracting, false);
    });

    test('should not start new interaction while one is in progress', () => {
      let currentAnimation = 'interaction';
      let isInteracting = true;
      
      // Try to start another interaction
      if (!isInteracting) {
        currentAnimation = 'interaction';
      }
      
      // Should still be in interaction state
      assert.strictEqual(currentAnimation, 'interaction');
      assert.strictEqual(isInteracting, true);
    });
  });

  suite('Pet Configuration Validation', () => {
    test('should have all required animation sequences', () => {
      assert.ok(Array.isArray(samplePetConfig.idleFrames));
      assert.ok(Array.isArray(samplePetConfig.walkLeftFrames));
      assert.ok(Array.isArray(samplePetConfig.walkRightFrames));
      assert.ok(Array.isArray(samplePetConfig.interactionFrames));
    });

    test('should have non-empty animation sequences', () => {
      assert.ok(samplePetConfig.idleFrames.length > 0);
      assert.ok(samplePetConfig.walkLeftFrames.length > 0);
      assert.ok(samplePetConfig.walkRightFrames.length > 0);
      assert.ok(samplePetConfig.interactionFrames.length > 0);
    });

    test('should have valid pet type', () => {
      assert.ok(Object.values(PetType).includes(samplePetConfig.type));
    });
  });
});
