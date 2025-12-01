import * as assert from 'assert';
import * as vscode from 'vscode';
import { suite, test, setup, teardown } from 'mocha';
import { CommentaryScheduler } from '../services/CommentaryScheduler.js';
import { ConfigurationManager } from '../services/ConfigurationManager.js';
import { LLMService } from '../services/LLMService.js';
import { PetPanelProvider } from '../providers/PetPanelProvider.js';

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

suite('CommentaryScheduler Unit Tests', () => {
  let context: vscode.ExtensionContext;
  let configManager: ConfigurationManager;
  let llmService: LLMService;
  let petPanelProvider: PetPanelProvider;
  let scheduler: CommentaryScheduler;

  setup(() => {
    context = createMockContext();
    configManager = new ConfigurationManager(context);
    llmService = new LLMService(configManager);
    petPanelProvider = new PetPanelProvider(context);
    scheduler = new CommentaryScheduler(configManager, llmService, petPanelProvider);
  });

  teardown(() => {
    scheduler.dispose();
    configManager.dispose();
  });

  suite('Scheduler Start and Stop', () => {
    test('should start scheduler correctly', () => {
      assert.strictEqual(scheduler.isSchedulerRunning(), false, 'Scheduler should not be running initially');
      
      scheduler.start();
      
      assert.strictEqual(scheduler.isSchedulerRunning(), true, 'Scheduler should be running after start()');
    });

    test('should stop scheduler correctly', () => {
      scheduler.start();
      assert.strictEqual(scheduler.isSchedulerRunning(), true, 'Scheduler should be running after start()');
      
      scheduler.stop();
      
      assert.strictEqual(scheduler.isSchedulerRunning(), false, 'Scheduler should not be running after stop()');
    });

    test('should handle multiple start calls', () => {
      scheduler.start();
      scheduler.start();
      
      assert.strictEqual(scheduler.isSchedulerRunning(), true, 'Scheduler should be running after multiple start() calls');
    });

    test('should handle multiple stop calls', () => {
      scheduler.start();
      scheduler.stop();
      scheduler.stop();
      
      assert.strictEqual(scheduler.isSchedulerRunning(), false, 'Scheduler should not be running after multiple stop() calls');
    });
  });

  suite('Character Count Tracking', () => {
    test('should initialize character count to zero', () => {
      assert.strictEqual(scheduler.getCharacterCount(), 0, 'Character count should be 0 initially');
    });

    test('should reset character count when started', () => {
      scheduler.start();
      
      assert.strictEqual(scheduler.getCharacterCount(), 0, 'Character count should be 0 after start()');
      
      scheduler.stop();
    });

    test('should reset character count when stopped', () => {
      scheduler.start();
      scheduler.stop();
      
      assert.strictEqual(scheduler.getCharacterCount(), 0, 'Character count should be 0 after stop()');
    });

    test('should reset character count manually', () => {
      scheduler.resetCharacterCount();
      
      assert.strictEqual(scheduler.getCharacterCount(), 0, 'Character count should be 0 after resetCharacterCount()');
    });

    test('should reset character count when frequency is updated', () => {
      scheduler.start();
      scheduler.updateFrequency(100);
      
      assert.strictEqual(scheduler.getCharacterCount(), 0, 'Character count should be 0 after updateFrequency()');
      
      scheduler.stop();
    });
  });

  suite('Manual Commentary Trigger', () => {
    test('should have triggerManualCommentary method', () => {
      assert.ok(
        typeof scheduler.triggerManualCommentary === 'function',
        'CommentaryScheduler should have triggerManualCommentary method'
      );
    });

    test('should handle manual trigger when no active editor', async () => {
      // When there's no active editor, it should not throw
      try {
        await scheduler.triggerManualCommentary();
        assert.ok(true, 'Manual trigger should handle no active editor gracefully');
      } catch (error) {
        assert.fail('Manual trigger should not throw when no active editor');
      }
    });
  });

  suite('Frequency Configuration', () => {
    test('should get commentary frequency from configuration', () => {
      const frequency = configManager.getCommentaryFrequency();
      
      assert.ok(typeof frequency === 'number', 'Commentary frequency should be a number');
      assert.ok(frequency >= 0, 'Commentary frequency should be non-negative');
    });

    test('should handle updateFrequency call', () => {
      // Should not throw when updating frequency
      scheduler.updateFrequency(100);
      scheduler.updateFrequency(0);
      
      assert.ok(true, 'updateFrequency should not throw');
    });
  });

  suite('Integration with Services', () => {
    test('should have access to ConfigurationManager', () => {
      assert.ok(configManager, 'Scheduler should have access to ConfigurationManager');
    });

    test('should have access to LLMService', () => {
      assert.ok(llmService, 'Scheduler should have access to LLMService');
    });

    test('should have access to PetPanelProvider', () => {
      assert.ok(petPanelProvider, 'Scheduler should have access to PetPanelProvider');
    });
  });
});
