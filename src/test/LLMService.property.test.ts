import * as assert from 'assert';
import * as fc from 'fast-check';
import * as vscode from 'vscode';
import { suite, test, setup, teardown } from 'mocha';
import { LLMService, LLMRequest } from '../services/LLMService.js';
import { ConfigurationManager } from '../services/ConfigurationManager.js';
import { CodeContext } from '../models/CodeContext.js';
import { PetType } from '../models/PetType.js';

/**
 * Mock implementation of VS Code's SecretStorage for testing
 */
class MockSecretStorage implements vscode.SecretStorage {
  private storage = new Map<string, string>();
  
  onDidChange: vscode.Event<vscode.SecretStorageChangeEvent> = new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event;

  async get(key: string): Promise<string | undefined> {
    return this.storage.get(key);
  }

  async store(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * Create a mock ExtensionContext for testing
 */
function createMockContext(): vscode.ExtensionContext {
  const secrets = new MockSecretStorage();
  const subscriptions: vscode.Disposable[] = [];

  return {
    secrets,
    subscriptions,
    workspaceState: {} as any,
    globalState: {} as any,
    extensionUri: vscode.Uri.file(''),
    extensionPath: '',
    environmentVariableCollection: {} as any,
    asAbsolutePath: (relativePath: string) => relativePath,
    storageUri: undefined,
    storagePath: undefined,
    globalStorageUri: vscode.Uri.file(''),
    globalStoragePath: '',
    logUri: vscode.Uri.file(''),
    logPath: '',
    extensionMode: vscode.ExtensionMode.Test,
    extension: {} as any,
    languageModelAccessInformation: {} as any
  };
}

suite('LLMService Property Tests', () => {
  let context: vscode.ExtensionContext;
  let configManager: ConfigurationManager;
  let llmService: LLMService;

  setup(async () => {
    context = createMockContext();
    configManager = new ConfigurationManager(context);
    // Set a test API key
    await configManager.setApiKey('test-api-key');
    llmService = new LLMService(configManager);
  });

  teardown(async () => {
    await configManager.clearApiKey();
    configManager.dispose();
    
    if (context.secrets instanceof MockSecretStorage) {
      context.secrets.clear();
    }
  });

  // Feature: spooky-code-pets, Property 9: OpenAI API format compliance
  // Validates: Requirements 3.4
  test('Property 9: All LLM requests conform to OpenAI API format', () => {
    return fc.assert(
      fc.property(
        fc.record({
          language: fc.constantFrom('typescript', 'javascript', 'python', 'java', 'go'),
          snippet: fc.string({ minLength: 10, maxLength: 500 }),
          lineNumber: fc.integer({ min: 1, max: 1000 }),
          fileName: fc.string({ minLength: 1, maxLength: 100 }).map(s => `${s}.ts`)
        }),
        fc.string({ minLength: 20, maxLength: 500 }),
        (codeContext: CodeContext, personality: string) => {
          // Build the request using the public method
          const request = llmService.buildRequest(codeContext, personality);

          // Verify OpenAI API format compliance
          assert.ok(request, 'Request should be built');
          assert.ok(request.model, 'Request must have model field');
          assert.ok(typeof request.model === 'string', 'Model must be a string');
          
          assert.ok(Array.isArray(request.messages), 'Request must have messages array');
          assert.ok(request.messages.length >= 2, 'Must have at least system and user messages');
          
          assert.ok(typeof request.max_tokens === 'number', 'Request must have max_tokens as number');
          assert.ok(request.max_tokens > 0, 'max_tokens must be positive');
          
          assert.ok(typeof request.temperature === 'number', 'Request must have temperature as number');
          assert.ok(request.temperature >= 0 && request.temperature <= 2, 'Temperature must be between 0 and 2');
          
          // Verify messages structure
          for (const message of request.messages) {
            assert.ok(message.role, 'Each message must have a role');
            assert.ok(message.content, 'Each message must have content');
            assert.ok(typeof message.role === 'string', 'Role must be a string');
            assert.ok(typeof message.content === 'string', 'Content must be a string');
            assert.ok(['system', 'user', 'assistant'].includes(message.role), 'Role must be valid OpenAI role');
          }
          
          // Verify system message is first
          assert.strictEqual(request.messages[0].role, 'system', 'First message must be system message');
          assert.strictEqual(request.messages[0].content, personality, 'System message must contain personality');
          
          // Verify user message contains code context
          assert.strictEqual(request.messages[1].role, 'user', 'Second message must be user message');
          assert.ok(request.messages[1].content.includes(codeContext.snippet), 'User message must include code snippet');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: spooky-code-pets, Property 10: Code context inclusion
  // Validates: Requirements 4.1, 4.2
  test('Property 10: Code context extraction includes bounded context around cursor', () => {
    return fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }), // cursor line
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 10, maxLength: 200 }), // document lines
        (cursorLine: number, documentLines: string[]) => {
          // Ensure cursor line is within document bounds
          const actualCursorLine = Math.min(cursorLine, documentLines.length - 1);
          
          // Create a mock text document
          const documentText = documentLines.join('\n');
          const mockDocument = {
            getText: (range?: vscode.Range) => {
              if (!range) {
                return documentText;
              }
              const lines = documentLines.slice(range.start.line, range.end.line + 1);
              if (lines.length === 0) {
                return '';
              }
              // Handle partial line extraction
              if (lines.length === 1) {
                return lines[0].substring(range.start.character, range.end.character);
              }
              lines[0] = lines[0].substring(range.start.character);
              lines[lines.length - 1] = lines[lines.length - 1].substring(0, range.end.character);
              return lines.join('\n');
            },
            lineCount: documentLines.length,
            lineAt: (line: number) => ({
              text: documentLines[line] || '',
              range: new vscode.Range(line, 0, line, (documentLines[line] || '').length)
            }),
            languageId: 'typescript',
            fileName: 'test.ts'
          } as any;

          const mockEditor = {
            document: mockDocument,
            selection: {
              active: new vscode.Position(actualCursorLine, 0)
            }
          } as any;

          // Extract code context
          const context = llmService.extractCodeContext(mockEditor);

          // Verify context is bounded (not the entire file)
          const contextLines = context.snippet.split('\n').length;
          const configuredContextLines = configManager.getContextLines();
          
          // Context should not exceed configured limit
          assert.ok(contextLines <= configuredContextLines, 
            `Context lines (${contextLines}) should not exceed configured limit (${configuredContextLines})`);
          
          // Context should be centered around cursor position (within bounds)
          assert.ok(context.lineNumber === actualCursorLine + 1, 
            `Context line number should match cursor position`);
          
          // Context should include the language
          assert.strictEqual(context.language, 'typescript', 'Context should include language');
          
          // Context should include the file name
          assert.strictEqual(context.fileName, 'test.ts', 'Context should include file name');
          
          // Context snippet should not be empty (unless document is empty)
          if (documentLines.length > 0 && documentLines.some(line => line.length > 0)) {
            assert.ok(context.snippet.length > 0, 'Context snippet should not be empty for non-empty documents');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: spooky-code-pets, Property 11: Response length limiting
  // Validates: Requirements 4.3
  test('Property 11: LLM requests set max_tokens to ensure brief responses', () => {
    return fc.assert(
      fc.property(
        fc.record({
          language: fc.constantFrom('typescript', 'javascript', 'python', 'java', 'go'),
          snippet: fc.string({ minLength: 10, maxLength: 500 }),
          lineNumber: fc.integer({ min: 1, max: 1000 }),
          fileName: fc.string({ minLength: 1, maxLength: 100 }).map(s => `${s}.ts`)
        }),
        fc.string({ minLength: 20, maxLength: 500 }),
        (codeContext: CodeContext, personality: string) => {
          // Build the request
          const request = llmService.buildRequest(codeContext, personality);

          // Verify max_tokens is set to limit response length
          const maxTokens = configManager.getMaxTokens();
          assert.strictEqual(request.max_tokens, maxTokens, 
            'Request max_tokens should match configured value');
          
          // Verify max_tokens is reasonable for brief commentary (not too large)
          assert.ok(request.max_tokens <= 200, 
            'max_tokens should be limited to ensure brief responses (<=200)');
          
          // Verify max_tokens is positive
          assert.ok(request.max_tokens > 0, 
            'max_tokens must be positive');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: spooky-code-pets, Property 8: API key retrieval for LLM requests
  // Validates: Requirements 3.3
  test('Property 8: LLM service retrieves API key from secure storage before requests', async () => {
    return fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 100 }), // API key
        async (apiKey: string) => {
          // Create a fresh context and services for this test
          const testContext = createMockContext();
          const testConfigManager = new ConfigurationManager(testContext);
          const testLLMService = new LLMService(testConfigManager);
          
          // Set the API key in secure storage
          await testConfigManager.setApiKey(apiKey);
          
          // Verify the key is stored and can be retrieved
          const storedKey = await testConfigManager.getApiKey();
          assert.strictEqual(storedKey, apiKey, 'API key should be stored in secure storage');
          
          // Verify that when generateCommentary is called, it attempts to retrieve the API key
          // We test this by ensuring that without an API key, it throws an error
          await testConfigManager.clearApiKey();
          
          const codeContext: CodeContext = {
            language: 'typescript',
            snippet: 'const x = 1;',
            lineNumber: 1,
            fileName: 'test.ts'
          };
          
          try {
            await testLLMService.generateCommentary(codeContext, 'test personality');
            assert.fail('Should have thrown error for missing API key');
          } catch (error) {
            assert.ok(error instanceof Error, 'Should throw an Error');
            assert.ok(error.message.includes('API key'), 'Error should mention API key');
          }
          
          // Now set the API key and verify it's retrieved (we can't test actual API call without mocking)
          await testConfigManager.setApiKey(apiKey);
          const retrievedKey = await testConfigManager.getApiKey();
          assert.strictEqual(retrievedKey, apiKey, 'API key should be retrievable for LLM requests');
          
          // Clean up
          await testConfigManager.clearApiKey();
          testConfigManager.dispose();
        }
      ),
      { numRuns: 100 }
    );
  });
});

  // Feature: spooky-code-pets, Property 20: API failure resilience
  // Validates: Requirements 8.1
  test('Property 20: Extension remains operational after API failures', async function() {
    // Increase timeout for this test since it makes actual API calls
    this.timeout(60000);
    
    return fc.assert(
      fc.asyncProperty(
        fc.record({
          language: fc.constantFrom('typescript', 'javascript', 'python'),
          snippet: fc.string({ minLength: 10, maxLength: 200 }),
          lineNumber: fc.integer({ min: 1, max: 100 }),
          fileName: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s}.ts`)
        }),
        fc.string({ minLength: 20, maxLength: 200 }),
        async (codeContext: CodeContext, personality: string) => {
          // Create a fresh context and services for this test
          const testContext = createMockContext();
          const testConfigManager = new ConfigurationManager(testContext);
          const testLLMService = new LLMService(testConfigManager);
          
          // Set an invalid API key to trigger API failure
          await testConfigManager.setApiKey('invalid-key-for-testing');
          
          // Attempt to generate commentary - this should fail but not crash the extension
          let errorThrown = false;
          
          try {
            await testLLMService.generateCommentary(codeContext, personality);
            // If we get here without error, the API might have succeeded (unlikely with invalid key)
          } catch (error) {
            errorThrown = true;
            assert.ok(error instanceof Error, 'Should throw an Error object');
            // The error should be a controlled error, not a crash
            assert.ok(error.message.length > 0, 'Error should have a message');
          }
          
          // The key assertion: the service should still be operational after the error
          // We can still call methods on it without crashing
          const request = testLLMService.buildRequest(codeContext, personality);
          assert.ok(request, 'Service should remain operational and able to build requests after API failure');
          assert.ok(request.model, 'Service should still function correctly after API failure');
          assert.ok(request.messages, 'Service should still build valid requests after API failure');
          
          // Verify we can extract code context (another operation that should still work)
          const mockEditor = {
            document: {
              getText: () => codeContext.snippet,
              lineCount: 10,
              lineAt: (line: number) => ({ text: 'test', range: {} as any }),
              languageId: codeContext.language,
              fileName: codeContext.fileName
            },
            selection: {
              active: { line: 5, character: 0 }
            }
          } as any;
          
          const extractedContext = testLLMService.extractCodeContext(mockEditor);
          assert.ok(extractedContext, 'Service should still extract code context after API failure');
          assert.ok(extractedContext.language, 'Extracted context should have language');
          
          // Clean up
          await testConfigManager.clearApiKey();
          testConfigManager.dispose();
        }
      ),
      { numRuns: 10 }
    );
  });
