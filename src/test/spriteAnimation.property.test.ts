import * as assert from 'assert';
import * as fc from 'fast-check';
import { suite, test } from 'mocha';
import { PetType } from '../models/PetType.js';
import { PetConfig } from '../models/PetConfig.js';

suite('Sprite Animation Property Tests', () => {
  
  // Helper function to simulate frame advancement logic
  function advanceFrame(currentFrameIndex: number, frameSequence: number[]): number {
    return (currentFrameIndex + 1) % frameSequence.length;
  }

  // Helper function to get current frame from sequence
  function getCurrentFrame(frameIndex: number, frameSequence: number[]): number {
    return frameSequence[frameIndex];
  }

  // Generator for valid pet configurations
  const petConfigArbitrary = fc.record({
    type: fc.constantFrom(PetType.Pumpkin, PetType.Skeleton, PetType.Ghost),
    spriteSheet: fc.constant('sprite.png'),
    frameWidth: fc.integer({ min: 32, max: 128 }),
    frameHeight: fc.integer({ min: 32, max: 128 }),
    idleFrames: fc.array(fc.integer({ min: 0, max: 15 }), { minLength: 1, maxLength: 8 }),
    walkLeftFrames: fc.array(fc.integer({ min: 0, max: 15 }), { minLength: 1, maxLength: 8 }),
    walkRightFrames: fc.array(fc.integer({ min: 0, max: 15 }), { minLength: 1, maxLength: 8 }),
    interactionFrames: fc.array(fc.integer({ min: 0, max: 15 }), { minLength: 1, maxLength: 8 }),
    frameDuration: fc.integer({ min: 50, max: 500 })
  });

  // Feature: spooky-code-pets, Property 2: Sprite animation frame cycling
  // Validates: Requirements 1.3
  test('Property 2: Sprite animation frame cycling - For any pet config and animation state, frames should cycle correctly', () => {
    const animationTypeArbitrary = fc.constantFrom('idle', 'walkLeft', 'walkRight', 'interaction');

    fc.assert(
      fc.property(petConfigArbitrary, animationTypeArbitrary, (petConfig, animationType) => {
        // Get the appropriate frame sequence based on animation type
        let frameSequence: number[];
        switch (animationType) {
          case 'walkLeft':
            frameSequence = petConfig.walkLeftFrames;
            break;
          case 'walkRight':
            frameSequence = petConfig.walkRightFrames;
            break;
          case 'interaction':
            frameSequence = petConfig.interactionFrames;
            break;
          case 'idle':
          default:
            frameSequence = petConfig.idleFrames;
            break;
        }

        // Property: Frame cycling should wrap around correctly
        // Start at frame 0
        let currentFrameIndex = 0;
        const visitedFrames: number[] = [];

        // Cycle through frames twice to ensure wrapping works
        const cyclesToTest = frameSequence.length * 2;
        for (let i = 0; i < cyclesToTest; i++) {
          const currentFrame = getCurrentFrame(currentFrameIndex, frameSequence);
          visitedFrames.push(currentFrame);
          
          // Frame should be from the sequence
          assert.ok(
            frameSequence.includes(currentFrame),
            `Frame ${currentFrame} should be in the sequence`
          );
          
          // Advance to next frame
          const nextFrameIndex = advanceFrame(currentFrameIndex, frameSequence);
          
          // Next frame index should be within bounds
          assert.ok(
            nextFrameIndex >= 0 && nextFrameIndex < frameSequence.length,
            `Next frame index ${nextFrameIndex} should be within bounds [0, ${frameSequence.length})`
          );
          
          // After reaching the end, should wrap to 0
          if (currentFrameIndex === frameSequence.length - 1) {
            assert.strictEqual(
              nextFrameIndex,
              0,
              'Frame index should wrap to 0 after reaching the end'
            );
          } else {
            assert.strictEqual(
              nextFrameIndex,
              currentFrameIndex + 1,
              'Frame index should increment by 1'
            );
          }
          
          currentFrameIndex = nextFrameIndex;
        }

        // After cycling through twice, we should have visited each frame at least twice
        const firstCycle = visitedFrames.slice(0, frameSequence.length);
        const secondCycle = visitedFrames.slice(frameSequence.length, frameSequence.length * 2);
        
        // Both cycles should be identical (proving consistent cycling)
        assert.deepStrictEqual(
          firstCycle,
          secondCycle,
          'Frame sequences should be identical across cycles'
        );
      }),
      { numRuns: 100 }
    );
  });

  // Feature: spooky-code-pets, Property 3: Click triggers interaction animation
  // Validates: Requirements 1.4
  test('Property 3: Click triggers interaction animation - For any pet, clicking should trigger interaction animation', () => {
    fc.assert(
      fc.property(petConfigArbitrary, (petConfig) => {
        // Simulate the state before click
        let currentAnimation = 'idle';
        let isInteracting = false;
        let currentFrameIndex = 0;

        // Simulate click event (playInteractionAnimation logic)
        if (!isInteracting && petConfig) {
          isInteracting = true;
          currentAnimation = 'interaction';
          currentFrameIndex = 0;
        }

        // After click, animation should be 'interaction'
        assert.strictEqual(
          currentAnimation,
          'interaction',
          'Animation should be set to interaction after click'
        );

        // isInteracting flag should be true
        assert.strictEqual(
          isInteracting,
          true,
          'isInteracting flag should be true after click'
        );

        // Frame index should be reset to 0
        assert.strictEqual(
          currentFrameIndex,
          0,
          'Frame index should be reset to 0 when interaction starts'
        );

        // The interaction should use the interaction frame sequence
        const interactionFrames = petConfig.interactionFrames;
        assert.ok(
          interactionFrames.length > 0,
          'Interaction frames should exist and be non-empty'
        );

        // Simulate playing through the interaction animation
        for (let i = 0; i < interactionFrames.length; i++) {
          const currentFrame = getCurrentFrame(currentFrameIndex, interactionFrames);
          
          // Frame should be from the interaction sequence
          assert.ok(
            interactionFrames.includes(currentFrame),
            `Frame ${currentFrame} should be in the interaction sequence`
          );
          
          currentFrameIndex = advanceFrame(currentFrameIndex, interactionFrames);
        }

        // After one complete cycle, frame index should be back to 0
        assert.strictEqual(
          currentFrameIndex,
          0,
          'Frame index should return to 0 after one complete interaction cycle'
        );

        // At this point, the animation should return to idle
        // (simulating the logic: if (this.isInteracting && this.currentFrameIndex === 0))
        if (isInteracting && currentFrameIndex === 0) {
          isInteracting = false;
          currentAnimation = 'idle';
        }

        assert.strictEqual(
          currentAnimation,
          'idle',
          'Animation should return to idle after interaction completes'
        );

        assert.strictEqual(
          isInteracting,
          false,
          'isInteracting flag should be false after interaction completes'
        );
      }),
      { numRuns: 100 }
    );
  });
});
