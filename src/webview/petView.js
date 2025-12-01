(function() {
    'use strict';

    const vscode = acquireVsCodeApi();

    class SpriteAnimationManager {
        constructor() {
            this.canvas = document.getElementById('pet-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.speechBubble = document.getElementById('speech-bubble');
            this.speechBubbleContent = document.querySelector('.speech-bubble-content');
            this.processingIndicator = document.getElementById('processing-indicator');
            
            this.spriteImage = null;
            this.currentPetConfig = null;
            this.currentAnimation = 'idle';
            this.currentFrameIndex = 0;
            this.lastFrameTime = 0;
            this.animationFrameId = null;
            this.isInteracting = false;
            this.behaviorTimer = null;
            this.nextBehaviorChange = 0;
            
            // Position tracking for movement
            this.positionX = 50; // Percentage from left (0-100), starts at center
            this.movementSpeed = 0.5; // Percentage per frame (4x slower)
            this.targetPositionX = 50; // Target position when walking

            this.setupEventListeners();
            this.updateCanvasPosition();
        }

        setupEventListeners() {
            // Handle clicks on the pet
            this.canvas.addEventListener('click', () => {
                this.playInteractionAnimation();
                vscode.postMessage({ type: 'petClicked' });
            });

            // Listen for messages from the extension
            window.addEventListener('message', (event) => {
                const message = event.data;
                this.handleMessage(message);
            });

            // Handle visibility changes to restart animation
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && this.spriteImage && this.currentPetConfig) {
                    this.startAnimation();
                }
            });

            // Handle resize to redraw and reposition
            window.addEventListener('resize', () => {
                if (this.spriteImage && this.currentPetConfig) {
                    this.updateCanvasPosition();
                    this.render();
                }
            });
        }

        handleMessage(message) {
            switch (message.type) {
                case 'loadPet':
                    this.loadPet(message.petConfig, message.spriteUri);
                    break;
                case 'showSpeechBubble':
                    this.showSpeechBubble(message.message);
                    break;
                case 'hideSpeechBubble':
                    this.hideSpeechBubble();
                    break;
                case 'showProcessing':
                    this.showProcessingIndicator();
                    break;
                case 'hideProcessing':
                    this.hideProcessingIndicator();
                    break;
                case 'playInteraction':
                    this.playInteractionAnimation();
                    break;
            }
        }

        loadPet(petConfig, spriteUri) {
            this.currentPetConfig = petConfig;
            this.currentAnimation = 'idle';
            this.currentFrameIndex = 0;
            
            // Start at center
            this.positionX = 50;
            this.updateCanvasPosition();
            
            // Load sprite image
            const img = new Image();
            img.onload = () => {
                this.spriteImage = img;
                this.startAnimation();
                vscode.postMessage({ type: 'petLoaded', success: true });
            };
            img.onerror = (error) => {
                console.error('[SpriteAnimationManager] Failed to load sprite:', spriteUri, error);
                this.spriteImage = null;
                this.renderFallback(petConfig.type);
                vscode.postMessage({ 
                    type: 'spriteLoadError',
                    petType: petConfig.type,
                    error: 'Failed to load sprite image'
                });
            };
            
            try {
                img.src = spriteUri;
            } catch (error) {
                console.error('[SpriteAnimationManager] Error setting sprite source:', error);
                this.renderFallback(petConfig.type);
                vscode.postMessage({ 
                    type: 'spriteLoadError',
                    petType: petConfig.type,
                    error: error.message
                });
            }
        }

        startAnimation() {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            this.lastFrameTime = performance.now();
            this.nextBehaviorChange = performance.now() + this.getRandomBehaviorDuration();
            this.animate();
        }

        getRandomBehaviorDuration() {
            // Random duration between 1-3 seconds (more frequent changes)
            return 1000 + Math.random() * 2000;
        }

        changeBehavior(currentTime) {
            if (this.isInteracting) {
                return; // Don't change behavior during interaction
            }

            const random = Math.random();
            
            if (random < 0.1) {
                // 10% idle
                this.currentAnimation = 'idle';
                this.currentFrameIndex = 0;
            } else if (random < 0.55) {
                // 45% walk left
                if (this.positionX > 15) {
                    this.currentAnimation = 'walkLeft';
                    this.targetPositionX = 5 + Math.random() * (this.positionX - 15);
                    this.currentFrameIndex = 0;
                } else {
                    this.currentAnimation = 'walkRight';
                    this.targetPositionX = 50 + Math.random() * 40;
                    this.currentFrameIndex = 0;
                }
            } else {
                // 45% walk right
                if (this.positionX < 85) {
                    this.currentAnimation = 'walkRight';
                    this.targetPositionX = this.positionX + 10 + Math.random() * (85 - this.positionX);
                    this.currentFrameIndex = 0;
                } else {
                    this.currentAnimation = 'walkLeft';
                    this.targetPositionX = 10 + Math.random() * 40;
                    this.currentFrameIndex = 0;
                }
            }
            
            this.nextBehaviorChange = currentTime + this.getRandomBehaviorDuration();
        }

        animate(currentTime = performance.now()) {
            this.animationFrameId = requestAnimationFrame((time) => this.animate(time));

            // Update position if walking
            this.updatePosition();

            // Check if it's time to change behavior
            if (currentTime >= this.nextBehaviorChange) {
                this.changeBehavior(currentTime);
            }

            const deltaTime = currentTime - this.lastFrameTime;
            
            if (deltaTime >= this.currentPetConfig.frameDuration) {
                this.lastFrameTime = currentTime;
                this.advanceFrame();
                this.render();
            }
        }

        updatePosition() {
            if (this.currentAnimation === 'walkLeft') {
                if (this.positionX > this.targetPositionX) {
                    this.positionX = Math.max(this.targetPositionX, this.positionX - this.movementSpeed);
                    this.updateCanvasPosition();
                } else {
                    this.currentAnimation = 'idle';
                    this.currentFrameIndex = 0;
                }
            } else if (this.currentAnimation === 'walkRight') {
                if (this.positionX < this.targetPositionX) {
                    this.positionX = Math.min(this.targetPositionX, this.positionX + this.movementSpeed);
                    this.updateCanvasPosition();
                } else {
                    this.currentAnimation = 'idle';
                    this.currentFrameIndex = 0;
                }
            }
        }

        updateCanvasPosition() {
            // Get the pet container
            const container = document.getElementById('pet-container');
            if (!container) {
                console.error('[Pet] Container not found!');
                return;
            }
            
            const containerWidth = container.clientWidth;
            const canvasWidth = 64;
            
            // Calculate pixel position from percentage
            const pixelPosition = (this.positionX / 100) * containerWidth - (canvasWidth / 2);
            
            // Clamp to bounds
            const minPos = 0;
            const maxPos = containerWidth - canvasWidth;
            const clampedPosition = Math.max(minPos, Math.min(maxPos, pixelPosition));
            
            // Use translateX for horizontal movement only (vertical position is fixed in CSS)
            this.canvas.style.transform = `translateX(${clampedPosition}px)`;
        }

        advanceFrame() {
            const frames = this.getCurrentFrameSequence();
            this.currentFrameIndex = (this.currentFrameIndex + 1) % frames.length;
            
            // If interaction animation is complete, return to idle
            if (this.isInteracting && this.currentFrameIndex === 0) {
                this.isInteracting = false;
                this.currentAnimation = 'idle';
            }
        }

        getCurrentFrameSequence() {
            switch (this.currentAnimation) {
                case 'walkLeft':
                    return this.currentPetConfig.walkLeftFrames;
                case 'walkRight':
                    return this.currentPetConfig.walkRightFrames;
                case 'interaction':
                    return this.currentPetConfig.interactionFrames;
                case 'idle':
                default:
                    return this.currentPetConfig.idleFrames;
            }
        }

        render() {
            if (!this.currentPetConfig) {
                return;
            }

            if (!this.spriteImage) {
                this.renderFallback(this.currentPetConfig.type);
                return;
            }

            try {
                const frames = this.getCurrentFrameSequence();
                const frameNumber = frames[this.currentFrameIndex];
                
                // Calculate sprite sheet position
                const framesPerRow = Math.floor(this.spriteImage.width / this.currentPetConfig.frameWidth);
                const srcX = (frameNumber % framesPerRow) * this.currentPetConfig.frameWidth;
                const srcY = Math.floor(frameNumber / framesPerRow) * this.currentPetConfig.frameHeight;

                // Clear canvas
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                // Draw sprite frame
                this.ctx.drawImage(
                    this.spriteImage,
                    srcX, srcY,
                    this.currentPetConfig.frameWidth,
                    this.currentPetConfig.frameHeight,
                    0, 0,
                    this.canvas.width,
                    this.canvas.height
                );
            } catch (error) {
                console.error('[SpriteAnimationManager] Error rendering sprite:', error);
                this.renderFallback(this.currentPetConfig.type);
            }
        }

        renderFallback(petType) {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Render a simple colored shape as fallback based on pet type
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            // Set color based on pet type
            let color = '#ff6b35'; // Default orange for pumpkin
            let emoji = '🎃';
            
            if (petType === 'skeleton') {
                color = '#e0e0e0';
                emoji = '💀';
            } else if (petType === 'ghost') {
                color = '#f0f0f0';
                emoji = '👻';
            }
            
            // Draw colored circle
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw emoji
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '48px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(emoji, centerX, centerY);
        }

        playInteractionAnimation() {
            if (!this.isInteracting && this.currentPetConfig) {
                this.isInteracting = true;
                this.currentAnimation = 'interaction';
                this.currentFrameIndex = 0;
            }
        }

        showSpeechBubble(text) {
            this.speechBubbleContent.textContent = text;
            this.speechBubble.classList.remove('hidden');
        }

        hideSpeechBubble() {
            this.speechBubble.classList.add('hidden');
            this.speechBubbleContent.textContent = '';
        }

        showProcessingIndicator() {
            this.processingIndicator.classList.remove('hidden');
        }

        hideProcessingIndicator() {
            this.processingIndicator.classList.add('hidden');
        }

        destroy() {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
        }
    }

    // Initialize the sprite animation manager
    const manager = new SpriteAnimationManager();

    // Notify extension that webview is ready
    vscode.postMessage({ type: 'webviewReady' });

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
        manager.destroy();
    });
})();
