import * as vscode from 'vscode';
import { CodeContext } from '../models/CodeContext.js';
import { ConfigurationManager } from './ConfigurationManager.js';
import { StructuredCommentaryResponse, parseStructuredResponse } from '../models/index.js';

/**
 * Interface for OpenAI-compatible API request
 */
export interface LLMRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens: number;
  temperature: number;
}

/**
 * Interface for OpenAI-compatible API response
 */
export interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Interface for queued retry request
 */
interface RetryQueueItem {
  codeContext: CodeContext;
  personality: string;
  resolve: (value: StructuredCommentaryResponse) => void;
  reject: (reason: Error) => void;
  retryCount: number;
}

/**
 * Service for interacting with LLM APIs to generate pet commentary
 */
export class LLMService {
  private configManager: ConfigurationManager;
  private retryQueue: RetryQueueItem[] = [];
  private isProcessingQueue: boolean = false;
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_BACKOFF_MS = 1000;

  constructor(configManager: ConfigurationManager) {
    this.configManager = configManager;
  }

  /**
   * Builds the LLM request payload
   * @param codeContext The code context to comment on
   * @param personality The personality prompt to use
   * @returns The request payload
   */
  buildRequest(codeContext: CodeContext, personality: string): LLMRequest {
    const model = this.configManager.getModel();
    const maxTokens = this.configManager.getMaxTokens();

    // Enhance personality prompt with JSON format requirement
    const enhancedPersonality = `${personality}

CRITICAL: Always respond with valid JSON containing both "commentary" and "expression" fields. Never respond with plain text.`;

    return {
      model,
      messages: [
        {
          role: 'system',
          content: enhancedPersonality
        },
        {
          role: 'user',
          content: this.formatCodeContextPrompt(codeContext)
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.6 
    };
  }

  /**
   * Generates commentary for the given code context using the LLM
   * @param codeContext The code context to comment on
   * @param personality The personality prompt to use
   * @returns The structured commentary response with text and expression
   * @throws Error if API key is missing, API call fails, or response is invalid
   */
  async generateCommentary(codeContext: CodeContext, personality: string): Promise<StructuredCommentaryResponse> {
    // Retrieve API key from secure storage
    const apiKey = await this.configManager.getApiKey();
    if (!apiKey) {
      const error = new Error('API key not configured. Please set your API key in the extension settings.');
      console.error('[LLMService] API key missing:', error.message);
      
      // Prompt user to set API key
      vscode.window.showErrorMessage(
        'Spooky Pets: API key not configured',
        'Set API Key'
      ).then((selection) => {
        if (selection === 'Set API Key') {
          vscode.commands.executeCommand('spookyPets.setApiKey');
        }
      });
      
      throw error;
    }

    // Get configuration
    const endpoint = this.configManager.getApiEndpoint();

    // Format the request payload
    const request = this.buildRequest(codeContext, personality);

    try {
      const rawResponse = await this.makeApiRequest(apiKey, endpoint, request);
      return parseStructuredResponse(rawResponse);
    } catch (error) {
      if (error instanceof Error) {
        // Log the error for troubleshooting
        console.error('[LLMService] API error:', error.message, error.stack);
        
        // Handle specific error types
        if (this.isNetworkError(error)) {
          console.warn('[LLMService] Network error detected, queueing request for retry');
          return this.queueForRetry(codeContext, personality);
        } else if (this.isInvalidApiKeyError(error)) {
          // Prompt user to update API key
          vscode.window.showErrorMessage(
            'Spooky Pets: Invalid API key',
            'Update API Key'
          ).then((selection) => {
            if (selection === 'Update API Key') {
              vscode.commands.executeCommand('spookyPets.setApiKey');
            }
          });
        } else if (this.isRateLimitError(error)) {
          vscode.window.showWarningMessage(
            'Spooky Pets: Rate limit exceeded. Your pet will try again later.'
          );
        }
        
        throw error;
      }
      const unknownError = new Error('Unknown error occurred during API request');
      console.error('[LLMService] Unknown error:', unknownError);
      throw unknownError;
    }
  }

  /**
   * Makes the actual API request with retry logic
   * @param apiKey The API key
   * @param endpoint The API endpoint
   * @param request The request payload
   * @param retryCount Current retry attempt
   * @returns The generated commentary text
   */
  private async makeApiRequest(
    apiKey: string,
    endpoint: string,
    request: LLMRequest,
    retryCount: number = 0
  ): Promise<string> {
    try {
      // Dynamically import node-fetch
      const fetch = (await import('node-fetch')).default;
      
      // Make the API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid API key. Please check your API key configuration.');
        }
        if (response.status === 429) {
          if (retryCount < this.MAX_RETRIES) {
            const backoffMs = this.calculateBackoff(retryCount);
            console.warn(`[LLMService] Rate limited, retrying in ${backoffMs}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
            await this.sleep(backoffMs);
            return this.makeApiRequest(apiKey, endpoint, request, retryCount + 1);
          }
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      // Parse and validate the response
      const data = await response.json() as LLMResponse;
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Invalid API response: no choices returned');
      }

      const message = data.choices[0]?.message?.content;
      if (!message) {
        throw new Error('Invalid API response: no message content');
      }

      return message.trim();
    } catch (error) {
      // If it's a network error and we have retries left, apply exponential backoff
      if (this.isNetworkError(error as Error) && retryCount < this.MAX_RETRIES) {
        const backoffMs = this.calculateBackoff(retryCount);
        console.warn(`[LLMService] Network error, retrying in ${backoffMs}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
        await this.sleep(backoffMs);
        return this.makeApiRequest(apiKey, endpoint, request, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Queues a request for retry when network is unavailable
   * @param codeContext The code context
   * @param personality The personality prompt
   * @returns A promise that resolves when the request succeeds
   */
  private queueForRetry(codeContext: CodeContext, personality: string): Promise<StructuredCommentaryResponse> {
    return new Promise((resolve, reject) => {
      this.retryQueue.push({
        codeContext,
        personality,
        resolve,
        reject,
        retryCount: 0
      });
      
      console.log(`[LLMService] Request queued for retry. Queue length: ${this.retryQueue.length}`);
      
      // Start processing the queue if not already processing
      if (!this.isProcessingQueue) {
        this.processRetryQueue();
      }
    });
  }

  /**
   * Processes the retry queue with exponential backoff
   */
  private async processRetryQueue(): Promise<void> {
    if (this.isProcessingQueue || this.retryQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    console.log(`[LLMService] Processing retry queue with ${this.retryQueue.length} items`);

    while (this.retryQueue.length > 0) {
      const item = this.retryQueue[0];
      
      try {
        const result = await this.generateCommentary(item.codeContext, item.personality);
        item.resolve(result);
        this.retryQueue.shift(); // Remove successful item
        console.log(`[LLMService] Retry successful. Remaining queue: ${this.retryQueue.length}`);
      } catch (error) {
        item.retryCount++;
        
        if (item.retryCount >= this.MAX_RETRIES) {
          // Max retries reached, reject and remove from queue
          item.reject(error as Error);
          this.retryQueue.shift();
          console.error(`[LLMService] Max retries reached for queued item. Remaining queue: ${this.retryQueue.length}`);
        } else {
          // Wait before next retry
          const backoffMs = this.calculateBackoff(item.retryCount);
          console.warn(`[LLMService] Retry failed, waiting ${backoffMs}ms before next attempt`);
          await this.sleep(backoffMs);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Calculates exponential backoff delay
   * @param retryCount The current retry count
   * @returns Delay in milliseconds
   */
  private calculateBackoff(retryCount: number): number {
    return this.INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
  }

  /**
   * Sleep utility for delays
   * @param ms Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Checks if an error is a network error
   * @param error The error to check
   * @returns True if it's a network error
   */
  private isNetworkError(error: Error): boolean {
    const networkErrorPatterns = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNRESET',
      'network',
      'fetch failed'
    ];
    
    return networkErrorPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Checks if an error is an invalid API key error
   * @param error The error to check
   * @returns True if it's an invalid API key error
   */
  private isInvalidApiKeyError(error: Error): boolean {
    return error.message.includes('Invalid API key') || 
           error.message.includes('401') || 
           error.message.includes('403');
  }

  /**
   * Checks if an error is a rate limit error
   * @param error The error to check
   * @returns True if it's a rate limit error
   */
  private isRateLimitError(error: Error): boolean {
    return error.message.includes('Rate limit') || error.message.includes('429');
  }

  /**
   * Extracts code context from the active editor around the cursor position
   * @param editor The text editor to extract context from
   * @returns The code context
   */
  extractCodeContext(editor: vscode.TextEditor): CodeContext {
    const document = editor.document;
    const position = editor.selection.active;
    const contextLines = this.configManager.getContextLines();

    // Calculate the range of lines to extract
    const startLine = Math.max(0, position.line - Math.floor(contextLines / 2));
    const endLine = Math.min(document.lineCount - 1, position.line + Math.floor(contextLines / 2));

    // Extract the code snippet
    const range = new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length);
    const snippet = document.getText(range);

    return {
      language: document.languageId,
      snippet,
      lineNumber: position.line + 1, // Convert to 1-based line number
      fileName: document.fileName
    };
  }

  /**
   * Formats the code context into a prompt for the LLM
   * @param codeContext The code context to format
   * @returns The formatted prompt
   */
  private formatCodeContextPrompt(codeContext: CodeContext): string {
    return `Here's some ${codeContext.language} code from ${codeContext.fileName} around line ${codeContext.lineNumber}:

\`\`\`${codeContext.language}
${codeContext.snippet}
\`\`\`

IMPORTANT: You must respond with valid JSON in this exact format:
{
  "commentary": "Your 1-2 sentence comment here",
  "expression": "happy" | "neutral" | "concerned"
}

Expression guidelines:
- "happy": Use when code is well-written, elegant, or shows good practices
- "neutral": Use for observations, questions, or neutral commentary
- "concerned": Use when spotting potential bugs, code smells, or areas for improvement

Provide a brief, entertaining comment about this code.`;
  }
}
