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
Frame Layout (4x7 grid for 64x64 frames = 256x448 total image):

┌────────┬────────┬────────┬────────┐
│ Idle 0 │ Idle 1 │ Idle 2 │ Idle 3 │  Frames 0-3: Idle animation
├────────┼────────┼────────┼────────┤
│ Left 0 │ Left 1 │ Left 2 │ Left 3 │  Frames 4-7: Walk left animation
├────────┼────────┼────────┼────────┤
│Right 0 │Right 1 │Right 2 │Right 3 │  Frames 8-11: Walk right animation
├────────┼────────┼────────┼────────┤
│ Int 0  │ Int 1  │ Int 2  │ Int 3  │  Frames 12-15: Interaction animation
├────────┼────────┼────────┼────────┤
│Happy 0 │Happy 1 │Happy 2 │ (19)   │  Frames 16-18: Happy expression (frame 19 empty)
├────────┼────────┼────────┼────────┤
│Neut 0  │Neut 1  │Neut 2  │ (23)   │  Frames 20-22: Neutral expression (frame 23 empty)
├────────┼────────┼────────┼────────┤
│Conc 0  │Conc 1  │Conc 2  │ (27)   │  Frames 24-26: Concerned expression (frame 27 empty)
└────────┴────────┴────────┴────────┘

Note: Frame numbers in parentheses (19, 23, 27) are empty spaces in the grid.
The extension only uses 3 frames per expression animation.
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

5. **Happy Expression** (Frames 16-18)
   - Displayed when pet provides positive commentary
   - Shows excitement, joy, or approval
   - Examples: bouncing, smiling, sparkling
   - Loops while speech bubble is visible

6. **Neutral Expression** (Frames 19-21)
   - Displayed for neutral or observational commentary
   - Shows calm, thoughtful, or curious demeanor
   - Examples: thinking pose, gentle movement
   - Loops while speech bubble is visible

7. **Concerned Expression** (Frames 22-24)
   - Displayed when pet identifies potential issues
   - Shows worry, confusion, or caution
   - Examples: head tilt, worried look, cautious stance
   - Loops while speech bubble is visible

## Creating Your Sprite Sheet

### Step 1: Design Your Frames

1. Create 25 individual frames at 64x64 pixels each (frames 0-24)
2. Use transparent backgrounds (alpha channel)
3. Keep the character centered in each frame
4. Ensure smooth transitions between frames
5. Design expression frames to clearly convey emotion

### Step 2: Arrange Frames in Grid

1. Create a new image: 256x448 pixels (for 64x64 frames in 4x7 grid)
2. Arrange frames in a 4x7 grid as shown above
3. Frames should be placed left-to-right, top-to-bottom
4. No spacing or padding between frames
5. Leave the last frame position in rows 5-7 empty (only 3 frames per expression)

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
  happyExpressionFrames: [16, 17, 18], // Frames for happy expression (row 4, cols 0-2)
  neutralExpressionFrames: [20, 21, 22], // Frames for neutral expression (row 5, cols 0-2)
  concernedExpressionFrames: [24, 25, 26], // Frames for concerned expression (row 6, cols 0-2)
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
