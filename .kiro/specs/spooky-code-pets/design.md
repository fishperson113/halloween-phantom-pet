# Design Document: Spooky Code Pets

## Overview

The Spooky Code Pets extension is a VS Code extension that provides interactive, animated spooky companions (pumpkin, skeleton, and ghost) in the Explorer sidebar. These pets periodically analyze the user's code using an LLM and provide commentary through speech bubbles. The extension uses webview-based rendering for animations, secure credential storage for API keys, and OpenAI-compatible API integration for generating personality-driven commentary.

The architecture follows VS Code extension best practices with clear separation between the extension host (Node.js), webview UI (HTML/CSS/JavaScript), and external LLM services.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VS Code Extension Host                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Extension Activation                       │ │
│  │  - Register commands                                    │ │
│  │  - Initialize TreeView provider                        │ │
│  │  - Set up configuration listeners                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────┴────────────────────────────┐   │
│  │                                                       │   │
│  ▼                                                       ▼   │
│  ┌──────────────────────┐         ┌──────────────────┐     │
│  │  Pet Panel Provider  │         │  LLM Service     │     │
│  │  (TreeView/Webview)  │◄────────┤  - API calls     │     │
│  │  - Render pets       │         │  - Context prep  │     │
│  │  - Handle clicks     │         │  - Response parse│     │
│  │  - Show bubbles      │         └────────┬─────────┘     │
│  └──────────┬───────────┘                  │               │
│             │                               │               │
│             │         ┌─────────────────────┴─────────┐    │
│             │         │  Configuration Manager        │    │
│             │         │  - API key storage (secrets)  │    │
│             │         │  - Frequency settings         │    │
│             │         │  - Pet selection              │    │
│             │         └───────────────────────────────┘    │
│             │                                               │
└─────────────┼───────────────────────────────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │   Webview Panel     │
    │  ┌───────────────┐  │
    │  │ HTML/CSS/JS   │  │
    │  │ - Sprite anim │  │
    │  │ - Speech bubble│ │
    │  │ - Click events│  │
    │  └───────────────┘  │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │  External LLM API   │
    │  (OpenAI-compatible)│
    └─────────────────────┘
```

### Component Interaction Flow

1. **Extension Activation**: Extension registers commands, initializes the pet panel provider, and sets up configuration listeners
2. **Pet Display**: TreeView provider creates a webview panel that renders the selected pet with sprite animations
3. **Code Monitoring**: Extension monitors active editor text changes and tracks cumulative character count
4. **Commentary Generation**: When character count threshold is reached, the LLM service extracts code context and sends it to the external API
5. **Response Display**: LLM response is sent to the webview, which displays it in a speech bubble
6. **User Interaction**: Click events on pets trigger interaction animations via webview messaging

## Components and Interfaces

### 1. Extension Entry Point (`extension.ts`)

**Responsibilities:**
- Register extension activation
- Initialize all providers and services
- Set up command handlers
- Manage extension lifecycle

**Key Functions:**
```typescript
export function activate(context: vscode.ExtensionContext): void
export function deactivate(): void
```

### 2. Pet Panel Provider (`PetPanelProvider.ts`)

**Responsibilities:**
- Manage the webview panel in the Explorer sidebar
- Handle communication between extension and webview
- Coordinate pet rendering and animation
- Display speech bubbles with commentary

**Interface:**
```typescript
interface PetPanelProvider {
  resolveWebviewView(webviewView: vscode.WebviewView): void
  showPet(petType: PetType): void
  showSpeechBubble(message: string): void
  hideSpeechBubble(): void
  triggerInteractionAnimation(): void
}

enum PetType {
  Pumpkin = 'pumpkin',
  Skeleton = 'skeleton',
  Ghost = 'ghost'
}
```

### 3. LLM Service (`LLMService.ts`)

**Responsibilities:**
- Make API calls to OpenAI-compatible endpoints
- Prepare code context from active editor
- Format prompts with pet personality
- Parse and validate LLM responses
- Handle API errors and retries

**Interface:**
```typescript
interface LLMService {
  generateCommentary(codeContext: string, personality: string): Promise<string>
  extractCodeContext(editor: vscode.TextEditor): string
  validateApiKey(apiKey: string): Promise<boolean>
}

interface LLMRequest {
  model: string
  messages: Array<{role: string, content: string}>
  max_tokens: number
  temperature: number
}

interface LLMResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}
```

### 4. Configuration Manager (`ConfigurationManager.ts`)

**Responsibilities:**
- Store and retrieve API key securely using VS Code secrets API
- Manage user settings (frequency, pet selection, custom prompts)
- Provide configuration change notifications

**Interface:**
```typescript
interface ConfigurationManager {
  getApiKey(): Promise<string | undefined>
  setApiKey(apiKey: string): Promise<void>
  getCommentaryFrequency(): number
  setCommentaryFrequency(characterCount: number): void
  getSelectedPet(): PetType
  setSelectedPet(pet: PetType): void
  getCustomPrompt(pet: PetType): string | undefined
  setCustomPrompt(pet: PetType, prompt: string): void
}
```

### 5. Commentary Scheduler (`CommentaryScheduler.ts`)

**Responsibilities:**
- Track text changes in the active editor
- Monitor cumulative character count since last commentary
- Trigger LLM service when character threshold is reached
- Coordinate with pet panel to display results

**Interface:**
```typescript
interface CommentaryScheduler {
  start(): void
  stop(): void
  updateFrequency(characterCount: number): void
  triggerManualCommentary(): Promise<void>
  resetCharacterCount(): void
}
```

### 6. Sprite Animation Manager (Webview - `petView.js`)

**Responsibilities:**
- Load and parse sprite map PNG files
- Animate pet movement (left/right)
- Handle interaction animations
- Render speech bubbles
- Process messages from extension host

**Interface:**
```typescript
interface SpriteAnimationManager {
  loadSprite(petType: PetType): void
  startIdleAnimation(): void
  playInteractionAnimation(): void
  showSpeechBubble(text: string): void
  hideSpeechBubble(): void
}
```

### 7. Personality Definitions (`personalities.ts`)

**Responsibilities:**
- Define default personality prompts for each pet
- Provide personality-specific system messages for LLM

**Data Structure:**
```typescript
interface Personality {
  systemPrompt: string
  commentaryStyle: string
  exampleComments: string[]
}

const PERSONALITIES: Record<PetType, Personality>
```

## Data Models

### Pet Configuration

```typescript
interface PetConfig {
  type: PetType
  spriteSheet: string  // Path to PNG sprite map
  frameWidth: number
  frameHeight: number
  idleFrames: number[]
  walkLeftFrames: number[]
  walkRightFrames: number[]
  interactionFrames: number[]
  happyExpressionFrames: number[]  // NEW: 2-3 frames for happy expression
  neutralExpressionFrames: number[]  // NEW: 2-3 frames for neutral expression
  concernedExpressionFrames: number[]  // NEW: 2-3 frames for concerned expression
  frameDuration: number  // milliseconds per frame
}

enum ExpressionType {
  Happy = 'happy',
  Neutral = 'neutral',
  Concerned = 'concerned'
}
```

### Code Context

```typescript
interface CodeContext {
  language: string
  snippet: string
  lineNumber: number
  fileName: string
}
```

### Commentary Request

```typescript
interface CommentaryRequest {
  codeContext: CodeContext
  petType: PetType
  personality: string
  timestamp: number
}
```

### Commentary Response

```typescript
interface CommentaryResponse {
  message: string
  petType: PetType
  timestamp: number
  success: boolean
  error?: string
}

// NEW: Structured LLM Response
interface StructuredCommentaryResponse {
  commentary: string  // The text to display in the speech bubble
  expression: ExpressionType  // Which expression animation to show
  sentiment?: number  // Optional: -1 to 1 scale for fine-grained sentiment
}
```

### Extension Settings

```typescript
interface ExtensionSettings {
  'spookyPets.apiKey': string  // Stored in secrets
  'spookyPets.commentaryFrequency': number  // characters written
  'spookyPets.selectedPet': PetType
  'spookyPets.customPrompts': Record<PetType, string>
  'spookyPets.apiEndpoint': string  // OpenAI-compatible endpoint
  'spookyPets.model': string  // Model name
  'spookyPets.maxTokens': number
  'spookyPets.contextLines': number  // Lines of code to include
}
```

## Expressive Reactions Feature

### Overview

The expressive reactions feature enhances pet engagement by having them display emotional reactions based on code quality assessment. When providing commentary, pets will pause their movement, display an appropriate expression animation (happy, neutral, or concerned), and show a speech bubble with their thoughts.

### Design Approach

**Structured LLM Responses:**
- Use JSON schema validation (via Zod library) to ensure LLM responses follow a predictable structure
- Request LLM to return both commentary text and an expression indicator
- Validate responses and fall back to neutral expression if parsing fails

**Expression Animations:**
- Add 2-3 frame animation sequences for each expression type to sprite sheets
- Happy: Bouncing, excited, or smiling animation
- Neutral: Calm, observant, or thinking animation  
- Concerned: Worried, confused, or cautious animation

**Animation State Management:**
- When commentary is triggered, pause normal movement/idle behavior
- Play the appropriate expression animation on loop while speech bubble is visible
- Resume normal behavior when speech bubble is dismissed

### Implementation Details

**LLM Service Changes:**

```typescript
// Add Zod schema for response validation
import { z } from 'zod';

const CommentaryResponseSchema = z.object({
  commentary: z.string().min(1).max(200),
  expression: z.enum(['happy', 'neutral', 'concerned'])
});

// Update LLM prompt to request structured output
const systemPrompt = `${personality}

IMPORTANT: You must respond with valid JSON in this exact format:
{
  "commentary": "Your 1-2 sentence comment here",
  "expression": "happy" | "neutral" | "concerned"
}

Expression guidelines:
- "happy": Use when code is well-written, elegant, or shows good practices
- "neutral": Use for observations, questions, or neutral commentary
- "concerned": Use when spotting potential bugs, code smells, or areas for improvement`;

// Parse and validate response
function parseStructuredResponse(rawResponse: string): StructuredCommentaryResponse {
  try {
    const parsed = JSON.parse(rawResponse);
    const validated = CommentaryResponseSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.warn('[LLMService] Failed to parse structured response, using fallback');
    return {
      commentary: rawResponse,
      expression: 'neutral'
    };
  }
}
```

**Pet Panel Provider Changes:**

```typescript
// Update showSpeechBubble to accept expression
showSpeechBubbleWithExpression(message: string, expression: ExpressionType): void {
  if (this._view) {
    this._view.webview.postMessage({
      type: 'showSpeechBubbleWithExpression',
      message: message,
      expression: expression
    });
  }
}
```

**Webview Animation Manager Changes:**

```typescript
// Add expression animation state
this.isShowingExpression = false;
this.currentExpression = null;

// Handle new message type
case 'showSpeechBubbleWithExpression':
  this.showSpeechBubbleWithExpression(message.message, message.expression);
  break;

// New method to show speech bubble with expression
showSpeechBubbleWithExpression(text, expression) {
  // Pause normal behavior
  this.isShowingExpression = true;
  this.currentExpression = expression;
  
  // Switch to expression animation
  this.currentAnimation = `${expression}Expression`;
  this.currentFrameIndex = 0;
  
  // Show speech bubble
  this.speechBubbleContent.textContent = text;
  this.speechBubble.classList.remove('hidden');
}

// Update hideSpeechBubble to resume normal behavior
hideSpeechBubble() {
  this.speechBubble.classList.add('hidden');
  this.speechBubbleContent.textContent = '';
  
  // Resume normal behavior
  this.isShowingExpression = false;
  this.currentExpression = null;
  this.currentAnimation = 'idle';
  this.currentFrameIndex = 0;
}

// Update animation logic to handle expression state
animate(currentTime) {
  // ... existing code ...
  
  // Don't change behavior or move if showing expression
  if (!this.isShowingExpression) {
    this.updatePosition();
    if (currentTime >= this.nextBehaviorChange) {
      this.changeBehavior(currentTime);
    }
  }
  
  // ... rest of animation code ...
}
```

**Sprite Sheet Updates:**

Each pet sprite sheet will need to be extended with expression frames:
- Frames 16-18: Happy expression (3 frames)
- Frames 19-21: Neutral expression (3 frames)
- Frames 22-24: Concerned expression (3 frames)

### Fallback Behavior

- If LLM response is not valid JSON, extract text and use neutral expression
- If expression field is missing or invalid, default to neutral
- If expression frames are missing from sprite sheet, use idle frames
- Log warnings for debugging but never crash

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Single pet visibility invariant
*For any* extension state where the pet panel is visible, exactly one pet should be rendered and visible at any given time.
**Validates: Requirements 1.2, 7.5**

### Property 2: Sprite animation frame cycling
*For any* active pet, the animation system should cycle through the correct sprite map frames for the current animation state (idle, walk left, walk right, interaction).
**Validates: Requirements 1.3**

### Property 3: Click triggers interaction animation
*For any* pet, when a click event is received, the interaction animation should be triggered and play through its frame sequence.
**Validates: Requirements 1.4**

### Property 4: Pet personality mapping
*For any* pet type (pumpkin, skeleton, ghost), when that pet is active and no custom prompt is configured, the LLM request should include the predefined personality prompt for that specific pet type.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 5: Custom prompt override
*For any* pet with a custom personality prompt configured, all LLM requests for that pet should use the custom prompt instead of the predefined personality.
**Validates: Requirements 2.4**

### Property 6: Personality consistency
*For any* sequence of commentary requests for the same pet without configuration changes, all requests should use the same personality prompt.
**Validates: Requirements 2.5**

### Property 7: API key secure storage
*For any* API key operation (store or update), the extension should use VS Code's secrets API and the key should be retrievable from secure storage.
**Validates: Requirements 3.2, 3.5**

### Property 8: API key retrieval for LLM requests
*For any* LLM request, the extension should retrieve the API key from secure storage before making the API call.
**Validates: Requirements 3.3**

### Property 9: OpenAI API format compliance
*For any* LLM request, the request payload should conform to the OpenAI API standard with required fields (model, messages, max_tokens).
**Validates: Requirements 3.4**

### Property 10: Code context inclusion
*For any* commentary generation request, the LLM request should include code context extracted from the active editor, and the context should be bounded to a reasonable portion around the cursor position (not the entire file). 
**Validates: Requirements 4.1, 4.2**

### Property 11: Response length limiting
*For any* LLM request, the max_tokens parameter should be set to ensure brief commentary responses, fitting within the speech bubble.
**Validates: Requirements 4.3**

### Property 12: Speech bubble display on response
*For any* successful LLM response, a speech bubble should be displayed containing the commentary text.
**Validates: Requirements 4.4**

### Property 13: Commentary frequency character tracking
*For any* configured commentary frequency value (in characters), when the cumulative character count written reaches or exceeds the configured threshold, commentary generation should be triggered.
**Validates: Requirements 5.2, 5.3**

### Property 14: Visual processing indicator
*For any* commentary generation in progress, a visual indicator should be displayed until the commentary is ready or an error occurs.
**Validates: Requirements 6.1**

### Property 15: Speech bubble replacement
*For any* new commentary generated while a speech bubble is visible, the new commentary should replace the existing speech bubble content.
**Validates: Requirements 6.2, 6.4**

### Property 16: Speech bubble positioning
*For any* displayed speech bubble, its position should be calculated relative to the pet's position and remain visible within the panel bounds.
**Validates: Requirements 6.3**

### Property 17: Single speech bubble invariant
*For any* extension state, at most one speech bubble should be visible at any given time.
**Validates: Requirements 6.5**

### Property 18: Pet switch state transition
*For any* pet selection change, the previously active pet should be hidden, the newly selected pet should be displayed, and the panel dimensions should remain unchanged.
**Validates: Requirements 7.2, 7.3**

### Property 19: Personality propagation on pet switch
*For any* pet switch, subsequent commentary requests should use the personality associated with the newly selected pet.
**Validates: Requirements 7.4**

### Property 20: API failure resilience
*For any* LLM API request failure, the extension should log the error, remain operational, and not crash.
**Validates: Requirements 8.1**

### Property 21: Invalid API key handling
*For any* LLM request with an invalid or missing API key, the extension should display an error message and prompt the user for a valid key.
**Validates: Requirements 8.2**

### Property 22: Network failure retry behavior
*For any* commentary request that fails due to network unavailability, the request should be queued and retried when connectivity is restored.
**Validates: Requirements 8.3**

### Property 23: Sprite loading fallback
*For any* sprite map file that fails to load, the extension should display a fallback visual representation instead of crashing.
**Validates: Requirements 8.4**

### Property 24: Error logging
*For any* error that occurs during extension operation, diagnostic information should be logged for troubleshooting.
**Validates: Requirements 8.5**

### Property 25: Structured response parsing
*For any* LLM response, the extension should attempt to parse it as a structured JSON response containing commentary and expression fields, and fall back to neutral expression if parsing fails.
**Validates: Requirements 9.1, 9.7**

### Property 26: Expression animation mapping
*For any* valid expression indicator (happy, neutral, concerned) in the LLM response, the pet should display the corresponding expression animation.
**Validates: Requirements 9.2, 9.3, 9.4**

### Property 27: Movement pause during commentary
*For any* pet displaying commentary with a speech bubble, the pet's movement and behavior change animations should be paused until the speech bubble is dismissed.
**Validates: Requirements 9.5**

### Property 28: Behavior resumption after commentary
*For any* pet that was displaying commentary, when the speech bubble is hidden, the pet should return to its normal idle and movement behavior.
**Validates: Requirements 9.6**

## Error Handling

### API Errors

**Invalid API Key:**
- Detect invalid key responses (401/403 status codes)
- Display user-friendly notification with action to update key
- Prevent repeated failed requests
- Store validation state to avoid unnecessary API calls

**Rate Limiting:**
- Detect rate limit responses (429 status code)
- Implement exponential backoff for retries
- Display notification to user about rate limiting
- Adjust commentary frequency temporarily if needed

**Network Errors:**
- Catch network connectivity failures
- Queue pending commentary requests
- Implement retry logic with timeout
- Display offline indicator in pet panel

**Malformed Responses:**
- Validate LLM response structure
- Handle missing or unexpected fields gracefully
- Log malformed responses for debugging
- Display generic error message to user

### Resource Errors

**Missing Sprite Files:**
- Validate sprite file existence at startup
- Use fallback colored rectangles if sprites missing
- Log missing resource errors
- Continue extension operation with degraded visuals

**Corrupted Sprite Files:**
- Catch image loading errors
- Validate sprite dimensions match configuration
- Fall back to alternative visual representation
- Notify user of resource issues

### Configuration Errors

**Invalid Settings:**
- Validate configuration values on change
- Provide sensible defaults for invalid values
- Display warnings for out-of-range values
- Prevent extension crashes from bad configuration

**Missing Required Configuration:**
- Detect missing API key on first use
- Prompt user with clear instructions
- Disable commentary features until configured
- Allow pet display without commentary

### Runtime Errors

**Webview Communication Failures:**
- Implement message timeout handling
- Retry failed webview messages
- Log communication errors
- Gracefully degrade functionality if webview unresponsive

**Unexpected Exceptions:**
- Wrap critical code paths in try-catch blocks
- Log full error stack traces
- Display user-friendly error messages
- Ensure extension remains active after errors

## Testing Strategy

The Spooky Code Pets extension will use a dual testing approach combining unit tests and property-based tests to ensure comprehensive coverage and correctness.

### Unit Testing

Unit tests will verify specific examples, edge cases, and integration points:

**Configuration Manager:**
- Test API key storage and retrieval with specific values
- Test setting updates trigger appropriate events
- Test default values are applied correctly

**LLM Service:**
- Test code context extraction with sample editor content
- Test API request formatting with known inputs
- Test response parsing with sample API responses
- Test error handling with specific error scenarios

**Pet Panel Provider:**
- Test webview initialization
- Test message passing between extension and webview
- Test pet switching with specific pet types

**Commentary Scheduler:**
- Test scheduler starts and stops correctly
- Test manual commentary trigger
- Test character count tracking and threshold triggering
- Test character count reset after commentary

**Sprite Animation (Webview):**
- Test sprite loading with sample sprite sheets
- Test animation frame calculations
- Test speech bubble positioning with known coordinates

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript/TypeScript property-based testing library).

**Configuration:**
- Each property-based test will run a minimum of 100 iterations
- Tests will use fast-check's built-in and custom generators
- Each test will be tagged with a comment referencing the design document property

**Test Tagging Format:**
```typescript
// Feature: spooky-code-pets, Property 1: Single pet visibility invariant
```

**Property Test Coverage:**

Each correctness property defined in this document will be implemented as a single property-based test:

- Property 1: Single pet visibility invariant
- Property 2: Sprite animation frame cycling
- Property 3: Click triggers interaction animation
- Property 4: Pet personality mapping
- Property 5: Custom prompt override
- Property 6: Personality consistency
- Property 7: API key secure storage
- Property 8: API key retrieval for LLM requests
- Property 9: OpenAI API format compliance
- Property 10: Code context inclusion
- Property 11: Response length limiting
- Property 12: Speech bubble display on response
- Property 13: Commentary frequency character tracking
- Property 14: Visual processing indicator
- Property 15: Speech bubble replacement
- Property 16: Speech bubble positioning
- Property 17: Single speech bubble invariant
- Property 18: Pet switch state transition
- Property 19: Personality propagation on pet switch
- Property 20: API failure resilience
- Property 21: Invalid API key handling
- Property 22: Network failure retry behavior
- Property 23: Sprite loading fallback
- Property 24: Error logging

**Custom Generators:**

Property tests will use custom generators for domain-specific types:
- Pet type generator (pumpkin, skeleton, ghost)
- Code context generator (various programming languages and snippets)
- API response generator (success and error responses)
- Configuration value generator (valid and edge-case values)
- Sprite configuration generator

### Integration Testing

Integration tests will verify end-to-end workflows:
- Extension activation → pet display → commentary generation → speech bubble display
- API key configuration → LLM request → response handling
- Pet switching → personality change → commentary with new personality
- Error scenarios → graceful degradation → recovery

### Manual Testing

Manual testing will cover subjective aspects:
- Visual appearance of pets and animations
- Speech bubble readability and positioning
- User experience of configuration flow
- Commentary quality and entertainment value

### Test Execution

- Unit tests and property tests will run on every build
- Integration tests will run before releases
- Manual testing will be performed during development iterations
- All tests must pass before merging changes

## Implementation Notes

### VS Code Extension APIs

**Webview API:**
- Use `vscode.window.createWebviewPanel` or `vscode.window.registerWebviewViewProvider` for pet display
- Implement message passing with `webview.postMessage` and `webview.onDidReceiveMessage`
- Use `asWebviewUri` for loading local resources (sprites, CSS, JS)

**Secrets API:**
- Use `context.secrets.store` for API key storage
- Use `context.secrets.get` for API key retrieval
- Secrets are encrypted and stored securely by VS Code

**Configuration API:**
- Use `vscode.workspace.getConfiguration` for reading settings
- Use `vscode.workspace.onDidChangeConfiguration` for listening to changes
- Define configuration schema in `package.json` contributes section

**Text Editor API:**
- Use `vscode.window.activeTextEditor` to get current editor
- Use `editor.selection` to get cursor position
- Use `editor.document.getText` to extract code context

### Sprite Sheet Format

Sprite sheets will be PNG files with frames arranged in a grid:
- Each frame is a fixed width × height rectangle
- Frames are arranged left-to-right, top-to-bottom
- Frame indices are zero-based
- Configuration specifies frame dimensions and animation sequences

Example sprite configuration:
```typescript
{
  type: PetType.pumpkin,
  spriteSheet: 'pumpkin-sprites.png',
  frameWidth: 64,
  frameHeight: 64,
  idleFrames: [0, 1, 2, 3],
  walkLeftFrames: [4, 5, 6, 7],
  walkRightFrames: [8, 9, 10, 11],
  interactionFrames: [12, 13, 14, 15],
  frameDuration: 150
}
```

### LLM Integration

**OpenAI-Compatible API:**
- Endpoint: Configurable (default: https://api.openai.com/v1/chat/completions)
- Authentication: Bearer token in Authorization header
- Request format: JSON with model, messages, max_tokens, temperature
- Response format: JSON with choices array containing message content

**Prompt Engineering:**
- System message: Pet personality definition
- User message: Code context with instructions
- Temperature: 0.7-0.9 for creative commentary
- Max tokens: 50-100 for brief responses

**Context Preparation:**
- Extract 10-20 lines around cursor position
- Include language identifier
- Include file name for context
- Truncate if exceeds token limits

### Performance Considerations

**Webview Optimization:**
- Use CSS transforms for sprite positioning (GPU-accelerated)
- Implement requestAnimationFrame for smooth animations
- Lazy load sprites only when needed
- Cache sprite images in webview

**API Rate Limiting:**
- Implement minimum character threshold between requests (e.g., 100 characters)
- Queue requests if user triggers multiple manually
- Cancel pending requests if new one is triggered
- Respect API provider rate limits

**Memory Management:**
- Dispose webview when panel is closed
- Clear timers and intervals on deactivation
- Remove event listeners properly
- Limit commentary history storage

### Security Considerations

**API Key Protection:**
- Never log API keys
- Use VS Code secrets API (encrypted storage)
- Don't include keys in error messages
- Clear keys from memory after use

**Code Context Privacy:**
- Only send minimal code context to LLM
- Allow users to disable commentary
- Don't send sensitive file paths
- Respect .gitignore patterns for context extraction

**Webview Security:**
- Use Content Security Policy (CSP)
- Sanitize any user-provided content
- Restrict webview script execution
- Use nonce for inline scripts

### Extensibility

**Adding New Pets:**
- Define new PetType enum value
- Add sprite sheet and configuration
- Define personality in personalities.ts
- No code changes required in core logic

**Custom LLM Providers:**
- Support configurable API endpoints
- Allow custom request/response transformers
- Support different authentication methods
- Provide adapter pattern for non-OpenAI APIs

**Animation Extensions:**
- Support additional animation types
- Allow custom frame sequences
- Support sprite sheet variations
- Enable community-contributed sprites

## Dependencies

### Required npm Packages

```json
{
  "dependencies": {
    "node-fetch": "^3.3.0"  // For HTTP requests to LLM API
  },
  "devDependencies": {
    "@types/vscode": "^1.106.1",
    "@types/node": "^22.x",
    "typescript": "^5.9.3",
    "fast-check": "^3.15.0",  // Property-based testing
    "@types/mocha": "^10.0.10",
    "mocha": "^10.0.0",
    "@vscode/test-cli": "^0.0.12",
    "@vscode/test-electron": "^2.5.2"
  }
}
```

### VS Code API Requirements

- Minimum VS Code version: 1.106.1
- Required APIs: Webview, Secrets, Configuration, Text Editor
- Optional APIs: None

## Deployment

### Extension Packaging

- Bundle with webpack for optimized size
- Include sprite sheets in extension package
- Minify webview assets (HTML, CSS, JS)
- Generate .vsix file for distribution

### Configuration Schema

Define in package.json:
```json
{
  "contributes": {
    "configuration": {
      "title": "Spooky Code Pets",
      "properties": {
        "spookyPets.commentaryFrequency": {
          "type": "number",
          "default": 200,
          "minimum": 0,
          "description": "Characters written before automatic commentary (0 to disable)"
        },
        "spookyPets.selectedPet": {
          "type": "string",
          "enum": ["pumpkin", "skeleton", "ghost"],
          "default": "pumpkin",
          "description": "Currently active pet"
        },
        "spookyPets.apiEndpoint": {
          "type": "string",
          "default": "https://api.openai.com/v1/chat/completions",
          "description": "OpenAI-compatible API endpoint"
        },
        "spookyPets.model": {
          "type": "string",
          "default": "gpt-3.5-turbo",
          "description": "LLM model name"
        },
        "spookyPets.maxTokens": {
          "type": "number",
          "default": 75,
          "minimum": 20,
          "maximum": 200,
          "description": "Maximum tokens for commentary responses"
        },
        "spookyPets.contextLines": {
          "type": "number",
          "default": 15,
          "minimum": 5,
          "maximum": 50,
          "description": "Lines of code to include in context"
        }
      }
    }
  }
}
```

### Commands

```json
{
  "contributes": {
    "commands": [
      {
        "command": "spookyPets.setApiKey",
        "title": "Spooky Pets: Set API Key"
      },
      {
        "command": "spookyPets.selectPet",
        "title": "Spooky Pets: Select Pet"
      },
      {
        "command": "spookyPets.triggerCommentary",
        "title": "Spooky Pets: Trigger Commentary Now"
      },
      {
        "command": "spookyPets.clearApiKey",
        "title": "Spooky Pets: Clear API Key"
      }
    ]
  }
}
```

### Views

```json
{
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "spooky-pets",
          "title": "Spooky Pets",
          "icon": "resources/ghost-icon.svg"
        }
      ]
    },
    "views": {
      "spooky-pets": [
        {
          "type": "webview",
          "id": "spookyPets.petView",
          "name": "Pet"
        }
      ]
    }
  }
}
```
