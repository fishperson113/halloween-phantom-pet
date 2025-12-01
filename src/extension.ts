// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ConfigurationManager } from './services/ConfigurationManager.js';
import { LLMService } from './services/LLMService.js';
import { CommentaryScheduler } from './services/CommentaryScheduler.js';
import { PetPanelProvider } from './providers/PetPanelProvider.js';
import { PetType } from './models/PetType.js';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	try {
		console.log('Spooky Code Pets extension is now active!');

		// Initialize ConfigurationManager
		const configManager = new ConfigurationManager(context);

		// Initialize PetPanelProvider
		const petPanelProvider = new PetPanelProvider(context);
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider(
				PetPanelProvider.viewType,
				petPanelProvider
			)
		);

		// Initialize LLMService
		const llmService = new LLMService(configManager);

		// Initialize CommentaryScheduler
		const commentaryScheduler = new CommentaryScheduler(
			configManager,
			llmService,
			petPanelProvider
		);
		commentaryScheduler.start();
		context.subscriptions.push(commentaryScheduler);

		// Register setApiKey command
		const setApiKeyCommand = vscode.commands.registerCommand('spookyPets.setApiKey', async () => {
			try {
				const apiKey = await vscode.window.showInputBox({
					prompt: 'Enter your OpenAI API key',
					password: true,
					placeHolder: 'sk-...'
				});

				if (apiKey) {
					await configManager.setApiKey(apiKey);
					vscode.window.showInformationMessage('API key saved securely!');
				}
			} catch (error) {
				console.error('[Extension] Error in setApiKey command:', error);
				vscode.window.showErrorMessage('Failed to save API key. Please try again.');
			}
		});
		context.subscriptions.push(setApiKeyCommand);

		// Register clearApiKey command
		const clearApiKeyCommand = vscode.commands.registerCommand('spookyPets.clearApiKey', async () => {
			try {
				await configManager.clearApiKey();
				vscode.window.showInformationMessage('API key cleared.');
			} catch (error) {
				console.error('[Extension] Error in clearApiKey command:', error);
				vscode.window.showErrorMessage('Failed to clear API key.');
			}
		});
		context.subscriptions.push(clearApiKeyCommand);

		// Register selectPet command
		const selectPetCommand = vscode.commands.registerCommand('spookyPets.selectPet', async () => {
			try {
				const petOptions = [
					{
						label: '🎃 Pumpkin',
						description: 'Playful and punny with autumn-themed observations',
						petType: PetType.Pumpkin
					},
					{
						label: '💀 Skeleton',
						description: 'Wise and sarcastic with bone-dry humor',
						petType: PetType.Skeleton
					},
					{
						label: '👻 Ghost',
						description: 'Mysterious and ethereal with haunting insights',
						petType: PetType.Ghost
					}
				];

				const selection = await vscode.window.showQuickPick(petOptions, {
					placeHolder: 'Select your spooky coding companion'
				});

				if (selection) {
					// Update configuration
					await configManager.setSelectedPet(selection.petType);
					
					// Update the displayed pet
					petPanelProvider.showPet(selection.petType);
					
					// Hide any existing speech bubble when switching pets
					petPanelProvider.hideSpeechBubble();
					
					vscode.window.showInformationMessage(`${selection.label} is now your coding companion!`);
				}
			} catch (error) {
				console.error('[Extension] Error in selectPet command:', error);
				vscode.window.showErrorMessage('Failed to switch pet. Please try again.');
			}
		});
		context.subscriptions.push(selectPetCommand);

		// Register triggerCommentary command
		const triggerCommentaryCommand = vscode.commands.registerCommand('spookyPets.triggerCommentary', async () => {
			try {
				console.log('[Extension] Trigger commentary command invoked');
				await commentaryScheduler.triggerManualCommentary();
			} catch (error) {
				console.error('[Extension] Error in triggerCommentary command:', error);
				// Error is already handled in CommentaryScheduler
			}
		});
		context.subscriptions.push(triggerCommentaryCommand);

		// Listen for configuration changes
		context.subscriptions.push(
			configManager.onConfigurationChanged(() => {
				try {
					// Update commentary frequency
					const frequency = configManager.getCommentaryFrequency();
					commentaryScheduler.updateFrequency(frequency);
				} catch (error) {
					console.error('[Extension] Error handling configuration change:', error);
				}
			})
		);

		// Check if API key is configured on first activation
		configManager.getApiKey().then((apiKey) => {
			if (!apiKey) {
				vscode.window.showInformationMessage(
					'Welcome to Spooky Code Pets! Please configure your API key to enable pet commentary.',
					'Set API Key'
				).then((selection) => {
					if (selection === 'Set API Key') {
						vscode.commands.executeCommand('spookyPets.setApiKey');
					}
				});
			}
		}).catch((error) => {
			console.error('[Extension] Error checking API key on activation:', error);
		});
	} catch (error) {
		console.error('[Extension] Critical error during activation:', error);
		vscode.window.showErrorMessage(
			'Spooky Code Pets failed to activate. Please check the output console for details.'
		);
		// Extension should remain registered even if activation fails
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
