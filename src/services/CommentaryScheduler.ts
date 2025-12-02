import * as vscode from 'vscode';
import { LLMService } from './LLMService.js';
import { PetPanelProvider } from '../providers/PetPanelProvider.js';
import { ConfigurationManager } from './ConfigurationManager.js';
import { PERSONALITIES } from '../personalities/personalities.js';

/**
 * Scheduler that monitors text changes and triggers commentary generation
 * based on character count thresholds
 */
export class CommentaryScheduler {
  private configManager: ConfigurationManager;
  private llmService: LLMService;
  private petPanelProvider: PetPanelProvider;
  
  private isRunning: boolean = false;
  private cumulativeCharacterCount: number = 0;
  private textChangeDisposable?: vscode.Disposable;
  private activeEditorDisposable?: vscode.Disposable;
  
  // Track characters typed while speech bubble is visible
  private isSpeechBubbleVisible: boolean = false;
  private charactersSinceBubbleShown: number = 0;

  constructor(
    configManager: ConfigurationManager,
    llmService: LLMService,
    petPanelProvider: PetPanelProvider
  ) {
    this.configManager = configManager;
    this.llmService = llmService;
    this.petPanelProvider = petPanelProvider;
  }

  /**
   * Start monitoring text changes and scheduling commentary
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.cumulativeCharacterCount = 0;

    // Monitor text document changes
    this.textChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
      this.handleTextChange(event);
    });

    // Monitor active editor changes
    this.activeEditorDisposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
      // Reset character count when switching editors
      if (editor) {
        this.cumulativeCharacterCount = 0;
        // Dismiss speech bubble when switching editors
        if (this.isSpeechBubbleVisible) {
          this.dismissSpeechBubble();
        }
      }
    });
  }

  /**
   * Stop monitoring text changes
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.cumulativeCharacterCount = 0;

    // Dispose of event listeners
    if (this.textChangeDisposable) {
      this.textChangeDisposable.dispose();
      this.textChangeDisposable = undefined;
    }

    if (this.activeEditorDisposable) {
      this.activeEditorDisposable.dispose();
      this.activeEditorDisposable = undefined;
    }
  }

  /**
   * Update the commentary frequency threshold
   * @param characterCount The new character count threshold
   */
  updateFrequency(characterCount: number): void {
    // Reset the cumulative count when frequency changes
    this.cumulativeCharacterCount = 0;
  }

  /**
   * Manually trigger commentary generation for the current editor
   */
  async triggerManualCommentary(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor to generate commentary for.');
      return;
    }

    await this.generateCommentary(editor);
  }

  /**
   * Reset the cumulative character count
   */
  resetCharacterCount(): void {
    this.cumulativeCharacterCount = 0;
  }

  /**
   * Dismiss the speech bubble and resume normal pet behavior
   */
  private dismissSpeechBubble(): void {
    this.petPanelProvider.hideSpeechBubble();
    this.isSpeechBubbleVisible = false;
    this.charactersSinceBubbleShown = 0;
  }

  /**
   * Get the current cumulative character count (for testing)
   */
  getCharacterCount(): number {
    return this.cumulativeCharacterCount;
  }

  /**
   * Check if the scheduler is running (for testing)
   */
  isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Handle text document changes
   */
  private handleTextChange(event: vscode.TextDocumentChangeEvent): void {
    try {
      if (!this.isRunning) {
        return;
      }

      // Only track changes in the active editor
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor || event.document !== activeEditor.document) {
        return;
      }

      // Calculate the number of characters added
      let charactersAdded = 0;
      for (const change of event.contentChanges) {
        // Count characters added (positive) but ignore deletions
        if (change.text.length > 0) {
          charactersAdded += change.text.length;
        }
      }

      // Update cumulative count
      this.cumulativeCharacterCount += charactersAdded;
      
      // If speech bubble is visible, track characters for auto-dismiss
      if (this.isSpeechBubbleVisible) {
        this.charactersSinceBubbleShown += charactersAdded;
        
        // Auto-dismiss after 5% of the threshold
        const threshold = this.configManager.getCommentaryFrequency();
        const dismissThreshold = Math.max(10, Math.floor(threshold * 0.05)); // At least 10 characters
        
        if (this.charactersSinceBubbleShown >= dismissThreshold) {
          this.dismissSpeechBubble();
        }
      }

      // Check if threshold is reached
      const threshold = this.configManager.getCommentaryFrequency();
      
      // If frequency is 0, automatic commentary is disabled
      if (threshold === 0) {
        return;
      }

      if (this.cumulativeCharacterCount >= threshold) {
        // Reset count immediately to prevent multiple triggers
        this.resetCharacterCount();
        
        // Trigger commentary generation
        this.generateCommentary(activeEditor).catch((error) => {
          console.error('[CommentaryScheduler] Failed to generate commentary:', error);
        });
      }
    } catch (error) {
      console.error('[CommentaryScheduler] Error in handleTextChange:', error);
      // Extension should remain active despite errors
    }
  }

  /**
   * Generate commentary for the given editor
   */
  private async generateCommentary(editor: vscode.TextEditor): Promise<void> {
    try {
      // Show processing indicator
      this.petPanelProvider.showProcessingIndicator();

      // Extract code context
      const codeContext = this.llmService.extractCodeContext(editor);

      // Get the current pet and its personality
      const currentPet = this.petPanelProvider.getCurrentPet();
      
      // Check for custom prompt, otherwise use default personality
      const customPrompt = this.configManager.getCustomPrompt(currentPet);
      const personality = customPrompt || PERSONALITIES[currentPet].systemPrompt;

      // Generate commentary
      const response = await this.llmService.generateCommentary(codeContext, personality);

      // Hide processing indicator
      this.petPanelProvider.hideProcessingIndicator();

      // Display the commentary in a speech bubble with expression
      this.petPanelProvider.showSpeechBubbleWithExpression(response.commentary, response.expression);
      
      // Track that speech bubble is now visible
      this.isSpeechBubbleVisible = true;
      this.charactersSinceBubbleShown = 0;
    } catch (error) {
      // Hide processing indicator on error
      this.petPanelProvider.hideProcessingIndicator();

      // Log comprehensive error information
      console.error('[CommentaryScheduler] Error generating commentary:', error);
      if (error instanceof Error) {
        console.error('[CommentaryScheduler] Error stack:', error.stack);
      }

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          vscode.window.showErrorMessage(
            'Spooky Pets: API key not configured or invalid. Please set your API key.',
            'Set API Key'
          ).then((selection) => {
            if (selection === 'Set API Key') {
              vscode.commands.executeCommand('spookyPets.setApiKey');
            }
          });
        } else if (error.message.includes('Rate limit')) {
          vscode.window.showWarningMessage('Spooky Pets: Rate limit exceeded. Please try again later.');
        } else {
          vscode.window.showErrorMessage(`Spooky Pets: Failed to generate commentary: ${error.message}`);
        }
      }

      // Don't reset character count on error - allow retry
      throw error;
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.stop();
  }
}
