import * as assert from 'assert';
import * as vscode from 'vscode';
import { suite, test, setup, teardown } from 'mocha';
import { LLMService } from '../services/LLMService.js';
import { ConfigurationManager } from '../services/ConfigurationManager.js';
import { CodeContext } from '../models/CodeContext.js';

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

suite('LLMService Unit Tests', () => {
  let context: vscode.ExtensionContext;
  let configManager: ConfigurationManager;
  let llmService: LLMService;

  setup(async () => {
    context = createMockContext();
    configManager = new ConfigurationManager(context);
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

  suite('Code Context Extraction', () => {
    test('should extract code context from editor with cursor in middle', () => {
      const lines = [
        'function test() {',
        '  const x = 1;',
        '  const y = 2;',
        '  const z = 3;',
        '  return x + y + z;',
        '}'
      ];
      
      const mockDocument = {
        getText: (range?: vscode.Range) => {
          if (!range) {
            return lines.join('\n');
          }
          const extracted = lines.slice(range.start.line, range.end.line + 1);
          return extracted.join('\n');
        },
        lineCount: lines.length,
        lineAt: (line: number) => ({
          text: lines[line],
          range: new vscode.Range(line, 0, line, lines[line].length)
        }),
        languageId: 'typescript',
        fileName: '/path/to/test.ts'
      } as any;

      const mockEditor = {
        document: mockDocument,
        selection: {
          active: new vscode.Position(2, 0) // Middle of the function
        }
      } as any;

      const context = llmService.extractCodeContext(mockEditor);

      assert.strictEqual(context.language, 'typescript');
      assert.strictEqual(context.fileName, '/path/to/test.ts');
      assert.strictEqual(context.lineNumber, 3); // 1-based line number
      assert.ok(context.snippet.includes('const y = 2;'));
    });

    test('should extract code context from editor with cursor at start', () => {
      const lines = [
        'const a = 1;',
        'const b = 2;',
        'const c = 3;'
      ];
      
      const mockDocument = {
        getText: (range?: vscode.Range) => {
          if (!range) {
            return lines.join('\n');
          }
          const extracted = lines.slice(range.start.line, range.end.line + 1);
          return extracted.join('\n');
        },
        lineCount: lines.length,
        lineAt: (line: number) => ({
          text: lines[line],
          range: new vscode.Range(line, 0, line, lines[line].length)
        }),
        languageId: 'javascript',
        fileName: 'start.js'
      } as any;

      const mockEditor = {
        document: mockDocument,
        selection: {
          active: new vscode.Position(0, 0)
        }
      } as any;

      const context = llmService.extractCodeContext(mockEditor);

      assert.strictEqual(context.language, 'javascript');
      assert.strictEqual(context.fileName, 'start.js');
      assert.strictEqual(context.lineNumber, 1);
      assert.ok(context.snippet.includes('const a = 1;'));
    });

    test('should extract code context from editor with cursor at end', () => {
      const lines = [
        'const a = 1;',
        'const b = 2;',
        'const c = 3;'
      ];
      
      const mockDocument = {
        getText: (range?: vscode.Range) => {
          if (!range) {
            return lines.join('\n');
          }
          const extracted = lines.slice(range.start.line, range.end.line + 1);
          return extracted.join('\n');
        },
        lineCount: lines.length,
        lineAt: (line: number) => ({
          text: lines[line],
          range: new vscode.Range(line, 0, line, lines[line].length)
        }),
        languageId: 'python',
        fileName: 'end.py'
      } as any;

      const mockEditor = {
        document: mockDocument,
        selection: {
          active: new vscode.Position(2, 0)
        }
      } as any;

      const context = llmService.extractCodeContext(mockEditor);

      assert.strictEqual(context.language, 'python');
      assert.strictEqual(context.fileName, 'end.py');
      assert.strictEqual(context.lineNumber, 3);
      assert.ok(context.snippet.includes('const c = 3;'));
    });
  });

  suite('API Request Formatting', () => {
    test('should format request with correct structure', () => {
      const codeContext: CodeContext = {
        language: 'typescript',
        snippet: 'const x = 1;',
        lineNumber: 5,
        fileName: 'test.ts'
      };
      const personality = 'You are a helpful assistant';

      const request = llmService.buildRequest(codeContext, personality);

      assert.ok(request.model);
      assert.ok(Array.isArray(request.messages));
      assert.strictEqual(request.messages.length, 2);
      assert.strictEqual(request.messages[0].role, 'system');
      assert.strictEqual(request.messages[0].content, personality);
      assert.strictEqual(request.messages[1].role, 'user');
      assert.ok(request.messages[1].content.includes('const x = 1;'));
      assert.ok(request.messages[1].content.includes('typescript'));
      assert.ok(request.max_tokens > 0);
      assert.ok(request.temperature >= 0 && request.temperature <= 2);
    });

    test('should include code snippet in user message', () => {
      const codeContext: CodeContext = {
        language: 'javascript',
        snippet: 'function hello() { return "world"; }',
        lineNumber: 10,
        fileName: 'hello.js'
      };
      const personality = 'Test personality';

      const request = llmService.buildRequest(codeContext, personality);

      const userMessage = request.messages.find(m => m.role === 'user');
      assert.ok(userMessage);
      assert.ok(userMessage.content.includes('function hello()'));
      assert.ok(userMessage.content.includes('javascript'));
    });

    test('should include file name and line number in user message', () => {
      const codeContext: CodeContext = {
        language: 'python',
        snippet: 'def test(): pass',
        lineNumber: 42,
        fileName: '/path/to/module.py'
      };
      const personality = 'Test personality';

      const request = llmService.buildRequest(codeContext, personality);

      const userMessage = request.messages.find(m => m.role === 'user');
      assert.ok(userMessage);
      assert.ok(userMessage.content.includes('module.py'));
      assert.ok(userMessage.content.includes('42'));
    });
  });

  suite('Error Handling', () => {
    test('should throw error when API key is not configured', async () => {
      await configManager.clearApiKey();

      const codeContext: CodeContext = {
        language: 'typescript',
        snippet: 'const x = 1;',
        lineNumber: 1,
        fileName: 'test.ts'
      };

      try {
        await llmService.generateCommentary(codeContext, 'test personality');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.ok(error.message.includes('API key'));
      }
    });

    test('should handle empty code snippet', () => {
      const codeContext: CodeContext = {
        language: 'typescript',
        snippet: '',
        lineNumber: 1,
        fileName: 'empty.ts'
      };
      const personality = 'Test personality';

      const request = llmService.buildRequest(codeContext, personality);

      assert.ok(request);
      assert.ok(request.messages.length === 2);
      // Should still build a valid request even with empty snippet
    });

    test('should handle very long code snippets', () => {
      const longSnippet = 'const x = 1;\n'.repeat(1000);
      const codeContext: CodeContext = {
        language: 'typescript',
        snippet: longSnippet,
        lineNumber: 500,
        fileName: 'long.ts'
      };
      const personality = 'Test personality';

      const request = llmService.buildRequest(codeContext, personality);

      assert.ok(request);
      assert.ok(request.messages[1].content.includes(longSnippet));
      // Should handle long snippets without crashing
    });
  });
});
