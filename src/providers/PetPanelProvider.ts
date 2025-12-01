import * as vscode from 'vscode';
import { PetType } from '../models/PetType.js';
import { getSpriteConfig } from '../sprites/index.js';

/**
 * Provider for the pet webview panel in the Explorer sidebar
 * Manages pet display, animations, and speech bubbles
 */
export class PetPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'spookyPets.petView';

  private _view?: vscode.WebviewView;
  private _currentPet: PetType = PetType.Pumpkin;
  private _extensionUri: vscode.Uri;

  constructor(private readonly context: vscode.ExtensionContext) {
    this._extensionUri = context.extensionUri;
  }

  /**
   * Resolves the webview view when it becomes visible
   */
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void | Thenable<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'out', 'webview'),
        vscode.Uri.joinPath(this._extensionUri, 'resources')
      ]
    };

    try {
      webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    } catch (error) {
      console.error('[PetPanelProvider] Failed to generate webview HTML:', error);
      // Provide fallback HTML
      webviewView.webview.html = this._getFallbackHtml();
    }

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      message => {
        try {
          switch (message.type) {
            case 'petClicked':
              // Trigger interaction animation
              this._view?.webview.postMessage({
                type: 'playInteraction'
              });
              break;
            case 'error':
              console.error('[PetPanelProvider] Webview error:', message.error);
              // Log sprite loading errors specifically
              if (message.error && message.error.includes('sprite')) {
                console.error('[PetPanelProvider] Sprite loading failed, fallback should be active');
              }
              break;
            case 'spriteLoadError':
              console.error('[PetPanelProvider] Sprite failed to load:', message.petType);
              // Webview will handle fallback rendering
              break;
          }
        } catch (error) {
          console.error('[PetPanelProvider] Error handling webview message:', error);
        }
      },
      undefined,
      this.context.subscriptions
    );

    // Show the initial pet
    try {
      this.showPet(this._currentPet);
    } catch (error) {
      console.error('[PetPanelProvider] Failed to show initial pet:', error);
    }
  }

  /**
   * Display a specific pet type
   * Hides the previous pet and displays the new one while maintaining panel dimensions
   */
  public showPet(petType: PetType): void {
    const previousPet = this._currentPet;
    this._currentPet = petType;
    
    if (this._view) {
      try {
        // Get sprite configuration for the pet
        const petConfig = getSpriteConfig(petType);
        
        // Get sprite URI
        const spriteUri = this._view.webview.asWebviewUri(
          vscode.Uri.joinPath(this._extensionUri, 'resources', 'sprites', petConfig.spriteSheet)
        );
        
        this._view.webview.postMessage({
          type: 'loadPet',
          petConfig: petConfig,
          spriteUri: spriteUri.toString(),
          previousPet: previousPet
        });
      } catch (error) {
        console.error('[PetPanelProvider] Failed to send showPet message:', error);
      }
    }
  }

  /**
   * Display a speech bubble with commentary
   */
  public showSpeechBubble(message: string): void {
    if (this._view) {
      try {
        this._view.webview.postMessage({
          type: 'showSpeechBubble',
          message: message
        });
      } catch (error) {
        console.error('[PetPanelProvider] Failed to send showSpeechBubble message:', error);
      }
    }
  }

  /**
   * Hide the speech bubble
   */
  public hideSpeechBubble(): void {
    if (this._view) {
      try {
        this._view.webview.postMessage({
          type: 'hideSpeechBubble'
        });
      } catch (error) {
        console.error('[PetPanelProvider] Failed to send hideSpeechBubble message:', error);
      }
    }
  }

  /**
   * Show processing indicator
   */
  public showProcessingIndicator(): void {
    if (this._view) {
      try {
        this._view.webview.postMessage({
          type: 'showProcessing'
        });
      } catch (error) {
        console.error('[PetPanelProvider] Failed to send showProcessing message:', error);
      }
    }
  }

  /**
   * Hide processing indicator
   */
  public hideProcessingIndicator(): void {
    if (this._view) {
      try {
        this._view.webview.postMessage({
          type: 'hideProcessing'
        });
      } catch (error) {
        console.error('[PetPanelProvider] Failed to send hideProcessing message:', error);
      }
    }
  }

  /**
   * Get the current pet type
   */
  public getCurrentPet(): PetType {
    return this._currentPet;
  }

  /**
   * Generate HTML content for the webview
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Add cache busting timestamp
    const timestamp = Date.now();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'petView.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'petView.css')
    );

    // Generate a nonce for CSP
    const nonce = this._getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} data:; script-src 'nonce-${nonce}';">
    <title>Spooky Pet</title>
    <link rel="stylesheet" href="${styleUri}?v=${timestamp}">
</head>
<body>
    <div id="pet-container">
        <canvas id="pet-canvas" width="64" height="64"></canvas>
        <div id="processing-indicator" class="hidden">
            <div class="spinner"></div>
        </div>
    </div>
    
    <div id="speech-bubble" class="hidden">
        <div class="speech-bubble-content"></div>
        <div class="speech-bubble-tail"></div>
    </div>

    <script nonce="${nonce}" src="${scriptUri}?v=${timestamp}"></script>
</body>
</html>`;
  }

  /**
   * Generate a random nonce for CSP
   */
  private _getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
   * Generate fallback HTML when resources fail to load
   */
  private _getFallbackHtml(): string {
    const nonce = this._getNonce();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spooky Pet</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
        }
        #fallback-pet {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            border-radius: 50%;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
        }
        #fallback-message {
            text-align: center;
            font-size: 12px;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div id="fallback-pet">🎃</div>
    <div id="fallback-message">Your spooky pet is here!<br>(Sprite resources unavailable)</div>
</body>
</html>`;
  }
}
