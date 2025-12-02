
## Custom Sprite Sheets

The extension supports custom sprite sheets! You can create your own animated pets by providing PNG sprite sheets.

### Quick Start with Custom Sprites

1. Create a 256x448 PNG file with 25 frames (64x64 each) arranged in a 4x7 grid
2. Name it `pumpkin-sprites.png`, `skeleton-sprites.png`, or `ghost-sprites.png`
3. Place it in the `resources/sprites/` directory
4. Reload VS Code

For detailed instructions, see **[SPRITE_GUIDE.md](SPRITE_GUIDE.md)**

### Sprite Sheet Format

- **25 frames** in a 4x7 grid layout (only 3 frames per expression row)
- **64x64 pixels per frame** (256x448 total)
- **Transparent background** (PNG with alpha channel)
- Frames 0-3: Idle animation
- Frames 4-7: Walk left animation
- Frames 8-11: Walk right animation
- Frames 12-15: Interaction animation
- Frames 16-18: Happy expression (frame 19 empty)
- Frames 20-22: Neutral expression (frame 23 empty)
- Frames 24-26: Concerned expression (frame 27 empty)

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

## How It Works

### Expressive Reactions

When your pet provides commentary, it displays an emotional expression based on the code quality:

- **Happy Expression** 😊: Well-written code, good practices, elegant solutions
- **Neutral Expression** 😐: General observations, questions, neutral commentary
- **Concerned Expression** 😟: Potential bugs, code smells, areas for improvement

### Speech Bubble Behavior

Speech bubbles can be dismissed in two ways:
1. **Click the pet** to immediately dismiss the commentary
2. **Keep typing** and the bubble auto-dismisses after 5% of your commentary frequency threshold

This ensures pets don't stay frozen in expression animations indefinitely!

## Known Issues

- Sprite images may not load if custom PNG files aren't provided (extension shows emoji fallbacks: 🎃💀👻)
- First commentary request may take longer due to LLM API cold start
- Rate limiting may occur with very frequent typing (handled gracefully with retry logic)

## Release Notes

### 0.1.0 - Initial Release

**Features:**
- Animated spooky pets (pumpkin, skeleton, ghost) in sidebar
- AI-powered code commentary with LLM integration
- Expressive reactions based on code quality
- Auto-dismiss speech bubbles (click or type to dismiss)
- Three unique pet personalities
- Configurable commentary frequency
- Secure API key storage
- Custom sprite sheet support

**Technical:**
- Built with TypeScript and VS Code Extension API
- Uses Zod for structured LLM response validation
- Implements property-based testing with fast-check
- Supports OpenAI-compatible API endpoints

---

## Development

This extension was built using **Kiro's Spec-Driven Development** workflow. See the `.kiro/specs/` directory for the complete specification including requirements, design, and implementation tasks.

### Project Structure

```
halloween-phantom-pet/
├── src/
│   ├── extension.ts          # Extension entry point
│   ├── models/                # Data models and interfaces
│   ├── services/              # LLM, configuration, scheduler
│   ├── providers/             # Pet panel webview provider
│   ├── personalities/         # Pet personality definitions
│   ├── sprites/               # Sprite configurations
│   ├── webview/               # HTML/CSS/JS for pet display
│   └── test/                  # Unit and property-based tests
├── resources/
│   └── sprites/               # Sprite PNG files
└── .kiro/specs/               # Specification documents
```

## Installation

See [INSTALLATION.md](INSTALLATION.md) for detailed installation instructions.

For quick testing, see [QUICK_START.md](QUICK_START.md).

Attribution:

ghost asset from PiXeRaT on https://pixerat.itch.io/round-ghost

**Enjoy!**
