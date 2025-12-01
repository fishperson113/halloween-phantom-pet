# Spooky Code Pets - Sprite Sheet Guide

This guide explains how to create and add custom sprite sheets for the Spooky Code Pets extension.

## Overview

The extension uses sprite sheets (PNG images) to animate the pets. Each pet requires a single PNG file containing all animation frames arranged in a grid format.

## Sprite Sheet Requirements

### File Format
- **Format**: PNG (Portable Network Graphics)
- **Color Mode**: RGBA (supports transparency)
- **Bit Depth**: 24-bit or 32-bit (with alpha channel)

### Dimensions
- **Frame Size**: 64x64 pixels (default, can be customized)
- **Total Frames**: 16 frames minimum
- **Layout**: Frames arranged in a grid, left-to-right, top-to-bottom

### Frame Layout

The sprite sheet must contain frames in the following order:

```
Frame Layout (4x4 grid for 64x64 frames = 256x256 total image):

┌────────┬────────┬────────┬────────┐
│ Idle 0 │ Idle 1 │ Idle 2 │ Idle 3 │  Frames 0-3: Idle animation
├────────┼────────┼────────┼────────┤
│ Left 0 │ Left 1 │ Left 2 │ Left 3 │  Frames 4-7: Walk left animation
├────────┼────────┼────────┼────────┤
│Right 0 │Right 1 │Right 2 │Right 3 │  Frames 8-11: Walk right animation
├────────┼────────┼────────┼────────┤
│ Int 0  │ Int 1  │ Int 2  │ Int 3  │  Frames 12-15: Interaction animation
└────────┴────────┴────────┴────────┘
```

### Animation Types

1. **Idle Animation** (Frames 0-3)
   - Default animation when pet is not interacting
   - Should loop smoothly
   - Subtle movements (breathing, floating, blinking)

2. **Walk Left Animation** (Frames 4-7)
   - Pet moving to the left
   - Should show directional movement
   - Loops continuously

3. **Walk Right Animation** (Frames 8-11)
   - Pet moving to the right
   - Mirror of walk left or unique animation
   - Loops continuously

4. **Interaction Animation** (Frames 12-15)
   - Triggered when user clicks on the pet
   - Can be more expressive (jumping, waving, spinning)
   - Plays once then returns to idle

## Creating Your Sprite Sheet

### Step 1: Design Your Frames

1. Create 16 individual frames at 64x64 pixels each
2. Use transparent backgrounds (alpha channel)
3. Keep the character centered in each frame
4. Ensure smooth transitions between frames

### Step 2: Arrange Frames in Grid

1. Create a new image: 256x256 pixels (for 64x64 frames)
2. Arrange frames in a 4x4 grid as shown above
3. Frames should be placed left-to-right, top-to-bottom
4. No spacing or padding between frames

### Step 3: Export as PNG

1. Save as PNG with transparency
2. Name the file according to pet type:
   - `pumpkin-sprites.png`
   - `skeleton-sprites.png`
   - `ghost-sprites.png`

## Adding Sprites to the Extension

### Option 1: Replace Default Sprites (Recommended)

1. Place your PNG file in the `resources/sprites/` directory
2. Use the exact filename for the pet type:
   - `pumpkin-sprites.png`
   - `skeleton-sprites.png`
   - `ghost-sprites.png`
3. Reload VS Code to see your custom sprites

### Option 2: Custom Frame Sizes

If you want to use different frame dimensions:

1. Edit `src/sprites/spriteConfigs.ts`
2. Update the `frameWidth` and `frameHeight` values
3. Ensure your sprite sheet dimensions match: `width = frameWidth * 4`, `height = frameHeight * 4`
4. Recompile the extension: `npm run compile`

## Example Sprite Configuration

```typescript
{
  type: PetType.Pumpkin,
  spriteSheet: 'pumpkin-sprites.png',
  frameWidth: 64,        // Width of each frame
  frameHeight: 64,       // Height of each frame
  idleFrames: [0, 1, 2, 3],           // Frames for idle animation
  walkLeftFrames: [4, 5, 6, 7],       // Frames for walking left
  walkRightFrames: [8, 9, 10, 11],    // Frames for walking right
  interactionFrames: [12, 13, 14, 15], // Frames for interaction
  frameDuration: 150     // Milliseconds per frame
}
```

## Tips for Creating Great Sprites

### Animation Tips
- **Smooth Transitions**: Ensure frames flow naturally into each other
- **Consistent Style**: Keep art style consistent across all frames
- **Readable at Small Size**: Remember sprites are displayed at 64x64 or smaller
- **Expressive Interaction**: Make the interaction animation fun and noticeable

### Technical Tips
- **Transparent Backgrounds**: Always use alpha channel for transparency
- **Centered Characters**: Keep the character centered for smooth animation
- **Consistent Sizing**: Character should be roughly the same size across frames
- **Test Early**: Test your sprites in the extension frequently

### Performance Tips
- **Optimize File Size**: Use PNG optimization tools to reduce file size
- **Reasonable Dimensions**: Stick to 64x64 or 128x128 for best performance
- **Limit Colors**: Fewer colors = smaller file size

## Troubleshooting

### Sprite Not Loading
- Check filename matches exactly (case-sensitive)
- Verify file is in `resources/sprites/` directory
- Ensure PNG format with transparency
- Reload VS Code window

### Animation Looks Choppy
- Increase `frameDuration` in sprite config (higher = slower)
- Add more frames for smoother animation
- Check frame transitions are smooth

### Sprite Appears Cut Off
- Verify frame dimensions match config
- Check sprite sheet total size = frameWidth × 4 by frameHeight × 4
- Ensure character is centered in each frame

### Fallback Display Shows Instead
- Extension will show emoji fallback if sprite fails to load
- Check browser console in VS Code Developer Tools for errors
- Verify sprite sheet dimensions and format

## Advanced Customization

### Custom Frame Sequences

You can customize which frames are used for each animation:

```typescript
// Example: Use only 2 frames for idle animation
idleFrames: [0, 1]

// Example: Longer walk cycle
walkLeftFrames: [4, 5, 6, 7, 4, 5, 6, 7]

// Example: Complex interaction
interactionFrames: [12, 13, 14, 15, 14, 13, 12]
```

### Different Frame Rates

Adjust animation speed per pet:

```typescript
frameDuration: 100  // Faster animation
frameDuration: 200  // Slower animation
```

### Non-Square Frames

You can use rectangular frames:

```typescript
frameWidth: 96,   // Wider frames
frameHeight: 64,  // Standard height
// Sprite sheet would be 384x256 (96*4 by 64*4)
```

## Resources

### Sprite Creation Tools
- **Aseprite**: Professional pixel art and animation tool
- **Piskel**: Free online pixel art editor
- **GIMP**: Free image editor with animation support
- **Photoshop**: Professional image editor

### Inspiration
- Look at classic 2D game sprites for animation ideas
- Study how characters move in pixel art games
- Check out sprite sheet examples on OpenGameArt.org

## Need Help?

If you encounter issues or have questions:
1. Check the troubleshooting section above
2. Review the example configurations in `src/sprites/spriteConfigs.ts`
3. Open an issue on the extension's GitHub repository

Happy sprite creating! 🎃💀👻
