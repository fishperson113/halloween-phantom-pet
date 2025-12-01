import * as assert from 'assert';
import * as vscode from 'vscode';
import { suite, test, setup, teardown } from 'mocha';
import { ConfigurationManager } from '../services/ConfigurationManager.js';
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

suite('ConfigurationManager Unit Tests', () => {
  let context: vscode.ExtensionContext;
  let configManager: ConfigurationManager;

  setup(() => {
    context = createMockContext();
    configManager = new ConfigurationManager(context);
  });

  teardown(async () => {
    await configManager.clearApiKey();
    configManager.dispose();
    
    if (context.secrets instanceof MockSecretStorage) {
      context.secrets.clear();
    }
  });

  suite('API Key Storage and Retrieval', () => {
    test('should store and retrieve a specific API key', async () => {
      const testApiKey = 'sk-test-1234567890abcdef';
      
      await configManager.setApiKey(testApiKey);
      const retrieved = await configManager.getApiKey();
      
      assert.strictEqual(retrieved, testApiKey);
    });

    test('should return undefined when no API key is set', async () => {
      const retrieved = await configManager.getApiKey();
      
      assert.strictEqual(retrieved, undefined);
    });

    test('should update API key when set multiple times', async () => {
      const firstKey = 'sk-first-key';
      const secondKey = 'sk-second-key';
      
      await configManager.setApiKey(firstKey);
      await configManager.setApiKey(secondKey);
      const retrieved = await configManager.getApiKey();
      
      assert.strictEqual(retrieved, secondKey);
    });

    test('should clear API key successfully', async () => {
      const testApiKey = 'sk-test-clear';
      
      await configManager.setApiKey(testApiKey);
      await configManager.clearApiKey();
      const retrieved = await configManager.getApiKey();
      
      assert.strictEqual(retrieved, undefined);
    });

    test('should handle empty string API key', async () => {
      const emptyKey = '';
      
      await configManager.setApiKey(emptyKey);
      const retrieved = await configManager.getApiKey();
      
      assert.strictEqual(retrieved, emptyKey);
    });

    test('should handle long API keys', async () => {
      const longKey = 'sk-' + 'a'.repeat(200);
      
      await configManager.setApiKey(longKey);
      const retrieved = await configManager.getApiKey();
      
      assert.strictEqual(retrieved, longKey);
    });
  });

  suite('Configuration Change Events', () => {
    test('should fire event when API key is set', async () => {
      let eventFired = false;
      
      const disposable = configManager.onConfigurationChanged(() => {
        eventFired = true;
      });
      
      await configManager.setApiKey('sk-test-event');
      
      assert.strictEqual(eventFired, true, 'Configuration change event should fire when API key is set');
      
      disposable.dispose();
    });

    test('should fire event when API key is cleared', async () => {
      await configManager.setApiKey('sk-test-clear-event');
      
      let eventFired = false;
      const disposable = configManager.onConfigurationChanged(() => {
        eventFired = true;
      });
      
      await configManager.clearApiKey();
      
      assert.strictEqual(eventFired, true, 'Configuration change event should fire when API key is cleared');
      
      disposable.dispose();
    });

    test('should allow multiple listeners for configuration changes', async () => {
      let listener1Fired = false;
      let listener2Fired = false;
      
      const disposable1 = configManager.onConfigurationChanged(() => {
        listener1Fired = true;
      });
      
      const disposable2 = configManager.onConfigurationChanged(() => {
        listener2Fired = true;
      });
      
      await configManager.setApiKey('sk-test-multiple-listeners');
      
      assert.strictEqual(listener1Fired, true, 'First listener should fire');
      assert.strictEqual(listener2Fired, true, 'Second listener should fire');
      
      disposable1.dispose();
      disposable2.dispose();
    });
  });

  suite('Default Values', () => {
    test('should return default commentary frequency of 200 characters', () => {
      const frequency = configManager.getCommentaryFrequency();
      
      assert.strictEqual(frequency, 200);
    });

    test('should return default selected pet as pumpkin', () => {
      const pet = configManager.getSelectedPet();
      
      assert.strictEqual(pet, PetType.Pumpkin);
    });

    test('should return default API endpoint', () => {
      const endpoint = configManager.getApiEndpoint();
      
      assert.strictEqual(endpoint, 'https://api.openai.com/v1/chat/completions');
    });

    test('should return default model name', () => {
      const model = configManager.getModel();
      
      assert.strictEqual(model, 'gpt-3.5-turbo');
    });

    test('should return default max tokens of 75', () => {
      const maxTokens = configManager.getMaxTokens();
      
      assert.strictEqual(maxTokens, 75);
    });

    test('should return default context lines of 15', () => {
      const contextLines = configManager.getContextLines();
      
      assert.strictEqual(contextLines, 15);
    });

    test('should return undefined for custom prompt when not set', () => {
      const prompt = configManager.getCustomPrompt(PetType.Pumpkin);
      
      assert.strictEqual(prompt, undefined);
    });
  });
});
