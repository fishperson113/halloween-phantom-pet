# Requirements Document

## Introduction

The Spooky Code Pets extension provides an interactive coding companion experience for VS Code users. The extension displays animated spooky characters (pumpkin, skeleton, and ghost) in the Explorer sidebar that periodically review the user's code and provide LLM-powered commentary. Each pet has a distinct personality and can display speech bubbles with helpful debugging insights or curious observations about the code being written.

## Glossary

- **Extension**: The VS Code extension application that hosts the spooky pets
- **Pet**: An animated spooky character (pumpkin, skeleton, or ghost) displayed in the Explorer panel
- **Sprite Map**: A PNG image containing multiple animation frames arranged in a grid
- **Speech Bubble**: A visual element displaying text commentary from a pet
- **LLM**: Large Language Model used to generate pet commentary
- **API Key**: User-provided authentication credential for accessing the LLM service
- **Code Context**: The portion of code currently being edited by the user
- **Interaction Animation**: A special animation triggered when the user clicks on a pet
- **Commentary Frequency**: User-configurable setting controlling how often pets provide code commentary
- **Expression Animation**: A 2-3 frame animation sequence showing the Pet's emotional reaction (happy, neutral, or concerned)
- **Structured Response**: A JSON-formatted LLM response containing both commentary text and expression metadata
- **Expression Indicator**: A field in the structured response specifying which expression animation to display (happy, neutral, or concerned)

## Requirements

### Requirement 1

**User Story:** As a developer, I want to see animated spooky pets in my VS Code Explorer panel, so that I have entertaining companions while coding.

#### Acceptance Criteria

1. WHEN the Extension starts, THE Extension SHALL display a dedicated panel in the Explorer sidebar
2. WHEN the panel is visible, THE Extension SHALL render one Pet at a time from the available collection (pumpkin, skeleton, ghost)
3. WHEN a Pet is active, THE Extension SHALL animate the Pet using Sprite Map frames for left and right movement
4. WHEN a user clicks on a Pet, THE Extension SHALL trigger the Interaction Animation for that Pet
5. THE Extension SHALL load all Pet animations from PNG Sprite Map files stored in the extension resources

### Requirement 2

**User Story:** As a developer, I want each spooky pet to have a unique personality, so that their commentary feels distinct and entertaining.

#### Acceptance Criteria

1. WHEN the pumpkin Pet is active, THE Extension SHALL use a predefined pumpkin personality prompt for LLM requests
2. WHEN the skeleton Pet is active, THE Extension SHALL use a predefined skeleton personality prompt for LLM requests
3. WHEN the ghost Pet is active, THE Extension SHALL use a predefined ghost personality prompt for LLM requests
4. WHERE a user provides a custom personality prompt, THE Extension SHALL use the custom prompt instead of the predefined personality
5. THE Extension SHALL maintain consistent personality characteristics across all commentary from the same Pet

### Requirement 3

**User Story:** As a developer, I want to securely configure my LLM API key, so that the pets can generate intelligent commentary without compromising my credentials.

#### Acceptance Criteria

1. WHEN a user first activates the Extension without an API Key configured, THE Extension SHALL prompt the user to enter an API Key
2. WHEN a user provides an API Key, THE Extension SHALL store the API Key using VS Code's secure storage mechanism
3. WHEN the Extension needs to make LLM requests, THE Extension SHALL retrieve the API Key from secure storage
4. THE Extension SHALL use the OpenAI-compatible API standard for all LLM communications
5. WHEN a user updates their API Key, THE Extension SHALL replace the stored credential securely

### Requirement 4

**User Story:** As a developer, I want pets to review my current code and provide commentary, so that I receive helpful insights or entertaining observations while coding.

#### Acceptance Criteria

1. WHEN a Pet generates commentary, THE Extension SHALL include the Code Context from the user's current cursor position as input to the LLM
2. WHEN determining Code Context, THE Extension SHALL extract a reasonable portion of code around the cursor position rather than the entire file, potentially the current class/parent function.
3. WHEN making LLM requests, THE Extension SHALL limit the response length to ensure brief commentary
4. WHEN the LLM returns a response, THE Extension SHALL display the commentary in a Speech Bubble above the Pet, and it is readable
5. THE Extension SHALL ensure commentary is brief, useful, or entertaining in nature

### Requirement 5

**User Story:** As a developer, I want to control how often pets comment on my code, so that I can balance entertainment with productivity.

#### Acceptance Criteria

1. THE Extension SHALL provide a user-configurable Commentary Frequency setting (in amount of code written/text written)
2. WHEN the Commentary Frequency is set, THE Extension SHALL generate Pet commentary at intervals matching the configured frequency
3. WHEN a Pet provides commentary, THE Extension SHALL wait for the configured interval before generating the next commentary
4. THE Extension SHALL allow users to modify the Commentary Frequency setting through VS Code settings
5. WHEN the Commentary Frequency is disabled, THE Extension SHALL disable automatic commentary generation

### Requirement 6

**User Story:** As a developer, I want visual feedback when pets are thinking or commenting, so that I understand when the extension is active.

#### Acceptance Criteria

1. WHEN a Pet is generating commentary, THE Extension SHALL display a visual indicator that the Pet is processing
2. WHEN commentary is ready, THE Extension SHALL display the Speech Bubble with the LLM-generated text
3. WHEN a Speech Bubble is displayed, THE Extension SHALL position it visibly near the Pet
4. WHEN new commentary is generated, THE Extension SHALL replace any existing Speech Bubble content
5. THE Extension SHALL ensure only one Speech Bubble is visible at a time

### Requirement 7

**User Story:** As a developer, I want to switch between different spooky pets, so that I can choose my preferred companion.

#### Acceptance Criteria

1. THE Extension SHALL provide a mechanism for users to select which Pet is currently active
2. WHEN a user selects a different Pet, THE Extension SHALL hide the current Pet and display the newly selected Pet
3. WHEN switching Pets, THE Extension SHALL maintain the same panel position and size
4. WHEN a new Pet is displayed, THE Extension SHALL apply that Pet's personality to subsequent commentary
5. THE Extension SHALL ensure only one Pet is visible at a time

### Requirement 8

**User Story:** As a developer, I want the extension to handle errors gracefully, so that failures don't disrupt my coding workflow.

#### Acceptance Criteria

1. WHEN an LLM API request fails, THE Extension SHALL log the error and continue operating without crashing
2. WHEN the API Key is invalid or missing, THE Extension SHALL display a user-friendly error message and prompt for a valid key
3. WHEN network connectivity is unavailable, THE Extension SHALL queue commentary requests and retry when connectivity is restored
4. WHEN Sprite Map files are missing or corrupted, THE Extension SHALL display a fallback visual representation
5. WHEN an unexpected error occurs, THE Extension SHALL log diagnostic information for troubleshooting

### Requirement 9

**User Story:** As a developer, I want pets to react expressively to my code quality, so that their feedback feels more engaging and emotionally resonant.

#### Acceptance Criteria

1. WHEN the LLM generates commentary, THE Extension SHALL receive a structured response containing both the commentary text and an expression indicator
2. WHEN the LLM evaluates code positively, THE Extension SHALL display the Pet with a happy expression animation
3. WHEN the LLM evaluates code neutrally, THE Extension SHALL display the Pet with a neutral expression animation
4. WHEN the LLM evaluates code with concerns, THE Extension SHALL display the Pet with a concerned expression animation
5. WHEN a Pet displays commentary, THE Extension SHALL pause the Pet's movement animation and show the expression animation
6. WHEN the Speech Bubble is dismissed or hidden, THE Extension SHALL return the Pet to its normal idle and movement behavior
7. THE Extension SHALL validate the LLM response structure and use a default neutral expression if the response format is invalid
