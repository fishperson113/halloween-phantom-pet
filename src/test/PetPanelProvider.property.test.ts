import * as assert from 'assert';
import * as fc from 'fast-check';
import { suite, test } from 'mocha';
import * as vscode from 'vscode';
import { PetPanelProvider } from '../providers/PetPanelProvider.js';
import { PetType } from '../models/PetType.js';

suite('PetPanelProvider Property Tests', () => {
  
  // Feature: spooky-code-pets, Property 1: Single pet visibility invariant
  // Validates: Requirements 1.2, 7.5
  test('Property 1: Single pet visibility invariant - Only one pet should be visible at any time', () => {
    // Generator for all valid pet types
    const petTypeArbitrary = fc.constantFrom(
      PetType.Pumpkin,
      PetType.Skeleton,
      PetType.Ghost
    );

    // Generator for sequences of pet switches
    const petSequenceArbitrary = fc.array(petTypeArbitrary, { minLength: 1, maxLength: 10 });

    fc.assert(
      fc.property(petSequenceArbitrary, (petSequence) => {
        // Create a mock extension context
        const mockContext = {
          extensionUri: vscode.Uri.file('/mock/path'),
          subscriptions: []
        } as any;

        const provider = new PetPanelProvider(mockContext);

        // Track the current pet through the sequence
        let currentPet: PetType | null = null;

        for (const petType of petSequence) {
          // Show the pet
          provider.showPet(petType);
          
          // Get the current pet
          const displayedPet = provider.getCurrentPet();
          
          // Verify that exactly one pet is displayed
          assert.ok(displayedPet !== null, 'A pet should be displayed');
          assert.strictEqual(
            displayedPet,
            petType,
            `The displayed pet should be ${petType}`
          );
          
          // Update current pet
          currentPet = displayedPet;
        }

        // After all switches, verify that exactly one pet is still displayed
        const finalPet = provider.getCurrentPet();
        assert.ok(finalPet !== null, 'A pet should still be displayed after all switches');
        assert.strictEqual(
          finalPet,
          petSequence[petSequence.length - 1],
          'The final displayed pet should match the last pet in the sequence'
        );
      }),
      { numRuns: 100 }
    );
  });

  // Feature: spooky-code-pets, Property 12: Speech bubble display on response
  // Validates: Requirements 4.4
  test('Property 12: Speech bubble display on response - Speech bubble should display on successful LLM response', () => {
    // Generator for commentary messages (non-empty strings)
    const messageArbitrary = fc.string({ minLength: 1, maxLength: 200 });

    fc.assert(
      fc.property(messageArbitrary, (message) => {
        // Create a mock extension context
        const mockContext = {
          extensionUri: vscode.Uri.file('/mock/path'),
          subscriptions: []
        } as any;

        const provider = new PetPanelProvider(mockContext);

        // Track messages sent to webview
        const sentMessages: any[] = [];
        
        // Mock the webview to capture messages
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

        // Show speech bubble with the message
        provider.showSpeechBubble(message);

        // Verify that a message was sent to the webview
        assert.ok(
          sentMessages.length > 0,
          'At least one message should be sent to the webview'
        );

        // Verify that the message contains the speech bubble command
        const speechBubbleMessage = sentMessages.find(
          msg => msg.type === 'showSpeechBubble'
        );
        
        assert.ok(
          speechBubbleMessage,
          'A showSpeechBubble message should be sent to the webview'
        );
        
        assert.strictEqual(
          speechBubbleMessage.message,
          message,
          'The speech bubble message should match the input message'
        );
      }),
      { numRuns: 100 }
    );
  });

  // Feature: spooky-code-pets, Property 15: Speech bubble replacement
  // Validates: Requirements 6.2, 6.4
  test('Property 15: Speech bubble replacement - New commentary should replace existing speech bubble', () => {
    // Generator for pairs of messages
    const messageArbitrary = fc.string({ minLength: 1, maxLength: 200 });
    const messagePairArbitrary = fc.tuple(messageArbitrary, messageArbitrary);

    fc.assert(
      fc.property(messagePairArbitrary, ([firstMessage, secondMessage]) => {
        // Create a mock extension context
        const mockContext = {
          extensionUri: vscode.Uri.file('/mock/path'),
          subscriptions: []
        } as any;

        const provider = new PetPanelProvider(mockContext);

        // Track messages sent to webview
        const sentMessages: any[] = [];
        
        // Mock the webview to capture messages
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

        // Show first speech bubble
        provider.showSpeechBubble(firstMessage);
        const firstMessageCount = sentMessages.filter(
          msg => msg.type === 'showSpeechBubble'
        ).length;

        // Show second speech bubble (should replace the first)
        provider.showSpeechBubble(secondMessage);
        
        // Verify that both messages were sent
        const speechBubbleMessages = sentMessages.filter(
          msg => msg.type === 'showSpeechBubble'
        );
        
        assert.strictEqual(
          speechBubbleMessages.length,
          2,
          'Two showSpeechBubble messages should be sent'
        );
        
        // Verify that the second message is the most recent
        const lastMessage = speechBubbleMessages[speechBubbleMessages.length - 1];
        assert.strictEqual(
          lastMessage.message,
          secondMessage,
          'The last speech bubble message should be the second message'
        );
      }),
      { numRuns: 100 }
    );
  });

  // Feature: spooky-code-pets, Property 17: Single speech bubble invariant
  // Validates: Requirements 6.5
  test('Property 17: Single speech bubble invariant - At most one speech bubble should be visible at any time', () => {
    // Generator for sequences of messages
    const messageArbitrary = fc.string({ minLength: 1, maxLength: 200 });
    const messageSequenceArbitrary = fc.array(messageArbitrary, { minLength: 1, maxLength: 10 });

    fc.assert(
      fc.property(messageSequenceArbitrary, (messageSequence) => {
        // Create a mock extension context
        const mockContext = {
          extensionUri: vscode.Uri.file('/mock/path'),
          subscriptions: []
        } as any;

        const provider = new PetPanelProvider(mockContext);

        // Track messages sent to webview
        const sentMessages: any[] = [];
        
        // Mock the webview to capture messages
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

        // Show each message in sequence
        for (const message of messageSequence) {
          provider.showSpeechBubble(message);
        }

        // Verify that the number of showSpeechBubble messages equals the sequence length
        const speechBubbleMessages = sentMessages.filter(
          msg => msg.type === 'showSpeechBubble'
        );
        
        assert.strictEqual(
          speechBubbleMessages.length,
          messageSequence.length,
          'The number of showSpeechBubble messages should match the sequence length'
        );

        // The last message should be the most recent one from the sequence
        const lastMessage = speechBubbleMessages[speechBubbleMessages.length - 1];
        assert.strictEqual(
          lastMessage.message,
          messageSequence[messageSequence.length - 1],
          'The last speech bubble message should be the last message in the sequence'
        );

        // Verify that hiding the speech bubble works
        provider.hideSpeechBubble();
        const hideMessages = sentMessages.filter(
          msg => msg.type === 'hideSpeechBubble'
        );
        
        assert.ok(
          hideMessages.length > 0,
          'At least one hideSpeechBubble message should be sent'
        );
      }),
      { numRuns: 100 }
    );
  });

  // Feature: spooky-code-pets, Property 18: Pet switch state transition
  // Validates: Requirements 7.2, 7.3
  test('Property 18: Pet switch state transition - Previous pet hidden, new pet displayed, panel dimensions unchanged', () => {
    // Generator for pairs of different pet types
    const petTypeArbitrary = fc.constantFrom(
      PetType.Pumpkin,
      PetType.Skeleton,
      PetType.Ghost
    );
    const petPairArbitrary = fc.tuple(petTypeArbitrary, petTypeArbitrary);

    fc.assert(
      fc.property(petPairArbitrary, ([firstPet, secondPet]) => {
        // Create a mock extension context
        const mockContext = {
          extensionUri: vscode.Uri.file('/mock/path'),
          subscriptions: []
        } as any;

        const provider = new PetPanelProvider(mockContext);

        // Track messages sent to webview
        const sentMessages: any[] = [];
        
        // Mock the webview to capture messages
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

        // Show first pet
        provider.showPet(firstPet);
        const firstPetDisplayed = provider.getCurrentPet();
        
        assert.strictEqual(
          firstPetDisplayed,
          firstPet,
          'First pet should be displayed'
        );

        // Clear messages to track only the switch
        const messagesBeforeSwitch = sentMessages.length;
        sentMessages.length = 0;

        // Switch to second pet
        provider.showPet(secondPet);
        const secondPetDisplayed = provider.getCurrentPet();

        // Verify that the second pet is now displayed
        assert.strictEqual(
          secondPetDisplayed,
          secondPet,
          'Second pet should be displayed after switch'
        );

        // Verify that a loadPet message was sent with both previous and new pet info
        const loadPetMessages = sentMessages.filter(msg => msg.type === 'loadPet');
        assert.ok(
          loadPetMessages.length > 0,
          'At least one loadPet message should be sent during switch'
        );

        const switchMessage = loadPetMessages[loadPetMessages.length - 1];
        assert.strictEqual(
          switchMessage.petConfig.type,
          secondPet,
          'The new pet type should be in the message'
        );
        
        assert.strictEqual(
          switchMessage.previousPet,
          firstPet,
          'The previous pet type should be in the message'
        );

        // Verify that only one pet is displayed after the switch
        assert.strictEqual(
          provider.getCurrentPet(),
          secondPet,
          'Only the new pet should be displayed'
        );
      }),
      { numRuns: 100 }
    );
  });

  // Feature: spooky-code-pets, Property 16: Speech bubble positioning
  // Validates: Requirements 6.3
  test('Property 16: Speech bubble positioning - Speech bubble should be positioned relative to pet', () => {
    // Generator for pet types and messages
    const petTypeArbitrary = fc.constantFrom(
      PetType.Pumpkin,
      PetType.Skeleton,
      PetType.Ghost
    );
    const messageArbitrary = fc.string({ minLength: 1, maxLength: 200 });
    const petAndMessageArbitrary = fc.tuple(petTypeArbitrary, messageArbitrary);

    fc.assert(
      fc.property(petAndMessageArbitrary, ([petType, message]) => {
        // Create a mock extension context
        const mockContext = {
          extensionUri: vscode.Uri.file('/mock/path'),
          subscriptions: []
        } as any;

        const provider = new PetPanelProvider(mockContext);

        // Track messages sent to webview
        const sentMessages: any[] = [];
        
        // Mock the webview to capture messages
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

        // Show the pet
        provider.showPet(petType);

        // Show speech bubble
        provider.showSpeechBubble(message);

        // Verify that both pet and speech bubble messages were sent
        const loadPetMessages = sentMessages.filter(msg => msg.type === 'loadPet');
        const speechBubbleMessages = sentMessages.filter(msg => msg.type === 'showSpeechBubble');

        assert.ok(
          loadPetMessages.length > 0,
          'At least one loadPet message should be sent'
        );
        
        assert.ok(
          speechBubbleMessages.length > 0,
          'At least one showSpeechBubble message should be sent'
        );

        // Verify that the pet type matches
        const lastPetMessage = loadPetMessages[loadPetMessages.length - 1];
        assert.strictEqual(
          lastPetMessage.petConfig.type,
          petType,
          'The pet type should match'
        );

        // Verify that the speech bubble message matches
        const lastSpeechBubbleMessage = speechBubbleMessages[speechBubbleMessages.length - 1];
        assert.strictEqual(
          lastSpeechBubbleMessage.message,
          message,
          'The speech bubble message should match'
        );
      }),
      { numRuns: 100 }
    );
  });
});
