# Spooky Code Pets

An interactive VS Code extension that brings spooky animated companions to your coding experience! Choose from a pumpkin, skeleton, or ghost that will periodically review your code and provide LLM-powered commentary with personality.

## Features

- **Animated Spooky Pets**: Display animated pets (pumpkin, skeleton, ghost) in your VS Code Explorer sidebar
- **AI-Powered Commentary**: Pets analyze your code and provide helpful or entertaining observations using LLM
- **Unique Personalities**: Each pet has its own distinct personality and commentary style
- **Custom Sprites**: Support for user-provided sprite sheets to customize pet appearances
- **Configurable Frequency**: Control how often pets comment on your code
- **Secure API Key Storage**: API keys stored securely using VS Code's secrets API
- **Interactive Animations**: Click on pets to trigger special interaction animations

## Custom Sprite Sheets

The extension supports custom sprite sheets! You can create your own animated pets by providing PNG sprite sheets.

### Quick Start with Custom Sprites

1. Create a 256x256 PNG file with 16 frames (64x64 each) arranged in a 4x4 grid
2. Name it `pumpkin-sprites.png`, `skeleton-sprites.png`, or `ghost-sprites.png`
3. Place it in the `resources/sprites/` directory
4. Reload VS Code

For detailed instructions, see **[SPRITE_GUIDE.md](SPRITE_GUIDE.md)**

### Sprite Sheet Format

- **16 frames** in a 4x4 grid layout
- **64x64 pixels per frame** (256x256 total)
- **Transparent background** (PNG with alpha channel)
- Frames 0-3: Idle animation
- Frames 4-7: Walk left animation
- Frames 8-11: Walk right animation
- Frames 12-15: Interaction animation

## Requirements

- VS Code version 1.106.1 or higher
- OpenAI API key or compatible LLM API endpoint
- Node.js (for development)

### Getting Started

1. Install the extension
2. Run command: `Spooky Pets: Set API Key`
3. Enter your OpenAI API key
4. Select your preferred pet: `Spooky Pets: Select Pet`
5. Start coding and watch your pet provide commentary!

### Optional: Add Custom Sprites

- See [SPRITE_GUIDE.md](SPRITE_GUIDE.md) for instructions on creating custom sprite sheets
- Place sprite PNG files in `resources/sprites/` directory
- Without custom sprites, the extension uses emoji-based fallback displays

## Extension Settings

This extension contributes the following settings:

* `spookyPets.commentaryFrequency`: Number of characters to write before automatic commentary (default: 200, set to 0 to disable)
* `spookyPets.selectedPet`: Currently active pet (`pumpkin`, `skeleton`, or `ghost`)
* `spookyPets.apiEndpoint`: OpenAI-compatible API endpoint (default: OpenAI)
* `spookyPets.model`: LLM model name (default: `gpt-3.5-turbo`)
* `spookyPets.maxTokens`: Maximum tokens for commentary responses (default: 75)
* `spookyPets.contextLines`: Lines of code to include in context (default: 15)
* `spookyPets.customPrompts`: Custom personality prompts for each pet

## Commands

* `Spooky Pets: Set API Key` - Configure your LLM API key
* `Spooky Pets: Clear API Key` - Remove stored API key
* `Spooky Pets: Select Pet` - Choose which pet to display
* `Spooky Pets: Trigger Commentary Now` - Manually trigger pet commentary

## Known Issues


## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0


### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

Attribution:

ghost asset from PiXeRaT on https://pixerat.itch.io/round-ghost

**Enjoy!**
