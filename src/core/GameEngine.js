/**
 * GameEngine - 主游戏循环和渲染管理
 * 负责游戏的核心循环、渲染管道和基础生命周期管理
 * 集成性能监控和错误处理
 */
class GameEngine {
    constructor(canvas, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        this.isRunning = false;
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // 游戏组件
        this.stateManager = null;
        this.eventSystem = null;
        this.inputHandler = null;
        this.scoreSystem = null;
        this.responsiveManager = null;
        this.difficultyManager = null;
        
        // 性能和错误管理
        this.performanceManager = null;
        this.errorHandler = null;
        
        // 性能优化设置
        this.optimizationConfig = {
            maxParticles: 50,
            enableShadows: true,
            enableBlur: true,
            renderScale: 1.0,
            maxActiveEvents: 4
        };
        
        // 绑定方法上下文
        this.gameLoop = this.gameLoop.bind(this);
        
        // 初始化性能和错误管理
        this.initializeManagers();
    }
    
    /**
     * 初始化管理器
     */
    initializeManagers() {
        try {
            // 初始化性能管理器
            if (typeof PerformanceManager !== 'undefined') {
                this.performanceManager = new PerformanceManager();
                
                // 监听优化级别变更
                document.addEventListener('optimizationLevelChanged', (e) => {
                    this.updateOptimizationConfig(e.detail.level);
                });
            }
            
            // 初始化错误处理器
            if (typeof ErrorHandler !== 'undefined') {
                this.errorHandler = new ErrorHandler();
                
                // 监听恢复模式
                document.addEventListener('recoveryModeEntered', () => {
                    this.enterSafeMode();
                });
                
                document.addEventListener('recoveryModeExited', () => {
                    this.exitSafeMode();
                });
            }
        } catch (error) {
            console.error('Failed to initialize managers:', error);
        }
    }
    
    /**
     * 初始化游戏引擎和所有组件
     */
    initialize(stateManager, eventSystem, inputHandler, scoreSystem, difficultyManager) {
        try {
            this.stateManager = stateManager;
            this.eventSystem = eventSystem;
            this.inputHandler = inputHandler;
            this.scoreSystem = scoreSystem;
            this.difficultyManager = difficultyManager;
            
            // 初始化响应式管理器
            this.responsiveManager = new ResponsiveManager(this.canvas);
            
            // 初始化完成
            console.log('GameEngine initialized successfully');
            
            // 初始化像素艺术渲染器
            if (typeof PixelArtRenderer !== 'undefined') {
                this.pixelRenderer = new PixelArtRenderer(this.canvas);
            }
            
            // 设置事件监听器
            this.setupEventListeners();
            
            console.log('GameEngine initialized with enhanced graphics');
        } catch (error) {
            if (this.errorHandler) {
                this.errorHandler.handleError(this.errorHandler.errorTypes.STATE_ERROR, error, {
                    component: 'GameEngine',
                    method: 'initialize'
                });
            } else {
                console.error('GameEngine initialization failed:', error);
            }
        }
    }
    
    /**
     * 更新优化配置
     */
    updateOptimizationConfig(level) {
        if (this.performanceManager) {
            this.optimizationConfig = this.performanceManager.getOptimizationConfig();
            
            // 应用优化设置到各个组件
            if (this.eventSystem && this.optimizationConfig.maxActiveEvents) {
                this.eventSystem.maxActiveEvents = this.optimizationConfig.maxActiveEvents;
            }
            
            // 优化配置已应用
            console.log('Performance optimization applied');
            
            console.log(`Applied optimization config for level: ${level}`, this.optimizationConfig);
        }
    }
    
    /**
     * 进入安全模式
     */
    enterSafeMode() {
        console.warn('Entering safe mode due to critical errors');
        
        // 禁用高级功能
        console.log('Advanced features disabled for performance');
        
        if (this.pixelRenderer) {
            this.pixelRenderer.setSimpleMode(true);
        }
        
        // 降低目标帧率
        this.targetFPS = 30;
        this.frameInterval = 1000 / this.targetFPS;
        
        // 减少事件数量
        if (this.eventSystem) {
            this.eventSystem.maxActiveEvents = 1;
        }
    }
    
    /**
     * 退出安全模式
     */
    exitSafeMode() {
        console.log('Exiting safe mode');
        
        // 恢复正常设置
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        console.log('Performance mode enabled');
        
        if (this.pixelRenderer) {
            this.pixelRenderer.setSimpleMode(false);
        }
        
        // 恢复优化配置
        this.updateOptimizationConfig(this.performanceManager?.optimizationLevel || 'medium');
    }
    
    /**
     * 开始游戏循环
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        
        console.log('Game started');
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * 暂停游戏
     */
    pause() {
        this.isPaused = true;
        console.log('Game paused');
    }
    
    /**
     * 恢复游戏
     */
    resume() {
        if (!this.isRunning) return;
        
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        console.log('Game resumed');
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * 停止游戏
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        console.log('Game stopped');
    }
    
    /**
     * 清理资源
     */
    cleanup() {
        this.stop();
        
        if (this.responsiveManager) {
            this.responsiveManager.destroy();
            this.responsiveManager = null;
        }
        
        console.log('GameEngine cleanup completed');
        
        if (this.pixelRenderer) {
            this.pixelRenderer.reset();
            this.pixelRenderer = null;
        }
        
        console.log('GameEngine cleaned up');
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听事件完成
        document.addEventListener('eventCompleted', (e) => {
            console.log('Event completed:', e.detail.event.name);
        });
        
        // 监听事件失败
        document.addEventListener('eventFailed', (e) => {
            console.log('Event failed:', e.detail.event.name);
        });
        
        // 监听阶段转换
        if (this.stateManager) {
            const originalTransition = this.stateManager.transitionToStage?.bind(this.stateManager);
            if (originalTransition) {
                this.stateManager.transitionToStage = (newStage) => {
                    const oldStage = this.stateManager.getCurrentStage();
                    const result = originalTransition(newStage);
                    
                    console.log('Stage transition:', oldStage?.id, '->', newStage?.id);
                    
                    return result;
                };
            }
        }
    }
    
    /**
     * 主游戏循环
     */
    gameLoop(currentTime) {
        if (!this.isRunning || this.isPaused) return;
        
        const deltaTime = currentTime - this.lastFrameTime;
        
        // 控制帧率
        if (deltaTime >= this.frameInterval) {
            // 使用性能管理器测量更新和渲染时间
            if (this.performanceManager) {
                this.performanceManager.measureUpdateTime(() => {
                    this.update(deltaTime);
                });
                
                this.performanceManager.measureRenderTime(() => {
                    this.render();
                });
                
                this.performanceManager.update(deltaTime);
            } else {
                this.update(deltaTime);
                this.render();
            }
            
            this.lastFrameTime = currentTime;
        }
        
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * 更新游戏状态
     */
    update(deltaTime) {
        try {
            if (this.stateManager) {
                this.stateManager.update(deltaTime);
            }
            
            if (this.eventSystem) {
                this.eventSystem.update(deltaTime);
            }
            
            if (this.scoreSystem) {
                this.scoreSystem.update(deltaTime);
            }
            
            if (this.difficultyManager) {
                // DifficultyManager doesn't need regular updates, it responds to events
            }
            
            // 更新游戏逻辑
            this.updateGameLogic(deltaTime);
        } catch (error) {
            if (this.errorHandler) {
                this.errorHandler.handleError(this.errorHandler.errorTypes.STATE_ERROR, error, {
                    component: 'GameEngine',
                    method: 'update',
                    deltaTime: deltaTime
                });
            } else {
                console.error('Update error:', error);
            }
        }
    }
    
    /**
     * 渲染游戏画面
     */
    render() {
        try {
            // 获取缩放信息
            const scale = this.responsiveManager ? this.responsiveManager.getScale() : 1;
            const scaledSize = this.responsiveManager ? this.responsiveManager.getScaledSize() : 
                { width: this.canvas.width, height: this.canvas.height };
            
            // 应用渲染缩放优化
            const renderScale = this.optimizationConfig.renderScale || 1.0;
            if (renderScale !== 1.0) {
                this.ctx.save();
                this.ctx.scale(renderScale, renderScale);
            }
            
            // 清空画布
            this.ctx.clearRect(0, 0, scaledSize.width / renderScale, scaledSize.height / renderScale);
            
            // 渲染背景
            if (this.pixelRenderer && this.stateManager) {
                const currentStage = this.stateManager.getCurrentStage();
                if (currentStage) {
                    this.pixelRenderer.renderBackground(currentStage.id, scale * renderScale);
                }
            } else {
                // 回退到基础背景
                this.ctx.fillStyle = '#1a1a2e';
                this.ctx.fillRect(0, 0, scaledSize.width / renderScale, scaledSize.height / renderScale);
            }
            
            // 渲染游戏组件
            if (this.stateManager) {
                this.renderGameState(scale * renderScale, scaledSize);
            }
            
            if (this.eventSystem) {
                this.renderEvents(scale * renderScale, scaledSize);
            }
            
            if (this.scoreSystem) {
                this.renderUI(scale * renderScale, scaledSize);
            }
            
            // 渲染完成
            this.renderComplete = true;
            
            // 渲染性能信息（调试模式）
            if (this.performanceManager && window.DEBUG_MODE) {
                this.renderPerformanceInfo(scale * renderScale);
            }
            
            // 恢复渲染缩放
            if (renderScale !== 1.0) {
                this.ctx.restore();
            }
        } catch (error) {
            if (this.errorHandler) {
                this.errorHandler.handleError(this.errorHandler.errorTypes.RENDER_ERROR, error, {
                    component: 'GameEngine',
                    method: 'render'
                });
            } else {
                console.error('Render error:', error);
                // 尝试基础渲染
                this.renderFallback();
            }
        }
    }
    
    /**
     * 渲染性能信息
     */
    renderPerformanceInfo(scale) {
        if (!this.performanceManager) return;
        
        const fps = this.performanceManager.getCurrentFPS();
        const stats = this.performanceManager.performanceStats;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10 * scale, 10 * scale, 200 * scale, 100 * scale);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `${12 * scale}px monospace`;
        this.ctx.fillText(`FPS: ${fps}`, 15 * scale, 30 * scale);
        this.ctx.fillText(`Avg: ${stats.averageFPS.toFixed(1)}`, 15 * scale, 45 * scale);
        this.ctx.fillText(`Render: ${stats.renderTime.toFixed(2)}ms`, 15 * scale, 60 * scale);
        this.ctx.fillText(`Update: ${stats.updateTime.toFixed(2)}ms`, 15 * scale, 75 * scale);
        
        if (stats.memoryUsage) {
            this.ctx.fillText(`Memory: ${stats.memoryUsage.used}MB`, 15 * scale, 90 * scale);
        }
    }
    
    /**
     * 回退渲染
     */
    renderFallback() {
        try {
            this.ctx.fillStyle = '#1a1a2e';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏运行中...', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText('(安全模式)', this.canvas.width / 2, this.canvas.height / 2 + 30);
        } catch (fallbackError) {
            console.error('Fallback render also failed:', fallbackError);
        }
    }
    
    /**
     * 渲染游戏状态
     */
    renderGameState(scale = 1, scaledSize = { width: this.canvas.width, height: this.canvas.height }) {
        const currentStage = this.stateManager.getCurrentStage();
        const progress = this.stateManager.getStageProgress();
        
        // 渲染当前人生阶段背景
        this.ctx.fillStyle = this.getStageColor(currentStage);
        this.ctx.fillRect(0, 0, scaledSize.width, scaledSize.height * 0.7);
        
        // 渲染人生阶段文字
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `${24 * scale}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            currentStage ? currentStage.name : '准备开始',
            scaledSize.width / 2,
            50 * scale
        );
        
        // 渲染角色（小人）
        if (this.pixelRenderer && currentStage) {
            // 计算角色位置（屏幕中央偏下）
            const characterX = scaledSize.width / 2 - 50 * scale;
            const characterY = scaledSize.height / 2;
            
            // 根据游戏状态选择动画
            let animation = 'idle';
            if (this.stateManager.isGameActive()) {
                // 如果有活跃事件，显示兴奋状态
                const activeEvents = this.eventSystem ? this.eventSystem.getActiveEvents() : [];
                if (activeEvents.length > 0) {
                    animation = currentStage.id === 'teen' ? 'excited' : 
                               currentStage.id === 'adult' ? 'working' : 
                               currentStage.id === 'elder' ? 'peaceful' : 'happy';
                } else {
                    animation = currentStage.id === 'child' ? 'walking' : 'idle';
                }
            }
            
            // 渲染角色
            this.pixelRenderer.renderCharacter(
                currentStage.id, 
                animation, 
                Math.floor(Date.now() / 500) % 2, // 简单的帧动画
                characterX, 
                characterY, 
                scale
            );
            
            // 渲染场景元素
            if (currentStage.id === 'baby') {
                this.pixelRenderer.renderSceneElement('baby', 'crib', characterX + 100 * scale, characterY - 50 * scale, scale * 0.8);
            } else if (currentStage.id === 'child') {
                this.pixelRenderer.renderSceneElement('child', 'playground', characterX - 100 * scale, characterY - 30 * scale, scale * 0.6);
            } else if (currentStage.id === 'teen') {
                this.pixelRenderer.renderSceneElement('teen', 'classroom', characterX + 80 * scale, characterY - 40 * scale, scale * 0.7);
            } else if (currentStage.id === 'adult') {
                this.pixelRenderer.renderSceneElement('adult', 'office', characterX - 80 * scale, characterY - 60 * scale, scale * 0.5);
                this.pixelRenderer.renderSceneElement('adult', 'house', characterX + 120 * scale, characterY - 20 * scale, scale * 0.6);
            } else if (currentStage.id === 'elder') {
                this.pixelRenderer.renderSceneElement('elder', 'garden', characterX - 60 * scale, characterY + 20 * scale, scale * 0.8);
                this.pixelRenderer.renderSceneElement('elder', 'rocking_chair', characterX + 80 * scale, characterY - 10 * scale, scale * 0.7);
            }
        }
        
        // 渲染进度条
        this.renderProgressBar(progress, scale, scaledSize);
    }
    
    /**
     * 渲染事件
     */
    renderEvents(scale = 1, scaledSize = { width: this.canvas.width, height: this.canvas.height }) {
        const activeEvents = this.eventSystem.getActiveEvents();
        
        activeEvents.forEach(event => {
            this.renderEvent(event, scale, scaledSize);
        });
    }
    
    /**
     * 渲染单个事件
     */
    renderEvent(event, scale = 1, scaledSize = { width: this.canvas.width, height: this.canvas.height }) {
        const x = event.position.x * scale;
        const y = event.position.y * scale;
        
        // 使用像素艺术渲染器渲染事件
        if (this.pixelRenderer) {
            this.pixelRenderer.renderEventIcon(event, x, y, scale);
        } else {
            // 回退到基础渲染
            const width = (event.target?.size?.width || 100) * scale;
            const height = (event.target?.size?.height || 50) * scale;
            
            // 渲染事件背景
            this.ctx.fillStyle = event.color || '#ff6b6b';
            this.ctx.fillRect(x - width/2, y - height/2, width, height);
            
            // 渲染事件图标
            if (event.icon) {
                this.ctx.font = `${24 * scale}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(event.icon, x, y - 10 * scale);
            }
            
            // 渲染事件文字
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = `${12 * scale}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(event.name, x, y + 10 * scale);
        }
        
        // 渲染进度指示器
        if (event.getProgress && typeof event.getProgress === 'function') {
            const progress = event.getProgress();
            if (progress > 0 && progress < 1) {
                this.renderEventProgress(event, x, y, progress, scale);
            }
        }
        
        // 渲染时间指示器
        const timeRatio = event.getTimeRemainingRatio ? event.getTimeRemainingRatio() : 1;
        if (timeRatio < 0.3) {
            this.renderUrgencyIndicator(event, x, y, timeRatio, scale);
        }
    }
    
    /**
     * 渲染UI界面
     */
    renderUI(scale = 1, scaledSize = { width: this.canvas.width, height: this.canvas.height }) {
        const score = this.scoreSystem.getTotalScore();
        const timeLeft = this.stateManager.getTimeLeft();
        
        // 渲染分数
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `${20 * scale}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`分数: ${score}`, 20 * scale, 30 * scale);
        
        // 渲染剩余时间
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`时间: ${Math.ceil(timeLeft)}s`, scaledSize.width - 20 * scale, 30 * scale);
    }
    
    /**
     * 渲染进度条
     */
    renderProgressBar(progress, scale = 1, scaledSize = { width: this.canvas.width, height: this.canvas.height }) {
        const barWidth = scaledSize.width * 0.8;
        const barHeight = 10 * scale;
        const x = (scaledSize.width - barWidth) / 2;
        const y = scaledSize.height - 50 * scale;
        
        if (this.pixelRenderer) {
            this.pixelRenderer.renderPixelProgressBar(x, y, barWidth, barHeight, progress, scale);
        } else {
            // 背景
            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(x, y, barWidth, barHeight);
            
            // 进度
            this.ctx.fillStyle = '#4ecdc4';
            this.ctx.fillRect(x, y, barWidth * progress, barHeight);
        }
    }
    
    /**
     * 渲染事件进度指示器
     */
    renderEventProgress(event, x, y, progress, scale) {
        const radius = 30 * scale;
        const centerX = x;
        const centerY = y + 40 * scale;
        
        // 进度圆环
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 4 * scale;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 进度填充
        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * progress);
        this.ctx.stroke();
    }
    
    /**
     * 渲染紧急指示器
     */
    renderUrgencyIndicator(event, x, y, timeRatio, scale) {
        const pulseIntensity = 1 - timeRatio;
        const alpha = 0.3 + 0.7 * Math.sin(Date.now() / 100) * pulseIntensity;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#ff4757';
        
        const size = (event.target?.size?.width || 100) * scale * (1 + pulseIntensity * 0.2);
        this.ctx.fillRect(x - size/2, y - size/2, size, size);
        
        this.ctx.restore();
    }
    
    /**
     * 获取人生阶段对应的颜色
     */
    getStageColor(stage) {
        if (!stage) return '#1a1a2e';
        
        const colors = {
            'baby': '#ffb3ba',
            'child': '#bae1ff',
            'teen': '#baffc9',
            'adult': '#ffffba',
            'elder': '#ffdfba'
        };
        
        return colors[stage.id] || '#1a1a2e';
    }
    
    /**
     * 处理输入事件
     */
    handleInput(inputEvent) {
        // 如果有响应式管理器，转换坐标
        if (this.responsiveManager && inputEvent.x !== undefined && inputEvent.y !== undefined) {
            const originalCoords = this.responsiveManager.getOriginalCoordinates(inputEvent.x, inputEvent.y);
            inputEvent.x = originalCoords.x;
            inputEvent.y = originalCoords.y;
        }
        
        if (this.eventSystem) {
            this.eventSystem.processInteraction(inputEvent);
        }
    }
}