import * as assert from 'assert';
import { suite, test } from 'mocha';
import * as vscode from 'vscode';
import { PetPanelProvider } from '../providers/PetPanelProvider.js';
import { PetType } from '../models/PetType.js';

suite('PetPanelProvider Unit Tests', () => {
  
  suite('Webview Initialization', () => {
    test('should initialize webview with correct options', () => {
      // Create a mock extension context
      const mockContext = {
        extensionUri: vscode.Uri.file('/mock/path'),
        subscriptions: []
      } as any;

      const provider = new PetPanelProvider(mockContext);

      // Track webview options
      let capturedOptions: any = null;

      // Mock the webview
      const mockWebview = {
        postMessage: () => Promise.resolve(true),
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'mock-csp',
        html: '',
        options: {},
        onDidReceiveMessage: () => ({ dispose: () => {} })
      } as any;

      const mockWebviewView = {
        webview: mockWebview,
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeVisibility: () => ({ dispose: () => {} }),
        visible: true,
        viewType: 'spookyPets.petView'
      } as any;

      // Capture options when they're set
      Object.defineProperty(mockWebview, 'options', {
        set: (value) => {
          capturedOptions = value;
        },
        get: () => capturedOptions
      });

      // Resolve the webview view
      provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

      // Verify options were set
      assert.ok(capturedOptions, 'Webview options should be set');
      assert.strictEqual(
        capturedOptions.enableScripts,
        true,
        'Scripts should be enabled'
      );
      assert.ok(
        Array.isArray(capturedOptions.localResourceRoots),
        'Local resource roots should be an array'
      );
      assert.ok(
        capturedOptions.localResourceRoots.length > 0,
        'Local resource roots should not be empty'
      );
    });

    test('should set webview HTML content', () => {
      // Create a mock extension context
      const mockContext = {
        extensionUri: vscode.Uri.file('/mock/path'),
        subscriptions: []
      } as any;

      const provider = new PetPanelProvider(mockContext);

      // Track HTML content
      let capturedHtml = '';

      // Mock the webview
      const mockWebview = {
        postMessage: () => Promise.resolve(true),
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'mock-csp',
        html: '',
        options: {},
        onDidReceiveMessage: () => ({ dispose: () => {} })
      } as any;

      const mockWebviewView = {
        webview: mockWebview,
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeVisibility: () => ({ dispose: () => {} }),
        visible: true,
        viewType: 'spookyPets.petView'
      } as any;

      // Capture HTML when it's set
      Object.defineProperty(mockWebview, 'html', {
        set: (value) => {
          capturedHtml = value;
        },
        get: () => capturedHtml
      });

      // Resolve the webview view
      provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

      // Verify HTML was set
      assert.ok(capturedHtml.length > 0, 'HTML content should be set');
      assert.ok(
        capturedHtml.includes('<!DOCTYPE html>'),
        'HTML should include DOCTYPE'
      );
      assert.ok(
        capturedHtml.includes('pet-container'),
        'HTML should include pet container'
      );
      assert.ok(
        capturedHtml.includes('speech-bubble'),
        'HTML should include speech bubble'
      );
      assert.ok(
        capturedHtml.includes('Content-Security-Policy'),
        'HTML should include CSP meta tag'
      );
    });

    test('should send initial showPet message after initialization', () => {
      // Create a mock extension context
      const mockContext = {
        extensionUri: vscode.Uri.file('/mock/path'),
        subscriptions: []
      } as any;

      const provider = new PetPanelProvider(mockContext);

      // Track messages sent to webview
      const sentMessages: any[] = [];

      // Mock the webview
      const mockWebview = {
        postMessage: (msg: any) => {
          sentMessages.push(msg);
          return Promise.resolve(true);
        },
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'mock-csp',
        html: '',
        options: {},
        onDidReceiveMessage: () => ({ dispose: () => {} })
      } as any;

      const mockWebviewView = {
        webview: mockWebview,
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeVisibility: () => ({ dispose: () => {} }),
        visible: true,
        viewType: 'spookyPets.petView'
      } as any;

      // Resolve the webview view
      provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

      // Verify initial loadPet message was sent
      const loadPetMessages = sentMessages.filter(msg => msg.type === 'loadPet');
      assert.strictEqual(
        loadPetMessages.length,
        1,
        'One loadPet message should be sent on initialization'
      );
      assert.strictEqual(
        loadPetMessages[0].petConfig.type,
        PetType.Pumpkin,
        'Initial pet should be Pumpkin'
      );
    });
  });

  suite('Message Passing', () => {
    test('should handle petClicked message from webview', () => {
      // Create a mock extension context
      const mockContext = {
        extensionUri: vscode.Uri.file('/mock/path'),
        subscriptions: []
      } as any;

      const provider = new PetPanelProvider(mockContext);

      // Track messages sent to webview
      const sentMessages: any[] = [];
      let messageHandler: any = null;

      // Mock the webview
      const mockWebview = {
        postMessage: (msg: any) => {
          sentMessages.push(msg);
          return Promise.resolve(true);
        },
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'mock-csp',
        html: '',
        options: {},
        onDidReceiveMessage: (handler: any) => {
          messageHandler = handler;
          return { dispose: () => {} };
        }
      } as any;

      const mockWebviewView = {
        webview: mockWebview,
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeVisibility: () => ({ dispose: () => {} }),
        visible: true,
        viewType: 'spookyPets.petView'
      } as any;

      // Resolve the webview view
      provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

      // Clear initial messages
      sentMessages.length = 0;

      // Simulate petClicked message from webview
      assert.ok(messageHandler, 'Message handler should be registered');
      messageHandler({ type: 'petClicked' });

      // Verify playInteraction message was sent
      const playInteractionMessages = sentMessages.filter(
        msg => msg.type === 'playInteraction'
      );
      assert.strictEqual(
        playInteractionMessages.length,
        1,
        'One playInteraction message should be sent'
      );
    });

    test('should handle error message from webview', () => {
      // Create a mock extension context
      const mockContext = {
        extensionUri: vscode.Uri.file('/mock/path'),
        subscriptions: []
      } as any;

      const provider = new PetPanelProvider(mockContext);

      let messageHandler: any = null;

      // Mock the webview
      const mockWebview = {
        postMessage: () => Promise.resolve(true),
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'mock-csp',
        html: '',
        options: {},
        onDidReceiveMessage: (handler: any) => {
          messageHandler = handler;
          return { dispose: () => {} };
        }
      } as any;

      const mockWebviewView = {
        webview: mockWebview,
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeVisibility: () => ({ dispose: () => {} }),
        visible: true,
        viewType: 'spookyPets.petView'
      } as any;

      // Resolve the webview view
      provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

      // Simulate error message from webview (should not throw)
      assert.ok(messageHandler, 'Message handler should be registered');
      assert.doesNotThrow(() => {
        messageHandler({ type: 'error', error: 'Test error' });
      }, 'Error message should be handled gracefully');
    });
  });

  suite('Pet Switching', () => {
    test('should switch to pumpkin pet', () => {
      // Create a mock extension context
      const mockContext = {
        extensionUri: vscode.Uri.file('/mock/path'),
        subscriptions: []
      } as any;

      const provider = new PetPanelProvider(mockContext);

      // Track messages sent to webview
      const sentMessages: any[] = [];

      // Mock the webview
      const mockWebview = {
        postMessage: (msg: any) => {
          sentMessages.push(msg);
          return Promise.resolve(true);
        },
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'mock-csp',
        html: '',
        options: {},
        onDidReceiveMessage: () => ({ dispose: () => {} })
      } as any;

      const mockWebviewView = {
        webview: mockWebview,
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeVisibility: () => ({ dispose: () => {} }),
        visible: true,
        viewType: 'spookyPets.petView'
      } as any;

      // Resolve the webview view
      provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

      // Clear initial messages
      sentMessages.length = 0;

      // Switch to pumpkin
      provider.showPet(PetType.Pumpkin);

      // Verify loadPet message was sent
      const loadPetMessages = sentMessages.filter(msg => msg.type === 'loadPet');
      assert.strictEqual(
        loadPetMessages.length,
        1,
        'One loadPet message should be sent'
      );
      assert.strictEqual(
        loadPetMessages[0].petConfig.type,
        PetType.Pumpkin,
        'Pet type should be Pumpkin'
      );

      // Verify current pet is updated
      assert.strictEqual(
        provider.getCurrentPet(),
        PetType.Pumpkin,
        'Current pet should be Pumpkin'
      );
    });

    test('should switch to skeleton pet', () => {
      // Create a mock extension context
      const mockContext = {
        extensionUri: vscode.Uri.file('/mock/path'),
        subscriptions: []
      } as any;

      const provider = new PetPanelProvider(mockContext);

      // Track messages sent to webview
      const sentMessages: any[] = [];

      // Mock the webview
      const mockWebview = {
        postMessage: (msg: any) => {
          sentMessages.push(msg);
          return Promise.resolve(true);
        },
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'mock-csp',
        html: '',
        options: {},
        onDidReceiveMessage: () => ({ dispose: () => {} })
      } as any;

      const mockWebviewView = {
        webview: mockWebview,
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeVisibility: () => ({ dispose: () => {} }),
        visible: true,
        viewType: 'spookyPets.petView'
      } as any;

      // Resolve the webview view
      provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

      // Clear initial messages
      sentMessages.length = 0;

      // Switch to skeleton
      provider.showPet(PetType.Skeleton);

      // Verify loadPet message was sent
      const loadPetMessages = sentMessages.filter(msg => msg.type === 'loadPet');
      assert.strictEqual(
        loadPetMessages.length,
        1,
        'One loadPet message should be sent'
      );
      assert.strictEqual(
        loadPetMessages[0].petConfig.type,
        PetType.Skeleton,
        'Pet type should be Skeleton'
      );

      // Verify current pet is updated
      assert.strictEqual(
        provider.getCurrentPet(),
        PetType.Skeleton,
        'Current pet should be Skeleton'
      );
    });

    test('should switch to ghost pet', () => {
      // Create a mock extension context
      const mockContext = {
        extensionUri: vscode.Uri.file('/mock/path'),
        subscriptions: []
      } as any;

      const provider = new PetPanelProvider(mockContext);

      // Track messages sent to webview
      const sentMessages: any[] = [];

      // Mock the webview
      const mockWebview = {
        postMessage: (msg: any) => {
          sentMessages.push(msg);
          return Promise.resolve(true);
        },
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'mock-csp',
        html: '',
        options: {},
        onDidReceiveMessage: () => ({ dispose: () => {} })
      } as any;

      const mockWebviewView = {
        webview: mockWebview,
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeVisibility: () => ({ dispose: () => {} }),
        visible: true,
        viewType: 'spookyPets.petView'
      } as any;

      // Resolve the webview view
      provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

      // Clear initial messages
      sentMessages.length = 0;

      // Switch to ghost
      provider.showPet(PetType.Ghost);

      // Verify loadPet message was sent
      const loadPetMessages = sentMessages.filter(msg => msg.type === 'loadPet');
      assert.strictEqual(
        loadPetMessages.length,
        1,
        'One loadPet message should be sent'
      );
      assert.strictEqual(
        loadPetMessages[0].petConfig.type,
        PetType.Ghost,
        'Pet type should be Ghost'
      );

      // Verify current pet is updated
      assert.strictEqual(
        provider.getCurrentPet(),
        PetType.Ghost,
        'Current pet should be Ghost'
      );
    });

    test('should handle multiple pet switches', () => {
      // Create a mock extension context
      const mockContext = {
        extensionUri: vscode.Uri.file('/mock/path'),
        subscriptions: []
      } as any;

      const provider = new PetPanelProvider(mockContext);

      // Track messages sent to webview
      const sentMessages: any[] = [];

      // Mock the webview
      const mockWebview = {
        postMessage: (msg: any) => {
          sentMessages.push(msg);
          return Promise.resolve(true);
        },
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'mock-csp',
        html: '',
        options: {},
        onDidReceiveMessage: () => ({ dispose: () => {} })
      } as any;

      const mockWebviewView = {
        webview: mockWebview,
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeVisibility: () => ({ dispose: () => {} }),
        visible: true,
        viewType: 'spookyPets.petView'
      } as any;

      // Resolve the webview view
      provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

      // Clear initial messages
      sentMessages.length = 0;

      // Switch pets multiple times
      provider.showPet(PetType.Skeleton);
      provider.showPet(PetType.Ghost);
      provider.showPet(PetType.Pumpkin);

      // Verify all loadPet messages were sent
      const loadPetMessages = sentMessages.filter(msg => msg.type === 'loadPet');
      assert.strictEqual(
        loadPetMessages.length,
        3,
        'Three loadPet messages should be sent'
      );

      // Verify the sequence
      assert.strictEqual(loadPetMessages[0].petConfig.type, PetType.Skeleton);
      assert.strictEqual(loadPetMessages[1].petConfig.type, PetType.Ghost);
      assert.strictEqual(loadPetMessages[2].petConfig.type, PetType.Pumpkin);

      // Verify current pet is the last one
      assert.strictEqual(
        provider.getCurrentPet(),
        PetType.Pumpkin,
        'Current pet should be the last one set'
      );
    });
  });

  suite('Speech Bubble Management', () => {
    test('should show speech bubble with message', () => {
      // Create a mock extension context
      const mockContext = {
        extensionUri: vscode.Uri.file('/mock/path'),
        subscriptions: []
      } as any;

      const provider = new PetPanelProvider(mockContext);

      // Track messages sent to webview
      const sentMessages: any[] = [];

      // Mock the webview
      const mockWebview = {
        postMessage: (msg: any) => {
          sentMessages.push(msg);
          return Promise.resolve(true);
        },
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'mock-csp',
        html: '',
        options: {},
        onDidReceiveMessage: () => ({ dispose: () => {} })
      } as any;

      const mockWebviewView = {
        webview: mockWebview,
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeVisibility: () => ({ dispose: () => {} }),
        visible: true,
        viewType: 'spookyPets.petView'
      } as any;

      // Resolve the webview view
      provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

      // Clear initial messages
      sentMessages.length = 0;

      // Show speech bubble
      const testMessage = 'This is a test commentary';
      provider.showSpeechBubble(testMessage);

      // Verify showSpeechBubble message was sent
      const speechBubbleMessages = sentMessages.filter(
        msg => msg.type === 'showSpeechBubble'
      );
      assert.strictEqual(
        speechBubbleMessages.length,
        1,
        'One showSpeechBubble message should be sent'
      );
      assert.strictEqual(
        speechBubbleMessages[0].message,
        testMessage,
        'Message should match the input'
      );
    });

    test('should hide speech bubble', () => {
      // Create a mock extension context
      const mockContext = {
        extensionUri: vscode.Uri.file('/mock/path'),
        subscriptions: []
      } as any;

      const provider = new PetPanelProvider(mockContext);

      // Track messages sent to webview
      const sentMessages: any[] = [];

      // Mock the webview
      const mockWebview = {
        postMessage: (msg: any) => {
          sentMessages.push(msg);
          return Promise.resolve(true);
        },
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'mock-csp',
        html: '',
        options: {},
        onDidReceiveMessage: () => ({ dispose: () => {} })
      } as any;

      const mockWebviewView = {
        webview: mockWebview,
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeVisibility: () => ({ dispose: () => {} }),
        visible: true,
        viewType: 'spookyPets.petView'
      } as any;

      // Resolve the webview view
      provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

      // Clear initial messages
      sentMessages.length = 0;

      // Hide speech bubble
      provider.hideSpeechBubble();

      // Verify hideSpeechBubble message was sent
      const hideMessages = sentMessages.filter(
        msg => msg.type === 'hideSpeechBubble'
      );
      assert.strictEqual(
        hideMessages.length,
        1,
        'One hideSpeechBubble message should be sent'
      );
    });

    test('should show and hide processing indicator', () => {
      // Create a mock extension context
      const mockContext = {
        extensionUri: vscode.Uri.file('/mock/path'),
        subscriptions: []
      } as any;

      const provider = new PetPanelProvider(mockContext);

      // Track messages sent to webview
      const sentMessages: any[] = [];

      // Mock the webview
      const mockWebview = {
        postMessage: (msg: any) => {
          sentMessages.push(msg);
          return Promise.resolve(true);
        },
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'mock-csp',
        html: '',
        options: {},
        onDidReceiveMessage: () => ({ dispose: () => {} })
      } as any;

      const mockWebviewView = {
        webview: mockWebview,
        onDidDispose: () => ({ dispose: () => {} }),
        onDidChangeVisibility: () => ({ dispose: () => {} }),
        visible: true,
        viewType: 'spookyPets.petView'
      } as any;

      // Resolve the webview view
      provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

      // Clear initial messages
      sentMessages.length = 0;

      // Show processing indicator
      provider.showProcessingIndicator();

      // Verify showProcessing message was sent
      const showProcessingMessages = sentMessages.filter(
        msg => msg.type === 'showProcessing'
      );
      assert.strictEqual(
        showProcessingMessages.length,
        1,
        'One showProcessing message should be sent'
      );

      // Hide processing indicator
      provider.hideProcessingIndicator();

      // Verify hideProcessing message was sent
      const hideProcessingMessages = sentMessages.filter(
        msg => msg.type === 'hideProcessing'
      );
      assert.strictEqual(
        hideProcessingMessages.length,
        1,
        'One hideProcessing message should be sent'
      );
    });
  });
});
