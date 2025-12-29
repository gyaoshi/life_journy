/**
 * 人生旅程游戏 - 主入口文件
 * 初始化游戏并启动主循环
 */

// 全局游戏实例
let game = null;

/**
 * 游戏主类
 */
class LifeJourneyGame {
    constructor() {
        this.canvas = null;
        this.gameEngine = null;
        this.stateManager = null;
        this.eventSystem = null;
        this.inputHandler = null;
        this.audioManager = null;
        this.scoreSystem = null;
        this.difficultyManager = null;
        this.gameState = null;
        
        this.isInitialized = false;
        this.isStarted = false;
        
        console.log('LifeJourneyGame created');
    }
    
    /**
     * 初始化游戏
     */
    async initialize() {
        try {
            // 获取Canvas元素
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            
            // 创建核心组件
            this.audioManager = new AudioManager();
            this.gameState = new GameState();
            this.stateManager = new StateManager();
            this.difficultyManager = new DifficultyManager(this.stateManager, null); // EventSystem will be set later
            this.eventSystem = new EventSystem(this.stateManager, this.difficultyManager);
            this.inputHandler = new InputHandler(this.canvas);
            this.scoreSystem = new ScoreSystem();
            this.gameEngine = new GameEngine(this.canvas, this.audioManager);
            
            // Set EventSystem reference in DifficultyManager
            this.difficultyManager.eventSystem = this.eventSystem;
            
            // 初始化游戏引擎
            this.gameEngine.initialize(
                this.stateManager,
                this.eventSystem,
                this.inputHandler,
                this.scoreSystem,
                this.difficultyManager
            );
            
            // 设置输入事件回调
            this.setupInputCallbacks();
            
            // 设置游戏事件监听
            this.setupGameEventListeners();
            
            this.isInitialized = true;
            console.log('Game initialized successfully');
            
            // 隐藏加载文本
            const loadingText = document.getElementById('loadingText');
            if (loadingText) {
                loadingText.style.display = 'none';
            }
            
            // 显示开始提示
            this.showStartPrompt();
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('游戏初始化失败: ' + error.message);
        }
    }
    
    /**
     * 设置输入回调
     */
    setupInputCallbacks() {
        // 点击事件回调
        this.inputHandler.setClickCallback((inputEvent) => {
            if (this.gameEngine && this.isStarted) {
                this.gameEngine.handleInput(inputEvent);
            } else if (!this.isStarted) {
                // 点击开始游戏
                this.startGame();
            }
        });
        
        // 拖拽事件回调
        this.inputHandler.setDragCallback((inputEvent) => {
            if (this.gameEngine && this.isStarted) {
                this.gameEngine.handleInput(inputEvent);
            }
        });
        
        // 触摸事件回调
        this.inputHandler.setTouchCallback((inputEvent) => {
            // 恢复音频上下文(需要用户交互)
            if (this.audioManager) {
                this.audioManager.resumeAudioContext();
            }
        });
    }
    
    /**
     * 设置游戏事件监听
     */
    setupGameEventListeners() {
        // 监听事件完成
        const originalCompleteEvent = this.eventSystem.completeEvent.bind(this.eventSystem);
        this.eventSystem.completeEvent = (eventId) => {
            const event = this.eventSystem.activeEvents.find(e => e.id === eventId);
            if (event) {
                // 添加到分数系统
                this.scoreSystem.addCompletedEvent(event);
                
                // 播放成功音效
                if (this.audioManager) {
                    this.audioManager.playSoundEffect('success');
                }
                
                // 更新游戏状态
                this.gameState.completeEvent(event);
            }
            
            // 调用原始方法
            originalCompleteEvent(eventId);
        };
        
        // 监听游戏结束
        const originalEndGame = this.stateManager.endGame.bind(this.stateManager);
        this.stateManager.endGame = () => {
            originalEndGame();
            this.onGameEnd();
        };
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        if (!this.isInitialized || this.isStarted) {
            console.log('Cannot start game:', { initialized: this.isInitialized, started: this.isStarted });
            return;
        }
        
        try {
            console.log('Starting game...');
            
            // 重置所有组件
            this.stateManager.resetGame();
            this.eventSystem.reset();
            this.scoreSystem.reset();
            this.difficultyManager.reset();
            this.gameState.reset();
            
            // 启动游戏
            this.stateManager.startGame();
            this.gameState.startNewGame();
            this.gameEngine.start();
            
            // 播放背景音乐
            if (this.audioManager) {
                this.audioManager.playBackgroundMusic();
            }
            
            this.isStarted = true;
            console.log('Game started successfully');
            console.log('Current stage:', this.stateManager.getCurrentStage());
            console.log('Game active:', this.stateManager.isGameActive());
            
        } catch (error) {
            console.error('Failed to start game:', error);
            this.showError('游戏启动失败: ' + error.message);
        }
    }
    
    /**
     * 游戏结束处理
     */
    onGameEnd() {
        this.isStarted = false;
        
        // 停止背景音乐
        if (this.audioManager) {
            this.audioManager.stopBackgroundMusic();
        }
        
        // 计算最终评价
        const finalEvaluation = this.scoreSystem.calculateFinalEvaluation();
        
        // 显示游戏结果
        this.showGameResult(finalEvaluation);
        
        console.log('Game ended', finalEvaluation);
    }
    
    /**
     * 显示开始提示
     */
    showStartPrompt() {
        const ctx = this.canvas.getContext('2d');
        const scale = this.gameEngine.responsiveManager ? this.gameEngine.responsiveManager.getScale() : 1;
        const scaledSize = this.gameEngine.responsiveManager ? this.gameEngine.responsiveManager.getScaledSize() : 
            { width: this.canvas.width, height: this.canvas.height };
        
        // 清空画布
        ctx.clearRect(0, 0, scaledSize.width, scaledSize.height);
        
        // 背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, scaledSize.width, scaledSize.height);
        
        // 标题
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${32 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('人生旅程游戏', scaledSize.width / 2, scaledSize.height / 2 - 60 * scale);
        
        // 副标题
        ctx.font = `${18 * scale}px Arial`;
        ctx.fillStyle = '#cccccc';
        ctx.fillText('100秒体验完整人生', scaledSize.width / 2, scaledSize.height / 2 - 20 * scale);
        
        // 开始提示
        ctx.font = `${24 * scale}px Arial`;
        ctx.fillStyle = '#4ecdc4';
        ctx.fillText('点击屏幕开始游戏', scaledSize.width / 2, scaledSize.height / 2 + 40 * scale);
        
        // 说明文字
        ctx.font = `${14 * scale}px Arial`;
        ctx.fillStyle = '#999999';
        ctx.fillText('通过快速反应完成人生事件', scaledSize.width / 2, scaledSize.height / 2 + 80 * scale);
        ctx.fillText('思考什么才是人生中真正重要的', scaledSize.width / 2, scaledSize.height / 2 + 100 * scale);
        
        // 添加调试信息
        ctx.font = `${12 * scale}px Arial`;
        ctx.fillStyle = '#666666';
        ctx.fillText(`游戏状态: ${this.isInitialized ? '已初始化' : '未初始化'} | ${this.isStarted ? '已开始' : '未开始'}`, scaledSize.width / 2, scaledSize.height - 40 * scale);
        
        // 显示一个示例小人让用户知道游戏正常工作
        if (this.gameEngine && this.gameEngine.pixelRenderer) {
            ctx.fillStyle = '#ffffff';
            ctx.font = `${12 * scale}px Arial`;
            ctx.fillText('预览小人:', scaledSize.width / 2, scaledSize.height / 2 + 140 * scale);
            
            // 渲染一个示例小人
            this.gameEngine.pixelRenderer.renderCharacter(
                'adult', 
                'idle', 
                0, 
                scaledSize.width / 2 - 30 * scale, 
                scaledSize.height / 2 + 180 * scale, 
                scale
            );
        }
    }
    
    /**
     * 显示游戏结果
     */
    showGameResult(evaluation) {
        const ctx = this.canvas.getContext('2d');
        const scale = this.gameEngine.responsiveManager ? this.gameEngine.responsiveManager.getScale() : 1;
        const scaledSize = this.gameEngine.responsiveManager ? this.gameEngine.responsiveManager.getScaledSize() : 
            { width: this.canvas.width, height: this.canvas.height };
        
        // 清空画布
        ctx.clearRect(0, 0, scaledSize.width, scaledSize.height);
        
        // 背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, scaledSize.width, scaledSize.height);
        
        // 结果标题
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${28 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('人生旅程结束', scaledSize.width / 2, 80 * scale);
        
        // 评价等级
        ctx.font = `bold ${36 * scale}px Arial`;
        ctx.fillStyle = this.getEvaluationColor(evaluation.title);
        ctx.fillText(evaluation.title, scaledSize.width / 2, 140 * scale);
        
        // 评价描述
        ctx.font = `${18 * scale}px Arial`;
        ctx.fillStyle = '#cccccc';
        ctx.fillText(evaluation.description, scaledSize.width / 2, 180 * scale);
        
        // 分数信息
        ctx.font = `${20 * scale}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`完成度: ${evaluation.percentage}%`, scaledSize.width / 2, 220 * scale);
        ctx.fillText(`总分数: ${evaluation.totalScore}`, scaledSize.width / 2, 250 * scale);
        ctx.fillText(`完成事件: ${evaluation.completedEvents}/${evaluation.totalPossibleEvents}`, scaledSize.width / 2, 280 * scale);
        
        // 重新开始提示
        ctx.font = `${16 * scale}px Arial`;
        ctx.fillStyle = '#4ecdc4';
        ctx.fillText('点击屏幕重新开始', scaledSize.width / 2, 340 * scale);
        
        // 思考提示
        ctx.font = `${14 * scale}px Arial`;
        ctx.fillStyle = '#999999';
        ctx.fillText('回想一下，什么才是人生中最重要的？', scaledSize.width / 2, 380 * scale);
    }
    
    /**
     * 获取评价等级对应的颜色
     */
    getEvaluationColor(title) {
        const colors = {
            '匆忙人生': '#ff6b6b',
            '平凡人生': '#feca57',
            '充实人生': '#48dbfb',
            '完美人生': '#0be881'
        };
        
        return colors[title] || '#ffffff';
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        const ctx = this.canvas.getContext('2d');
        const scale = this.gameEngine && this.gameEngine.responsiveManager ? this.gameEngine.responsiveManager.getScale() : 1;
        const scaledSize = this.gameEngine && this.gameEngine.responsiveManager ? this.gameEngine.responsiveManager.getScaledSize() : 
            { width: this.canvas.width, height: this.canvas.height };
        
        ctx.clearRect(0, 0, scaledSize.width, scaledSize.height);
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, scaledSize.width, scaledSize.height);
        
        ctx.fillStyle = '#ff6b6b';
        ctx.font = `${20 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('错误', scaledSize.width / 2, scaledSize.height / 2 - 20 * scale);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `${16 * scale}px Arial`;
        ctx.fillText(message, scaledSize.width / 2, scaledSize.height / 2 + 20 * scale);
    }
    
    /**
     * 暂停游戏
     */
    pauseGame() {
        if (this.gameEngine && this.isStarted) {
            this.gameEngine.pause();
        }
    }
    
    /**
     * 恢复游戏
     */
    resumeGame() {
        if (this.gameEngine && this.isStarted) {
            this.gameEngine.resume();
        }
    }
    
    /**
     * 停止游戏
     */
    stopGame() {
        if (this.gameEngine) {
            this.gameEngine.cleanup();
        }
        
        if (this.audioManager) {
            this.audioManager.stopBackgroundMusic();
        }
        
        this.isStarted = false;
    }
}

/**
 * 页面加载完成后初始化游戏
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing game...');
    
    try {
        game = new LifeJourneyGame();
        await game.initialize();
    } catch (error) {
        console.error('Failed to create game:', error);
    }
});

/**
 * 页面可见性变化处理
 */
document.addEventListener('visibilitychange', () => {
    if (game) {
        if (document.hidden) {
            game.pauseGame();
        } else {
            game.resumeGame();
        }
    }
});

/**
 * 页面卸载前清理
 */
window.addEventListener('beforeunload', () => {
    if (game) {
        game.stopGame();
    }
});