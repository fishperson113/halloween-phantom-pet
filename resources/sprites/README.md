# Sprite Assets Directory

This directory contains the sprite sheets for the Spooky Code Pets extension.

## Quick Start

To add custom sprites for your pets:

1. Create a PNG sprite sheet following the format in `SPRITE_GUIDE.md`
2. Name your file according to the pet type:
   - `pumpkin-sprites.png` - For the pumpkin pet
   - `skeleton-sprites.png` - For the skeleton pet
   - `ghost-sprites.png` - For the ghost pet
3. Place the file in this directory
4. Reload VS Code to see your custom sprites

## Sprite Sheet Format

Each sprite sheet must be a PNG file with:
- **16 frames** arranged in a **4x4 grid**
- **64x64 pixels per frame** (256x256 total image)
- **Transparent background** (RGBA format)

### Frame Layout

```
Frames 0-3:   Idle animation
Frames 4-7:   Walk left animation
Frames 8-11:  Walk right animation
Frames 12-15: Interaction animation (triggered on click)
```

## Detailed Documentation

For complete instructions on creating sprite sheets, see the main **SPRITE_GUIDE.md** file in the extension root directory.

## Fallback Behavior

If a sprite file is missing or fails to load, the extension will display a simple emoji-based fallback:
- 🎃 for pumpkin
- 💀 for skeleton
- 👻 for ghost

This ensures the extension continues to work even without custom sprites.

## Example Sprite Sheets

Currently, the extension uses emoji fallbacks by default. You can create your own sprite sheets to replace these with custom animations!

## Need Help?

See the full **SPRITE_GUIDE.md** for:
- Detailed sprite creation instructions
- Animation tips and best practices
- Troubleshooting common issues
- Advanced customization options
