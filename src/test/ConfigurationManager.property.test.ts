import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fc from 'fast-check';
import { suite, test, setup, teardown } from 'mocha';
import { ConfigurationManager } from '../services/ConfigurationManager.js';

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

suite('ConfigurationManager Property Tests', () => {
  let context: vscode.ExtensionContext;
  let configManager: ConfigurationManager;

  setup(() => {
    context = createMockContext();
    configManager = new ConfigurationManager(context);
  });

  teardown(async () => {
    // Clean up: clear any API keys that were set during tests
    await configManager.clearApiKey();
    configManager.dispose();
    
    // Clear the mock storage
    if (context.secrets instanceof MockSecretStorage) {
      context.secrets.clear();
    }
  });

  // Feature: spooky-code-pets, Property 7: API key secure storage
  // Validates: Requirements 3.2, 3.5
  test('Property 7: API key secure storage - store and retrieve operations use secure storage', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        async (apiKey) => {
          // Store the API key
          await configManager.setApiKey(apiKey);
          
          // Retrieve the API key
          const retrievedKey = await configManager.getApiKey();
          
          // The retrieved key should match the stored key
          assert.strictEqual(retrievedKey, apiKey, 
            `Expected retrieved key to match stored key. Stored: "${apiKey}", Retrieved: "${retrievedKey}"`);
          
          // Clean up for next iteration
          await configManager.clearApiKey();
          
          // After clearing, the key should be undefined
          const clearedKey = await configManager.getApiKey();
          assert.strictEqual(clearedKey, undefined,
            'Expected API key to be undefined after clearing');
        }
      ),
      { numRuns: 100 }
    );
  });
});
