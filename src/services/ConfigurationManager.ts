import * as vscode from 'vscode';
import { PetType } from '../models/PetType.js';

/**
 * Manages extension configuration including secure API key storage and user settings
 */
export class ConfigurationManager {
  private static readonly API_KEY_SECRET = 'spookyPets.apiKey';
  private static readonly CONFIG_SECTION = 'spookyPets';
  
  private context: vscode.ExtensionContext;
  private configChangeEmitter: vscode.EventEmitter<void>;
  public readonly onConfigurationChanged: vscode.Event<void>;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.configChangeEmitter = new vscode.EventEmitter<void>();
    this.onConfigurationChanged = this.configChangeEmitter.event;

    // Listen for configuration changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(ConfigurationManager.CONFIG_SECTION)) {
          this.configChangeEmitter.fire();
        }
      })
    );

    // Register the event emitter for disposal
    context.subscriptions.push(this.configChangeEmitter);
  }

  /**
   * Retrieves the API key from secure storage
   * @returns The API key or undefined if not set
   */
  async getApiKey(): Promise<string | undefined> {
    return await this.context.secrets.get(ConfigurationManager.API_KEY_SECRET);
  }

  /**
   * Stores the API key in secure storage
   * @param apiKey The API key to store
   */
  async setApiKey(apiKey: string): Promise<void> {
    await this.context.secrets.store(ConfigurationManager.API_KEY_SECRET, apiKey);
    // Fire configuration change event since API key affects functionality
    this.configChangeEmitter.fire();
  }

  /**
   * Clears the API key from secure storage
   */
  async clearApiKey(): Promise<void> {
    await this.context.secrets.delete(ConfigurationManager.API_KEY_SECRET);
    this.configChangeEmitter.fire();
  }

  /**
   * Gets the commentary frequency setting in minutes
   * @returns The frequency in minutes (0 means disabled)
   */
  getCommentaryFrequency(): number {
    const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
    return config.get<number>('commentaryFrequency', 5);
  }

  /**
   * Sets the commentary frequency setting
   * @param minutes The frequency in minutes (0 to disable)
   */
  async setCommentaryFrequency(minutes: number): Promise<void> {
    const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
    await config.update('commentaryFrequency', minutes, vscode.ConfigurationTarget.Global);
  }

  /**
   * Gets the currently selected pet
   * @returns The selected pet type
   */
  getSelectedPet(): PetType {
    const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
    const petString = config.get<string>('selectedPet', 'pumpkin');
    
    // Validate and return the pet type
    if (Object.values(PetType).includes(petString as PetType)) {
      return petString as PetType;
    }
    
    return PetType.Pumpkin; // Default fallback
  }

  /**
   * Sets the selected pet
   * @param pet The pet type to select
   */
  async setSelectedPet(pet: PetType): Promise<void> {
    const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
    await config.update('selectedPet', pet, vscode.ConfigurationTarget.Global);
  }

  /**
   * Gets the custom prompt for a specific pet
   * @param pet The pet type
   * @returns The custom prompt or undefined if not set
   */
  getCustomPrompt(pet: PetType): string | undefined {
    const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
    const customPrompts = config.get<Record<string, string>>('customPrompts', {});
    return customPrompts[pet];
  }

  /**
   * Sets a custom prompt for a specific pet
   * @param pet The pet type
   * @param prompt The custom prompt text
   */
  async setCustomPrompt(pet: PetType, prompt: string): Promise<void> {
    const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
    const customPrompts = config.get<Record<string, string>>('customPrompts', {});
    customPrompts[pet] = prompt;
    await config.update('customPrompts', customPrompts, vscode.ConfigurationTarget.Global);
  }

  /**
   * Clears the custom prompt for a specific pet
   * @param pet The pet type
   */
  async clearCustomPrompt(pet: PetType): Promise<void> {
    const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
    const customPrompts = config.get<Record<string, string>>('customPrompts', {});
    delete customPrompts[pet];
    await config.update('customPrompts', customPrompts, vscode.ConfigurationTarget.Global);
  }

  /**
   * Gets the API endpoint URL
   * @returns The API endpoint URL
   */
  getApiEndpoint(): string {
    const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
    return config.get<string>('apiEndpoint', 'https://api.openai.com/v1/chat/completions');
  }

  /**
   * Gets the model name
   * @returns The model name
   */
  getModel(): string {
    const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
    return config.get<string>('model', 'gpt-3.5-turbo');
  }

  /**
   * Gets the maximum tokens for responses
   * @returns The maximum tokens
   */
  getMaxTokens(): number {
    const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
    return config.get<number>('maxTokens', 75);
  }

  /**
   * Gets the number of context lines to include
   * @returns The number of context lines
   */
  getContextLines(): number {
    const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
    return config.get<number>('contextLines', 15);
  }

  /**
   * Disposes of resources
   */
  dispose(): void {
    this.configChangeEmitter.dispose();
  }
}
