# Sprite Sheet Template

Use this as a reference when creating your sprite sheets.

## File Naming Convention

- `pumpkin-sprites.png` - Pumpkin pet sprite sheet
- `skeleton-sprites.png` - Skeleton pet sprite sheet  
- `ghost-sprites.png` - Ghost pet sprite sheet

## Dimensions

- **Total Image Size**: 256 x 256 pixels
- **Frame Size**: 64 x 64 pixels
- **Grid Layout**: 4 columns × 4 rows = 16 frames
- **File Format**: PNG with transparency (RGBA)

## Frame Index Map

```
┌─────────┬─────────┬─────────┬─────────┐
│ Frame 0 │ Frame 1 │ Frame 2 │ Frame 3 │
│  Idle   │  Idle   │  Idle   │  Idle   │
├─────────┼─────────┼─────────┼─────────┤
│ Frame 4 │ Frame 5 │ Frame 6 │ Frame 7 │
│  Left   │  Left   │  Left   │  Left   │
├─────────┼─────────┼─────────┼─────────┤
│ Frame 8 │ Frame 9 │ Frame10 │ Frame11 │
│  Right  │  Right  │  Right  │  Right  │
├─────────┼─────────┼─────────┼─────────┤
│ Frame12 │ Frame13 │ Frame14 │ Frame15 │
│ Interact│ Interact│ Interact│ Interact│
└─────────┴─────────┴─────────┴─────────┘
```

## Animation Descriptions

### Idle Animation (Frames 0-3)
- **Purpose**: Default state when pet is not doing anything
- **Behavior**: Loops continuously
- **Suggestions**: 
  - Gentle breathing motion
  - Slight floating/bobbing
  - Occasional blink or small movement
  - Keep it subtle and non-distracting

### Walk Left Animation (Frames 4-7)
- **Purpose**: Pet moving to the left side
- **Behavior**: Loops continuously
- **Suggestions**:
  - Show directional movement
  - Legs/body moving left
  - Can be simple side-to-side motion
  - Should feel like forward movement

### Walk Right Animation (Frames 8-11)
- **Purpose**: Pet moving to the right side
- **Behavior**: Loops continuously
- **Suggestions**:
  - Mirror of walk left, or unique animation
  - Legs/body moving right
  - Maintain same energy as walk left
  - Should feel like forward movement

### Interaction Animation (Frames 12-15)
- **Purpose**: Triggered when user clicks the pet
- **Behavior**: Plays once, then returns to idle
- **Suggestions**:
  - More expressive than other animations
  - Jump, wave, spin, bounce
  - Show personality and character
  - Make it fun and rewarding to click!

## Design Guidelines

### Visual Style
- Keep character recognizable across all frames
- Maintain consistent proportions
- Use clear, readable shapes (remember it's displayed small)
- Transparent background is required

### Animation Principles
- **Smooth Transitions**: Each frame should flow naturally to the next
- **Consistent Timing**: All frames have equal duration (150ms default)
- **Centered Character**: Keep the character centered in each 64x64 frame
- **Readable Motion**: Movement should be clear even at small size

### Technical Requirements
- **No Padding**: Frames should be exactly 64x64 with no spacing
- **Alpha Channel**: Use transparency for background
- **Optimize Size**: Keep file size reasonable (under 100KB recommended)
- **Test Early**: Test in the extension frequently during creation

## Checklist Before Submitting

- [ ] Image is exactly 256x256 pixels
- [ ] Contains 16 frames in 4x4 grid
- [ ] Each frame is 64x64 pixels
- [ ] Saved as PNG with transparency
- [ ] File named correctly for pet type
- [ ] Character is centered in each frame
- [ ] Animations loop smoothly
- [ ] Tested in the extension
- [ ] File size is reasonable

## Example Workflow

1. **Sketch**: Draw your character design
2. **Create Frames**: Make 16 individual 64x64 frames
3. **Test Animation**: Preview each animation sequence
4. **Arrange Grid**: Place frames in 4x4 layout (256x256)
5. **Export PNG**: Save with transparency
6. **Test in Extension**: Place in resources/sprites/ and reload VS Code
7. **Iterate**: Adjust timing or frames as needed

## Tips for Success

- Start simple - you can always add detail later
- Test frequently in the actual extension
- Watch how other 2D games animate similar characters
- Keep the interaction animation fun and surprising
- Use reference images for movement and timing
- Don't be afraid to iterate and improve

## Need Help?

See the main [SPRITE_GUIDE.md](../../SPRITE_GUIDE.md) for:
- Detailed creation instructions
- Troubleshooting tips
- Advanced customization options
- Tool recommendations
