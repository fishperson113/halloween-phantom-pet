# Frame Numbering Fix for Expression Animations

## Issue Identified

The original frame configuration was incorrectly numbering the expression frames, not accounting for the empty spaces in the 4-column grid layout.

## Sprite Sheet Layout

The sprite sheet uses a 4-column grid, but expression animations only use 3 frames each:

```
Grid Position:  Col 0   Col 1   Col 2   Col 3
              ┌───────┬───────┬───────┬───────┐
Row 0 (0-3):  │   0   │   1   │   2   │   3   │  Idle
Row 1 (4-7):  │   4   │   5   │   6   │   7   │  Walk Left
Row 2 (8-11): │   8   │   9   │  10   │  11   │  Walk Right
Row 3 (12-15):│  12   │  13   │  14   │  15   │  Interaction
Row 4 (16-19):│  16   │  17   │  18   │ EMPTY │  Happy Expression
Row 5 (20-23):│  20   │  21   │  22   │ EMPTY │  Neutral Expression
Row 6 (24-27):│  24   │  25   │  26   │ EMPTY │  Concerned Expression
              └───────┴───────┴───────┴───────┘
```

## Frame Number Calculation

Frame numbers are calculated as: `frameNumber = (row * 4) + column`

Examples:
- Frame 16: Row 4, Col 0 → (4 × 4) + 0 = 16 ✅
- Frame 17: Row 4, Col 1 → (4 × 4) + 1 = 17 ✅
- Frame 18: Row 4, Col 2 → (4 × 4) + 2 = 18 ✅
- Frame 19: Row 4, Col 3 → (4 × 4) + 3 = 19 (EMPTY - not used)
- Frame 20: Row 5, Col 0 → (5 × 4) + 0 = 20 ✅
- Frame 21: Row 5, Col 1 → (5 × 4) + 1 = 21 ✅
- Frame 22: Row 5, Col 2 → (5 × 4) + 2 = 22 ✅

## Before Fix (INCORRECT)

```typescript
happyExpressionFrames: [16, 17, 18],      // ✅ Correct
neutralExpressionFrames: [19, 20, 21],    // ❌ Wrong! 19 is empty space
concernedExpressionFrames: [22, 23, 24],  // ❌ Wrong! Overlaps with neutral
```

**Problem**: 
- Neutral started at frame 19 (the empty slot in row 4)
- This would render the empty space and then frames from row 5
- Concerned frames overlapped with neutral frames

## After Fix (CORRECT)

```typescript
happyExpressionFrames: [16, 17, 18],      // ✅ Row 4, Cols 0-2
neutralExpressionFrames: [20, 21, 22],    // ✅ Row 5, Cols 0-2
concernedExpressionFrames: [24, 25, 26],  // ✅ Row 6, Cols 0-2
```

**Solution**:
- Happy: Frames 16-18 (row 4, columns 0-2)
- Neutral: Frames 20-22 (row 5, columns 0-2) - skips frame 19
- Concerned: Frames 24-26 (row 6, columns 0-2) - skips frame 23

## Rendering Logic

The webview correctly handles this with:

```javascript
const framesPerRow = Math.floor(this.spriteImage.width / this.currentPetConfig.frameWidth);
const srcX = (frameNumber % framesPerRow) * this.currentPetConfig.frameWidth;
const srcY = Math.floor(frameNumber / framesPerRow) * this.currentPetConfig.frameHeight;
```

This automatically:
- Calculates which row the frame is in: `Math.floor(frameNumber / 4)`
- Calculates which column: `frameNumber % 4`
- Skips empty spaces because they're not in the frame arrays

## Impact

This fix ensures:
1. ✅ Happy expressions render correctly from frames 16-18
2. ✅ Neutral expressions render correctly from frames 20-22 (not 19-21)
3. ✅ Concerned expressions render correctly from frames 24-26 (not 22-24)
4. ✅ Empty grid spaces (19, 23, 27) are properly skipped
5. ✅ No overlap between expression types
