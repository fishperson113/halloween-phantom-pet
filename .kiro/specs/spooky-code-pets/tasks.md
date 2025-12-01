# Implementation Plan

- [x] 1. Set up project structure and dependencies





  - Update package.json with required dependencies (node-fetch, fast-check)
  - Create directory structure: services, providers, webview, models, personalities
  - Configure TypeScript for proper module resolution
  - Set up test framework configuration
  - _Requirements: All_

- [ ] 2. Implement configuration management
  - [x] 2.1 Create ConfigurationManager class





    - Implement API key storage using VS Code secrets API
    - Implement API key retrieval methods
    - Implement settings getters/setters for frequency, pet selection, custom prompts
    - Add configuration change event listeners
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 5.1, 5.4_

  - [x] 2.2 Write property test for API key secure storage



















    - **Property 7: API key secure storage**
    - **Validates: Requirements 3.2, 3.5**
-

  - [ ] 2.3 Write unit tests for configuration manager


    - Test API key storage and retrieval with specific values
    - Test setting updates trigger appropriate events
    - Test default values are applied correctly
    - _Requirements: 3.2, 3.5, 5.1_

- [x] 3. Define data models and personalities





  - [x] 3.1 Create TypeScript interfaces for data models


    - Define PetType enum and PetConfig interface
    - Define CodeContext, CommentaryRequest, CommentaryResponse interfaces
    - Define ExtensionSettings interface
    - _Requirements: 1.2, 4.1_

  - [x] 3.2 Create personality definitions


    - Define Personality interface with systemPrompt and commentaryStyle
    - Implement predefined personalities for vampire, skeleton, and ghost
    - Export PERSONALITIES constant with all three pet personalities
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 3.3 Write property test for pet personality mapping


    - **Property 4: Pet personality mapping**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x] 3.4 Write property test for custom prompt override


    - **Property 5: Custom prompt override**
    - **Validates: Requirements 2.4**

- [x] 4. Implement LLM service




  - [x] 4.1 Create LLMService class


    - Implement generateCommentary method with OpenAI API integration
    - Implement extractCodeContext method to get code around cursor
    - Implement API request formatting with proper headers and payload
    - Implement response parsing and validation
    - Add error handling for API failures
    - _Requirements: 3.3, 3.4, 4.1, 4.2, 4.3, 4.4_

  - [x] 4.2 Write property test for OpenAI API format compliance


    - **Property 9: OpenAI API format compliance**
    - **Validates: Requirements 3.4**



  - [ ] 4.3 Write property test for code context inclusion
    - **Property 10: Code context inclusion**


    - **Validates: Requirements 4.1, 4.2**



  - [ ] 4.4 Write property test for response length limiting
    - **Property 11: Response length limiting**


    - **Validates: Requirements 4.3**

  - [ ] 4.5 Write property test for API key retrieval
    - **Property 8: API key retrieval for LLM requests**
    - **Validates: Requirements 3.3**

  - [ ] 4.6 Write unit tests for LLM service
    - Test code context extraction with sample editor content
    - Test API request formatting with known inputs
    - Test response parsing with sample API responses
    - Test error handling with specific error scenarios
    - _Requirements: 3.4, 4.1, 4.2, 4.3_

- [x] 5. Create webview for pet display




  - [x] 5.1 Create HTML template for pet webview


    - Design HTML structure with pet container and speech bubble elements
    - Add canvas or div elements for sprite rendering
    - Include placeholder for speech bubble
    - _Requirements: 1.1, 1.2, 6.3_

  - [x] 5.2 Create CSS for pet animations and speech bubbles


    - Style pet container with proper positioning
    - Style speech bubble with positioning relative to pet
    - Add animation transitions for smooth movement
    - Ensure responsive layout within panel
    - _Requirements: 1.3, 6.3_



  - [ ] 5.3 Implement sprite animation manager in webview JavaScript
    - Implement sprite sheet loading and parsing
    - Implement animation frame cycling for idle, walk, and interaction
    - Implement click event handler for interaction animation
    - Implement speech bubble show/hide methods


    - Add message listener for extension host communication
    - _Requirements: 1.3, 1.4, 1.5, 6.2, 6.3, 6.4_


  - [ ] 5.4 Write property test for sprite animation frame cycling
    - **Property 2: Sprite animation frame cycling**


    - **Validates: Requirements 1.3**

  - [ ] 5.5 Write property test for click triggers interaction
    - **Property 3: Click triggers interaction animation**
    - **Validates: Requirements 1.4**

  - [ ] 5.6 Write unit tests for sprite animation
    - Test sprite loading with sample sprite sheets
    - Test animation frame calculations
    - Test speech bubble positioning with known coordinates
    - _Requirements: 1.3, 1.5, 6.3_

- [x] 6. Implement pet panel provider




  - [x] 6.1 Create PetPanelProvider class




    - Implement WebviewViewProvider interface
    - Implement resolveWebviewView to initialize webview
    - Set up webview HTML with proper CSP and resource URIs
    - Implement message passing between extension and webview
    - Implement showPet, showSpeechBubble, hideSpeechBubble methods
    - _Requirements: 1.1, 1.2, 6.2, 6.4, 6.5_

  - [x] 6.2 Write property test for single pet visibility


    - **Property 1: Single pet visibility invariant**
    - **Validates: Requirements 1.2, 7.5**

  - [x] 6.3 Write property test for speech bubble display

    - **Property 12: Speech bubble display on response**
    - **Validates: Requirements 4.4**

  - [x] 6.4 Write property test for speech bubble replacement

    - **Property 15: Speech bubble replacement**
    - **Validates: Requirements 6.2, 6.4**

  - [x] 6.5 Write property test for single speech bubble invariant

    - **Property 17: Single speech bubble invariant**
    - **Validates: Requirements 6.5**

  - [x] 6.6 Write property test for speech bubble positioning

    - **Property 16: Speech bubble positioning**
    - **Validates: Requirements 6.3**

  - [x] 6.7 Write unit tests for pet panel provider


    - Test webview initialization
    - Test message passing between extension and webview
    - Test pet switching with specific pet types
    - _Requirements: 1.1, 1.2, 6.2_

- [x] 7. Implement commentary scheduler




  - [x] 7.1 Create CommentaryScheduler class


    - Implement start/stop methods for scheduling
    - Implement text change listener to track character count
    - Implement cumulative character count tracking
    - Trigger commentary when character threshold is reached
    - Reset character count after commentary generation
    - Implement active editor monitoring
    - Integrate with LLMService for commentary generation
    - Integrate with PetPanelProvider for display
    - Add visual processing indicator during generation
    - _Requirements: 4.1, 5.2, 5.3, 6.1_



  - [ ] 7.2 Write property test for commentary frequency character tracking
    - **Property 13: Commentary frequency character tracking**


    - **Validates: Requirements 5.2, 5.3**



  - [ ] 7.3 Write property test for visual processing indicator
    - **Property 14: Visual processing indicator**
    - **Validates: Requirements 6.1**

  - [ ] 7.4 Write unit tests for commentary scheduler
    - Test scheduler starts and stops correctly
    - Test manual commentary trigger
    - Test character count tracking and threshold triggering
    - Test character count reset after commentary
    - _Requirements: 5.2, 5.3_

- [x] 8. Implement pet switching functionality




  - [x] 8.1 Add pet selection command and logic


    - Register pet selection command in extension
    - Implement pet switching in PetPanelProvider
    - Ensure previous pet is hidden and new pet is displayed
    - Maintain panel dimensions during switch
    - Update personality for subsequent commentary
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 8.2 Write property test for pet switch state transition


    - **Property 18: Pet switch state transition**
    - **Validates: Requirements 7.2, 7.3**

  - [x] 8.3 Write property test for personality propagation


    - **Property 19: Personality propagation on pet switch**
    - **Validates: Requirements 7.4**

  - [x] 8.4 Write property test for personality consistency


    - **Property 6: Personality consistency**
    - **Validates: Requirements 2.5**

- [-] 9. Implement error handling and resilience


  - [x] 9.1 Add error handling to LLMService


    - Implement API failure error handling with logging
    - Implement invalid API key detection and user prompts
    - Implement network failure detection and retry queue
    - Add exponential backoff for retries
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 9.2 Add error handling to PetPanelProvider


    - Implement sprite loading fallback for missing/corrupted files
    - Add error logging for webview communication failures
    - Implement graceful degradation for resource errors
    - _Requirements: 8.4_



  - [ ] 9.3 Add global error handling
    - Wrap critical code paths in try-catch blocks
    - Implement comprehensive error logging
    - Ensure extension remains active after errors



    - _Requirements: 8.5_

  - [ ] 9.4 Write property test for API failure resilience
    - **Property 20: API failure resilience**
    - **Validates: Requirements 8.1**

  - [ ] 9.5 Write property test for invalid API key handling
    - **Property 21: Invalid API key handling**
    - **Validates: Requirements 8.2**

  - [ ] 9.6 Write property test for network failure retry
    - **Property 22: Network failure retry behavior**
    - **Validates: Requirements 8.3**

  - [ ] 9.7 Write property test for sprite loading fallback
    - **Property 23: Sprite loading fallback**
    - **Validates: Requirements 8.4**

  - [ ] 9.8 Write property test for error logging
    - **Property 24: Error logging**
    - **Validates: Requirements 8.5**

- [x] 10. Wire up extension activation





  - [x] 10.1 Update extension.ts with all components


    - Initialize ConfigurationManager
    - Register PetPanelProvider with webview view
    - Initialize CommentaryScheduler
    - Register all commands (setApiKey, selectPet, triggerCommentary, clearApiKey)
    - Set up configuration change listeners
    - Handle first-time API key prompt
    - _Requirements: 3.1, 5.1, 7.1_

  - [x] 10.2 Update package.json contributions


    - Add configuration schema for all settings
    - Add commands for API key, pet selection, and manual commentary
    - Add viewsContainers and views for pet panel
    - Update activation events
    - _Requirements: 1.1, 3.1, 5.1, 5.4, 7.1_

- [x] 11. Add sprite assets and prepare for user-provided sprites





  - Create placeholder sprite configurations for pumpkin, skeleton, and ghost
  - Document sprite sheet format requirements
  - Add instructions for user to provide sprite PNG files
  - _Requirements: 1.5_

- [x] 12. Checkpoint - Ensure all tests pass






  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Create integration tests




  - [x] 13.1 Test end-to-end commentary flow


    - Test extension activation → pet display → commentary generation → speech bubble display
    - Test API key configuration → LLM request → response handling
    - Test pet switching → personality change → commentary with new personality
    - _Requirements: All_

  - [x] 13.2 Test error scenarios


    - Test error scenarios → graceful degradation → recovery
    - Test missing API key flow
    - Test network failure and retry
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
