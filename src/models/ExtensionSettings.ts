import { PetType } from './PetType.js';

/**
 * Interface representing all extension settings
 */
export interface ExtensionSettings {
  'spookyPets.apiKey': string;  // Stored in secrets
  'spookyPets.commentaryFrequency': number;  // minutes
  'spookyPets.selectedPet': PetType;
  'spookyPets.customPrompts': Record<PetType, string>;
  'spookyPets.apiEndpoint': string;  // OpenAI-compatible endpoint
  'spookyPets.model': string;  // Model name
  'spookyPets.maxTokens': number;
  'spookyPets.contextLines': number;  // Lines of code to include
}
