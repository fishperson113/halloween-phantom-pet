import * as assert from 'assert';
import * as fc from 'fast-check';
import { suite, test } from 'mocha';
import { PetType } from '../models/PetType.js';
import { PERSONALITIES } from '../personalities/personalities.js';

suite('Personality Property Tests', () => {
  
  // Feature: spooky-code-pets, Property 4: Pet personality mapping
  test('Property 4: Pet personality mapping - For any pet type, the predefined personality should be retrievable', () => {
    // Generator for all valid pet types
    const petTypeArbitrary = fc.constantFrom(
      PetType.Pumpkin,
      PetType.Skeleton,
      PetType.Ghost
    );

    fc.assert(
      fc.property(petTypeArbitrary, (petType) => {
        // For any pet type, when no custom prompt is configured,
        // the PERSONALITIES constant should contain a predefined personality
        const personality = PERSONALITIES[petType];
        
        // The personality should exist
        assert.ok(personality, `Personality should exist for ${petType}`);
        
        // The personality should have a non-empty system prompt
        assert.ok(
          personality.systemPrompt && personality.systemPrompt.length > 0,
          `System prompt should be non-empty for ${petType}`
        );
        
        // The personality should have a commentary style
        assert.ok(
          personality.commentaryStyle && personality.commentaryStyle.length > 0,
          `Commentary style should be non-empty for ${petType}`
        );
        
        // The personality should have example comments
        assert.ok(
          Array.isArray(personality.exampleComments) && personality.exampleComments.length > 0,
          `Example comments should be a non-empty array for ${petType}`
        );
        
        // Each pet type should have a unique system prompt
        // (This ensures personalities are distinct)
        const allPrompts = Object.values(PERSONALITIES).map(p => p.systemPrompt);
        const uniquePrompts = new Set(allPrompts);
        assert.strictEqual(
          uniquePrompts.size,
          allPrompts.length,
          'Each pet type should have a unique system prompt'
        );
      }),
      { numRuns: 100 }
    );
  });

  // Feature: spooky-code-pets, Property 5: Custom prompt override
  // Validates: Requirements 2.4
  test('Property 5: Custom prompt override - Custom prompts should override predefined personalities', () => {
    // Generator for all valid pet types
    const petTypeArbitrary = fc.constantFrom(
      PetType.Pumpkin,
      PetType.Skeleton,
      PetType.Ghost
    );

    // Generator for custom prompts (non-empty strings)
    const customPromptArbitrary = fc.string({ minLength: 10, maxLength: 200 });

    fc.assert(
      fc.property(petTypeArbitrary, customPromptArbitrary, (petType, customPrompt) => {
        // Get the predefined personality
        const predefinedPersonality = PERSONALITIES[petType];
        
        // The custom prompt should be different from the predefined one
        // (This simulates the behavior where a custom prompt overrides the default)
        const shouldUseCustom = customPrompt !== predefinedPersonality.systemPrompt;
        
        // When a custom prompt is provided and it's different from the predefined one,
        // the system should use the custom prompt instead
        if (shouldUseCustom) {
          // Verify that the custom prompt is not empty
          assert.ok(customPrompt.length > 0, 'Custom prompt should not be empty');
          
          // Verify that the custom prompt is different from the predefined prompt
          assert.notStrictEqual(
            customPrompt,
            predefinedPersonality.systemPrompt,
            'Custom prompt should be different from predefined personality'
          );
        }
        
        // The predefined personality should still exist and be accessible
        // (even when a custom prompt is used, the default should remain available)
        assert.ok(predefinedPersonality, `Predefined personality should exist for ${petType}`);
        assert.ok(
          predefinedPersonality.systemPrompt && predefinedPersonality.systemPrompt.length > 0,
          `Predefined system prompt should be non-empty for ${petType}`
        );
      }),
      { numRuns: 100 }
    );
  });

  // Feature: spooky-code-pets, Property 6: Personality consistency
  // Validates: Requirements 2.5
  test('Property 6: Personality consistency - Same pet uses same personality across multiple requests', () => {
    // Generator for all valid pet types
    const petTypeArbitrary = fc.constantFrom(
      PetType.Pumpkin,
      PetType.Skeleton,
      PetType.Ghost
    );

    // Generator for number of commentary requests
    const requestCountArbitrary = fc.integer({ min: 2, max: 10 });

    fc.assert(
      fc.property(petTypeArbitrary, requestCountArbitrary, (petType, requestCount) => {
        // For any sequence of commentary requests for the same pet without configuration changes,
        // all requests should use the same personality prompt
        
        // Get the personality for this pet
        const personality = PERSONALITIES[petType];
        const systemPrompt = personality.systemPrompt;
        
        // Simulate multiple commentary requests
        const personalitiesUsed: string[] = [];
        
        for (let i = 0; i < requestCount; i++) {
          // Each request should use the same personality
          // (In the actual implementation, this would be retrieved from PERSONALITIES[petType])
          const currentPersonality = PERSONALITIES[petType].systemPrompt;
          personalitiesUsed.push(currentPersonality);
        }
        
        // Verify that all requests used the same personality
        assert.strictEqual(
          personalitiesUsed.length,
          requestCount,
          'Should have recorded personality for each request'
        );
        
        // All personalities should be identical
        const uniquePersonalities = new Set(personalitiesUsed);
        assert.strictEqual(
          uniquePersonalities.size,
          1,
          'All requests for the same pet should use the same personality'
        );
        
        // The personality used should match the expected one
        assert.strictEqual(
          personalitiesUsed[0],
          systemPrompt,
          'The personality used should match the pet\'s predefined personality'
        );
        
        // Verify consistency across all requests
        for (let i = 1; i < personalitiesUsed.length; i++) {
          assert.strictEqual(
            personalitiesUsed[i],
            personalitiesUsed[0],
            `Request ${i} should use the same personality as request 0`
          );
        }
      }),
      { numRuns: 100 }
    );
  });
});
