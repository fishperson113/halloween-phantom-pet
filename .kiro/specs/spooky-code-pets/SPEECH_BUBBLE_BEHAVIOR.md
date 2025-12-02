# Speech Bubble Auto-Dismiss Behavior

## Overview

The speech bubble now has intelligent auto-dismiss behavior to prevent the pet from staying frozen in expression animations indefinitely.

## Dismissal Methods

### 1. Click to Dismiss
- **User Action**: Click on the pet while a speech bubble is visible
- **Behavior**: 
  - Speech bubble immediately disappears
  - Pet returns to normal idle/walking behavior
  - Expression animation stops

### 2. Auto-Dismiss After Typing
- **Trigger**: User types additional characters after a speech bubble appears
- **Threshold**: 5% of the commentary frequency setting (minimum 10 characters)
- **Example**: 
  - If commentary frequency is set to 200 characters
  - Speech bubble auto-dismisses after typing 10 more characters (5% of 200)
  - If commentary frequency is set to 1000 characters
  - Speech bubble auto-dismisses after typing 50 more characters (5% of 1000)

### 3. Editor Switch Dismiss
- **Trigger**: User switches to a different editor/file
- **Behavior**: Speech bubble automatically dismisses to avoid confusion

## Implementation Details

### CommentaryScheduler Tracking
```typescript
// Tracks whether speech bubble is currently visible
private isSpeechBubbleVisible: boolean = false;

// Counts characters typed since bubble was shown
private charactersSinceBubbleShown: number = 0;
```

### Auto-Dismiss Logic
```typescript
// Calculate dismiss threshold (5% of commentary frequency, min 10 chars)
const dismissThreshold = Math.max(10, Math.floor(threshold * 0.05));

// Check on every text change
if (this.charactersSinceBubbleShown >= dismissThreshold) {
  this.dismissSpeechBubble();
}
```

### Webview Click Handling
```typescript
// In petView.js
this.canvas.addEventListener('click', () => {
  // If showing expression/speech bubble, dismiss it
  if (this.isShowingExpression && !this.speechBubble.classList.contains('hidden')) {
    this.hideSpeechBubble();
  } else {
    this.playInteractionAnimation();
  }
});
```

## User Experience Benefits

1. **No Frozen Pets**: Pets return to normal behavior automatically
2. **User Control**: Click to dismiss gives immediate control
3. **Natural Flow**: Auto-dismiss after minimal typing feels natural
4. **Context Awareness**: Switching files dismisses stale commentary

## Configuration Impact

The auto-dismiss threshold scales with the commentary frequency setting:
- Lower frequency (100 chars) → Dismisses after ~5-10 chars
- Medium frequency (200 chars) → Dismisses after ~10 chars
- Higher frequency (500 chars) → Dismisses after ~25 chars
- Very high frequency (1000 chars) → Dismisses after ~50 chars

This ensures the bubble doesn't overstay its welcome regardless of user settings.
