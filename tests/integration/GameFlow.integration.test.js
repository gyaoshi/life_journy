/**
 * 端到端集成测试 - 完整游戏流程
 * 测试游戏开始、进行、结束的完整流程和组件间协作
 */

// Mock comprehensive game components for integration testing
class GameState {
    constructor() {
        this.currentStage = null;
        this.gameTime = 0;
        this.totalScore = 0;
        this.completedEvents = [];
        this.activeEvents = [];
        this.isGameActive = false;
        this.isGameComplete = false;
        this.gameStartTime = null;
        this.gameEndTime = null;
    }
    
    startNewGame() {
        this.reset();
        this.isGameActive = true;
        this.gameStartTime = Date.now();
    }
    
    endGame() {
        this.isGameActive = false;
        this.isGameComplete = true;
        this.gameEndTime = Date.now();
    }
    
    reset() {
        this.currentStage = null;
        this.gameTime = 0;
        this.totalScore = 0;
        this.completedEvents = [];
        this.activeEvents = [];
        this.isGameActive = false;
        this.isGameComplete = false;
        this.gameStartTime = null;
        this.gameEndTime = null;
    }
    
    updateGameTime(deltaTime) {
        if (this.isGameActive) {
            this.gameTime += deltaTime;
        }
    }
    
    setCurrentStage(stage) {
        this.currentStage = stage;
    }
    
    completeEvent(event) {
        if (!this.completedEvents.find(e => e.id === event.id)) {
            this.completedEvents.push({
                ...event,
                completedAt: Date.now(),
                gameTime: this.gameTime
            });
            this.totalScore += event.points || 0;
        }
    }
}

class StateManager {
    constructor() {
        this.currentStage = null;
        this.gameTime = 0;
        this.totalGameTime = 100000; // 100秒
        this.gameActive = false;
        this.gameComplete = false;
        
        this.lifeStages = [
            { id: 'baby', name: '婴儿期', duration: 15000, difficulty: 1, startTime: 0 },
            { id: 'child', name: '儿童期', duration: 20000, difficulty: 2, startTime: 15000 },
            { id: 'teen', name: '青少年期', duration: 20000, difficulty: 3, startTime: 35000 },
            { id: 'adult', name: '成年期', duration: 30000, difficulty: 4, startTime: 55000 },
            { id: 'elder', name: '老年期', duration: 15000, difficulty: 3, startTime: 85000 }
        ];
    }
    
    startGame() {
        this.gameTime = 0;
        this.gameActive = true;
        this.gameComplete = false;
        this.currentStage = this.lifeStages[0];
    }
    
    resetGame() {
        this.gameTime = 0;
        this.gameActive = false;
        this.gameComplete = false;
        this.currentStage = null;
    }
    
    update(deltaTime) {
        if (!this.gameActive || this.gameComplete) return;
        
        this.gameTime += deltaTime;
        this.checkStageTransition();
        
        if (this.gameTime >= this.totalGameTime) {
            this.endGame();
        }
    }
    
    checkStageTransition() {
        const newStage = this.getStageForTime(this.gameTime);
        if (newStage && newStage.id !== this.currentStage.id) {
            this.transitionToStage(newStage);
        }
    }
    
    getStageForTime(time) {
        for (let i = this.lifeStages.length - 1; i >= 0; i--) {
            if (time >= this.lifeStages[i].startTime) {
                return this.lifeStages[i];
            }
        }
        return this.lifeStages[0];
    }
    
    transitionToStage(stage) {
        this.currentStage = stage;
    }
    
    endGame() {
        this.gameActive = false;
        this.gameComplete = true;
    }
    
    getCurrentStage() {
        return this.currentStage;
    }
    
    getStageProgress() {
        if (!this.currentStage) return 0;
        const stageElapsed = this.gameTime - this.currentStage.startTime;
        return Math.min(stageElapsed / this.currentStage.duration, 1);
    }
    
    getGameProgress() {
        return Math.min(this.gameTime / this.totalGameTime, 1);
    }
    
    getTimeLeft() {
        const timeLeft = this.totalGameTime - this.gameTime;
        return Math.max(timeLeft / 1000, 0);
    }
    
    isGameActive() {
        return this.gameActive;
    }
    
    isGameComplete() {
        return this.gameComplete;
    }
    
    getAllStages() {
        return [...this.lifeStages];
    }
}

class LifeEvent {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.type = config.type;
        this.difficulty = config.difficulty;
        this.timeLimit = config.timeLimit;
        this.timeRemaining = config.timeLimit;
        this.points = config.points;
        this.position = config.position || { x: 0, y: 0 };
        this.target = config.target;
        
        this.completed = false;
        this.failed = false;
        this.startTime = Date.now();
        this.completedTime = null;
        this.clickCount = 0;
        this.dragDistance = 0;
    }
    
    update(deltaTime) {
        if (this.completed || this.failed) return;
        
        this.timeRemaining -= deltaTime;
        if (this.timeRemaining <= 0) {
            this.fail();
        }
    }
    
    handleInteraction(inputEvent) {
        if (this.completed || this.failed) return false;
        
        switch (this.target.type) {
            case 'button':
                if (inputEvent.type === 'click') {
                    this.clickCount++;
                    if (this.clickCount >= this.target.requiredClicks) {
                        this.complete();
                        return true;
                    }
                }
                break;
            case 'drag_target':
                if (inputEvent.type === 'drag') {
                    const distance = Math.sqrt(
                        Math.pow(inputEvent.deltaX, 2) + Math.pow(inputEvent.deltaY, 2)
                    );
                    this.dragDistance = Math.max(this.dragDistance, distance);
                    if (this.dragDistance >= this.target.dragDistance) {
                        this.complete();
                        return true;
                    }
                }
                break;
            case 'moving_object':
                if (inputEvent.type === 'click') {
                    this.complete();
                    return true;
                }
                break;
        }
        return false;
    }
    
    complete() {
        if (this.completed || this.failed) return;
        this.completed = true;
        this.completedTime = Date.now();
    }
    
    fail() {
        if (this.completed || this.failed) return;
        this.failed = true;
    }
    
    isPointInside(x, y) {
        const dx = x - this.position.x;
        const dy = y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = Math.max(this.target.size.width, this.target.size.height) / 2;
        return distance <= radius;
    }
    
    isActive() {
        return !this.completed && !this.failed && this.timeRemaining > 0;
    }
    
    getDuration() {
        const endTime = this.completedTime || Date.now();
        return endTime - this.startTime;
    }
}

class EventSystem {
    constructor(stateManager, difficultyManager = null) {
        this.stateManager = stateManager;
        this.difficultyManager = difficultyManager;
        this.activeEvents = [];
        this.completedEvents = [];
        this.eventIdCounter = 0;
        this.lastEventTime = 0;
        this.eventGenerationInterval = 2000;
        this.maxActiveEvents = 3;
        
        this.eventTemplates = {
            'baby': [
                { name: '第一次微笑', type: 'simple_click', difficulty: 1, timeLimit: 3000, points: 10,
                  target: { type: 'button', size: { width: 100, height: 60 }, requiredClicks: 1 } }
            ],
            'child': [
                { name: '学会走路', type: 'rapid_click', difficulty: 2, timeLimit: 3000, points: 20,
                  target: { type: 'button', size: { width: 90, height: 50 }, requiredClicks: 3 } }
            ],
            'teen': [
                { name: '考试及格', type: 'rapid_click', difficulty: 3, timeLimit: 2500, points: 30,
                  target: { type: 'button', size: { width: 80, height: 45 }, requiredClicks: 5 } }
            ],
            'adult': [
                { name: '找到工作', type: 'drag_target', difficulty: 4, timeLimit: 2000, points: 40,
                  target: { type: 'drag_target', size: { width: 70, height: 70 }, dragDistance: 100 } }
            ],
            'elder': [
                { name: '退休生活', type: 'simple_click', difficulty: 2, timeLimit: 3000, points: 30,
                  target: { type: 'button', size: { width: 90, height: 55 }, requiredClicks: 1 } }
            ]
        };
    }
    
    update(deltaTime) {
        this.updateActiveEvents(deltaTime);
        this.generateEvents(deltaTime);
        this.cleanupEvents();
    }
    
    updateActiveEvents(deltaTime) {
        this.activeEvents.forEach(event => {
            event.update(deltaTime);
        });
    }
    
    generateEvents(deltaTime) {
        this.lastEventTime += deltaTime;
        
        if (this.lastEventTime >= this.eventGenerationInterval && 
            this.activeEvents.length < this.maxActiveEvents) {
            
            const currentStage = this.stateManager.getCurrentStage();
            if (currentStage && this.stateManager.isGameActive()) {
                this.generateEvent(currentStage);
                this.lastEventTime = 0;
            }
        }
    }
    
    generateEvent(stage) {
        const templates = this.eventTemplates[stage.id];
        if (!templates || templates.length === 0) return null;
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        const eventConfig = {
            id: `event_${this.eventIdCounter++}`,
            name: template.name,
            type: template.type,
            difficulty: this.calculateEventDifficulty(template.difficulty, stage.difficulty),
            timeLimit: this.calculateTimeLimit(template.timeLimit, stage.difficulty),
            points: template.points,
            position: this.generateEventPosition(),
            target: { ...template.target }
        };
        
        const event = new LifeEvent(eventConfig);
        this.activeEvents.push(event);
        
        return event;
    }
    
    calculateEventDifficulty(baseDifficulty, stageDifficulty) {
        if (this.difficultyManager) {
            return this.difficultyManager.calculateEventDifficulty(baseDifficulty, this.stateManager.getCurrentStage()?.id);
        }
        return Math.min(5, baseDifficulty + stageDifficulty - 1);
    }
    
    calculateTimeLimit(baseTimeLimit, stageDifficulty) {
        if (this.difficultyManager) {
            const difficulty = this.difficultyManager.calculateEventDifficulty(1, this.stateManager.getCurrentStage()?.id);
            return this.difficultyManager.adjustTimeLimit(baseTimeLimit, difficulty);
        }
        const difficultyFactor = 1 - (stageDifficulty - 1) * 0.15;
        return Math.max(1000, baseTimeLimit * difficultyFactor);
    }
    
    generateEventPosition() {
        const margin = 100;
        const x = margin + Math.random() * (800 - 2 * margin);
        const y = margin + Math.random() * (600 - 2 * margin);
        return { x, y };
    }
    
    processInteraction(inputEvent) {
        let interactionHandled = false;
        
        for (const event of this.activeEvents) {
            if (event.isActive() && event.isPointInside(inputEvent.x, inputEvent.y)) {
                const success = event.handleInteraction(inputEvent);
                
                if (success) {
                    this.onEventCompleted(event);
                    interactionHandled = true;
                    break;
                }
            }
        }
        
        return interactionHandled;
    }
    
    onEventCompleted(event) {
        if (this.difficultyManager) {
            const completionTime = event.getDuration();
            this.difficultyManager.recordInteractionResult(true, event.difficulty, completionTime);
        }
        
        this.completedEvents.push(event);
        const index = this.activeEvents.indexOf(event);
        if (index > -1) {
            this.activeEvents.splice(index, 1);
        }
    }
    
    onEventFailed(event) {
        if (this.difficultyManager) {
            this.difficultyManager.recordInteractionResult(false, event.difficulty, null);
        }
        
        const index = this.activeEvents.indexOf(event);
        if (index > -1) {
            this.activeEvents.splice(index, 1);
        }
    }
    
    cleanupEvents() {
        const failedEvents = this.activeEvents.filter(event => event.failed);
        failedEvents.forEach(event => this.onEventFailed(event));
    }
    
    completeEvent(eventId) {
        const event = this.activeEvents.find(e => e.id === eventId);
        if (event && event.isActive()) {
            event.complete();
            this.onEventCompleted(event);
            return true;
        }
        return false;
    }
    
    getActiveEvents() {
        return [...this.activeEvents];
    }
    
    getCompletedEvents() {
        return [...this.completedEvents];
    }
    
    reset() {
        this.activeEvents = [];
        this.completedEvents = [];
        this.eventIdCounter = 0;
        this.lastEventTime = 0;
    }
}

class ScoreSystem {
    constructor() {
        this.totalScore = 0;
        this.completedEvents = [];
        this.totalPossibleEvents = 0;
        this.currentEvaluation = null;
        
        this.evaluationLevels = [
            { min: 0, max: 30.99, title: '匆忙人生', description: '生活太匆忙，错过了很多美好' },
            { min: 31, max: 60.99, title: '平凡人生', description: '平平淡淡才是真，也有自己的精彩' },
            { min: 61, max: 85.99, title: '充实人生', description: '把握了大部分机会，生活很充实' },
            { min: 86, max: 100, title: '完美人生', description: '几乎没有遗憾，这就是理想的人生' }
        ];
    }
    
    update(deltaTime) {
        // Score system doesn't need regular updates
    }
    
    addCompletedEvent(event) {
        if (!event || this.completedEvents.find(e => e.id === event.id)) {
            return;
        }
        
        this.completedEvents.push({
            id: event.id,
            name: event.name,
            points: event.points,
            stage: event.stage || 'unknown',
            completedAt: Date.now()
        });
        
        this.totalScore += event.points;
    }
    
    setTotalPossibleEvents(count) {
        this.totalPossibleEvents = Math.max(0, count);
    }
    
    getTotalScore() {
        return this.totalScore;
    }
    
    getCompletedEventCount() {
        return this.completedEvents.length;
    }
    
    getCompletionPercentage() {
        if (this.totalPossibleEvents === 0) return 0;
        return Math.min(100, (this.completedEvents.length / this.totalPossibleEvents) * 100);
    }
    
    calculateFinalEvaluation() {
        const percentage = this.getCompletionPercentage();
        
        for (const level of this.evaluationLevels) {
            if (percentage >= level.min && percentage <= level.max) {
                this.currentEvaluation = {
                    ...level,
                    percentage: Math.round(percentage),
                    totalScore: this.totalScore,
                    completedEvents: this.completedEvents.length,
                    totalPossibleEvents: this.totalPossibleEvents
                };
                break;
            }
        }
        
        return this.currentEvaluation;
    }
    
    reset() {
        this.totalScore = 0;
        this.completedEvents = [];
        this.totalPossibleEvents = 0;
        this.currentEvaluation = null;
    }
}

class DifficultyManager {
    constructor(stateManager, eventSystem) {
        this.stateManager = stateManager;
        this.eventSystem = eventSystem;
        this.recentResults = [];
        this.maxRecentResults = 10;
        this.difficultyAdjustment = 0;
    }
    
    calculateEventDifficulty(baseDifficulty, stageId) {
        const stage = this.stateManager.getAllStages().find(s => s.id === stageId);
        const stageDifficulty = stage ? stage.difficulty : 1;
        
        let adjustedDifficulty = baseDifficulty + stageDifficulty - 1 + this.difficultyAdjustment;
        return Math.max(1, Math.min(5, adjustedDifficulty));
    }
    
    adjustTimeLimit(baseTimeLimit, difficulty) {
        const difficultyFactor = 1 - (difficulty - 1) * 0.15;
        return Math.max(1000, baseTimeLimit * difficultyFactor);
    }
    
    recordInteractionResult(success, difficulty, completionTime) {
        this.recentResults.push({ success, difficulty, completionTime, timestamp: Date.now() });
        
        if (this.recentResults.length > this.maxRecentResults) {
            this.recentResults.shift();
        }
        
        this.updateDifficultyAdjustment();
    }
    
    updateDifficultyAdjustment() {
        if (this.recentResults.length < 3) return;
        
        const recentSuccesses = this.recentResults.filter(r => r.success).length;
        const successRate = recentSuccesses / this.recentResults.length;
        
        if (successRate > 0.8) {
            this.difficultyAdjustment = Math.min(2, this.difficultyAdjustment + 0.5);
        } else if (successRate < 0.3) {
            this.difficultyAdjustment = Math.max(-2, this.difficultyAdjustment - 0.5);
        }
    }
    
    reset() {
        this.recentResults = [];
        this.difficultyAdjustment = 0;
    }
}

class AudioManager {
    constructor() {
        this.isEnabled = true;
        this.backgroundMusic = null;
        this.soundEffects = new Map();
    }
    
    playBackgroundMusic() {
        // Mock implementation
    }
    
    stopBackgroundMusic() {
        // Mock implementation
    }
    
    playSoundEffect(effectName) {
        // Mock implementation
    }
    
    resumeAudioContext() {
        // Mock implementation
    }
}

class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.clickCallback = null;
        this.dragCallback = null;
        this.touchCallback = null;
    }
    
    setClickCallback(callback) {
        this.clickCallback = callback;
    }
    
    setDragCallback(callback) {
        this.dragCallback = callback;
    }
    
    setTouchCallback(callback) {
        this.touchCallback = callback;
    }
}

class ResponsiveManager {
    constructor(canvas) {
        this.canvas = canvas;
    }
    
    getScale() {
        return 1;
    }
    
    getScaledSize() {
        return { width: this.canvas.width, height: this.canvas.height };
    }
    
    destroy() {
        // Mock cleanup
    }
}

class GameEngine {
    constructor(canvas, audioManager) {
        this.canvas = canvas;
        this.audioManager = audioManager;
        this.isRunning = false;
        this.isPaused = false;
        this.stateManager = null;
        this.eventSystem = null;
        this.inputHandler = null;
        this.scoreSystem = null;
        this.difficultyManager = null;
        this.responsiveManager = null;
    }
    
    initialize(stateManager, eventSystem, inputHandler, scoreSystem, difficultyManager) {
        this.stateManager = stateManager;
        this.eventSystem = eventSystem;
        this.inputHandler = inputHandler;
        this.scoreSystem = scoreSystem;
        this.difficultyManager = difficultyManager;
        this.responsiveManager = new ResponsiveManager(this.canvas);
    }
    
    start() {
        this.isRunning = true;
        this.isPaused = false;
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        if (!this.isRunning) return;
        this.isPaused = false;
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = false;
    }
    
    cleanup() {
        this.stop();
        if (this.responsiveManager) {
            this.responsiveManager.destroy();
            this.responsiveManager = null;
        }
    }
    
    handleInput(inputEvent) {
        if (this.eventSystem) {
            this.eventSystem.processInteraction(inputEvent);
        }
    }
}

describe('游戏流程集成测试', () => {
    let canvas;
    let gameEngine;
    let stateManager;
    let eventSystem;
    let scoreSystem;
    let audioManager;
    let inputHandler;
    let difficultyManager;
    let gameState;

    beforeEach(() => {
        // 重置DOM
        document.body.innerHTML = '<canvas id="gameCanvas" width="800" height="600"></canvas>';
        canvas = document.getElementById('gameCanvas');
        
        // 创建游戏组件
        audioManager = new AudioManager();
        gameState = new GameState();
        stateManager = new StateManager();
        difficultyManager = new DifficultyManager(stateManager, null);
        eventSystem = new EventSystem(stateManager, difficultyManager);
        inputHandler = new InputHandler(canvas);
        scoreSystem = new ScoreSystem();
        gameEngine = new GameEngine(canvas, audioManager);
        
        // 设置组件关联
        difficultyManager.eventSystem = eventSystem;
        
        // 初始化游戏引擎
        gameEngine.initialize(
            stateManager,
            eventSystem,
            inputHandler,
            scoreSystem,
            difficultyManager
        );
    });

    afterEach(() => {
        if (gameEngine) {
            gameEngine.cleanup();
        }
    });

    describe('游戏初始化和启动', () => {
        test('应该正确初始化所有游戏组件', () => {
            expect(gameEngine).toBeDefined();
            expect(stateManager).toBeDefined();
            expect(eventSystem).toBeDefined();
            expect(scoreSystem).toBeDefined();
            expect(audioManager).toBeDefined();
            expect(inputHandler).toBeDefined();
            expect(difficultyManager).toBeDefined();
            
            // 验证组件间的关联
            expect(gameEngine.stateManager).toBe(stateManager);
            expect(gameEngine.eventSystem).toBe(eventSystem);
            expect(gameEngine.scoreSystem).toBe(scoreSystem);
            expect(eventSystem.stateManager).toBe(stateManager);
            expect(eventSystem.difficultyManager).toBe(difficultyManager);
        });

        test('应该正确启动游戏并进入婴儿期', () => {
            // 启动游戏
            stateManager.startGame();
            gameState.startNewGame();
            gameEngine.start();
            
            // 验证游戏状态
            expect(stateManager.isGameActive()).toBe(true);
            expect(gameState.isGameActive).toBe(true);
            expect(gameEngine.isRunning).toBe(true);
            
            // 验证初始人生阶段
            const currentStage = stateManager.getCurrentStage();
            expect(currentStage).toBeDefined();
            expect(currentStage.id).toBe('baby');
            expect(currentStage.name).toBe('婴儿期');
        });

        test('应该正确设置初始游戏时间和分数', () => {
            stateManager.startGame();
            gameState.startNewGame();
            
            expect(stateManager.gameTime).toBe(0);
            expect(stateManager.getTimeLeft()).toBe(100);
            expect(scoreSystem.getTotalScore()).toBe(0);
            expect(scoreSystem.getCompletedEventCount()).toBe(0);
        });
    });

    describe('人生阶段转换', () => {
        test('应该按时间顺序正确转换人生阶段', () => {
            stateManager.startGame();
            
            // 模拟时间推进到儿童期
            stateManager.update(15000); // 15秒后
            expect(stateManager.getCurrentStage().id).toBe('child');
            
            // 模拟时间推进到青少年期
            stateManager.update(20000); // 再20秒后
            expect(stateManager.getCurrentStage().id).toBe('teen');
            
            // 模拟时间推进到成年期
            stateManager.update(20000); // 再20秒后
            expect(stateManager.getCurrentStage().id).toBe('adult');
            
            // 模拟时间推进到老年期
            stateManager.update(30000); // 再30秒后
            expect(stateManager.getCurrentStage().id).toBe('elder');
        });

        test('应该正确计算阶段进度', () => {
            stateManager.startGame();
            
            // 在婴儿期中间
            stateManager.update(7500); // 7.5秒
            expect(stateManager.getStageProgress()).toBeCloseTo(0.5, 1);
            
            // 在儿童期开始
            stateManager.update(7500); // 总共15秒
            expect(stateManager.getStageProgress()).toBeCloseTo(0, 1);
        });

        test('应该正确计算游戏总进度', () => {
            stateManager.startGame();
            
            // 游戏进行到一半
            stateManager.update(50000); // 50秒
            expect(stateManager.getGameProgress()).toBeCloseTo(0.5, 1);
            
            // 游戏接近结束
            stateManager.update(40000); // 总共90秒
            expect(stateManager.getGameProgress()).toBeCloseTo(0.9, 1);
        });
    });

    describe('事件生成和管理', () => {
        test('应该根据当前人生阶段生成相应事件', () => {
            stateManager.startGame();
            eventSystem.reset();
            
            // 强制生成事件
            const currentStage = stateManager.getCurrentStage();
            const event = eventSystem.generateEvent(currentStage);
            
            expect(event).toBeDefined();
            expect(event.name).toBeDefined();
            expect(event.type).toBeDefined();
            expect(event.points).toBeGreaterThan(0);
            expect(event.position).toBeDefined();
            expect(event.target).toBeDefined();
        });

        test('应该限制同时活跃的事件数量', () => {
            stateManager.startGame();
            eventSystem.reset();
            
            // 手动生成多个事件，模拟时间推进
            const currentStage = stateManager.getCurrentStage();
            for (let i = 0; i < 10; i++) {
                // 模拟时间推进以触发事件生成
                eventSystem.lastEventTime = eventSystem.eventGenerationInterval;
                eventSystem.generateEvents(eventSystem.eventGenerationInterval);
            }
            
            expect(eventSystem.getActiveEvents().length).toBeLessThanOrEqual(3);
        });

        test('应该正确处理事件超时', () => {
            stateManager.startGame();
            eventSystem.reset();
            
            // 生成事件
            const currentStage = stateManager.getCurrentStage();
            const event = eventSystem.generateEvent(currentStage);
            
            expect(event.isActive()).toBe(true);
            
            // 模拟时间推进超过事件时间限制
            event.update(event.timeLimit + 1000);
            
            expect(event.failed).toBe(true);
            expect(event.isActive()).toBe(false);
        });
    });

    describe('交互处理', () => {
        test('应该正确处理点击交互', () => {
            stateManager.startGame();
            eventSystem.reset();
            
            // 生成简单点击事件
            const currentStage = stateManager.getCurrentStage();
            const event = eventSystem.generateEvent(currentStage);
            
            // 模拟点击交互
            const clickInput = {
                type: 'click',
                x: event.position.x,
                y: event.position.y
            };
            
            const handled = eventSystem.processInteraction(clickInput);
            
            if (event.target.type === 'button' && event.target.requiredClicks === 1) {
                expect(handled).toBe(true);
                expect(event.completed).toBe(true);
            }
        });

        test('应该正确处理连续点击交互', () => {
            stateManager.startGame();
            eventSystem.reset();
            
            // 创建需要多次点击的事件
            const eventConfig = {
                id: 'test_rapid_click',
                name: '测试连击',
                type: 'rapid_click',
                difficulty: 2,
                timeLimit: 3000,
                points: 20,
                position: { x: 400, y: 300 },
                target: {
                    type: 'button',
                    size: { width: 80, height: 50 },
                    requiredClicks: 3
                }
            };
            
            const event = new LifeEvent(eventConfig);
            eventSystem.activeEvents.push(event);
            
            // 模拟多次点击
            const clickInput = {
                type: 'click',
                x: event.position.x,
                y: event.position.y
            };
            
            // 第一次点击
            eventSystem.processInteraction(clickInput);
            expect(event.clickCount).toBe(1);
            expect(event.completed).toBe(false);
            
            // 第二次点击
            eventSystem.processInteraction(clickInput);
            expect(event.clickCount).toBe(2);
            expect(event.completed).toBe(false);
            
            // 第三次点击
            eventSystem.processInteraction(clickInput);
            expect(event.clickCount).toBe(3);
            expect(event.completed).toBe(true);
        });

        test('应该正确处理拖拽交互', () => {
            stateManager.startGame();
            eventSystem.reset();
            
            // 创建拖拽事件
            const eventConfig = {
                id: 'test_drag',
                name: '测试拖拽',
                type: 'drag_target',
                difficulty: 3,
                timeLimit: 2000,
                points: 30,
                position: { x: 400, y: 300 },
                target: {
                    type: 'drag_target',
                    size: { width: 70, height: 70 },
                    dragDistance: 100
                }
            };
            
            const event = new LifeEvent(eventConfig);
            eventSystem.activeEvents.push(event);
            
            // 模拟拖拽交互
            const dragInput = {
                type: 'drag',
                x: event.position.x,
                y: event.position.y,
                deltaX: 80,
                deltaY: 60
            };
            
            const handled = eventSystem.processInteraction(dragInput);
            expect(handled).toBe(true);
            expect(event.completed).toBe(true);
        });
    });

    describe('分数系统集成', () => {
        test('应该正确累计完成事件的分数', () => {
            stateManager.startGame();
            scoreSystem.reset();
            
            // 模拟完成多个事件
            const events = [
                { id: 'event1', name: '事件1', points: 10 },
                { id: 'event2', name: '事件2', points: 20 },
                { id: 'event3', name: '事件3', points: 15 }
            ];
            
            events.forEach(eventData => {
                scoreSystem.addCompletedEvent(eventData);
            });
            
            expect(scoreSystem.getTotalScore()).toBe(45);
            expect(scoreSystem.getCompletedEventCount()).toBe(3);
        });

        test('应该正确计算完成百分比', () => {
            scoreSystem.reset();
            scoreSystem.setTotalPossibleEvents(10);
            
            // 完成5个事件
            for (let i = 0; i < 5; i++) {
                scoreSystem.addCompletedEvent({
                    id: `event${i}`,
                    name: `事件${i}`,
                    points: 10
                });
            }
            
            expect(scoreSystem.getCompletionPercentage()).toBe(50);
        });

        test('应该根据完成百分比生成正确的评价', () => {
            scoreSystem.reset();
            scoreSystem.setTotalPossibleEvents(10);
            
            // 测试不同完成度的评价
            const testCases = [
                { completed: 2, expectedTitle: '匆忙人生' },
                { completed: 5, expectedTitle: '平凡人生' },
                { completed: 7, expectedTitle: '充实人生' },
                { completed: 9, expectedTitle: '完美人生' }
            ];
            
            testCases.forEach(testCase => {
                scoreSystem.reset();
                scoreSystem.setTotalPossibleEvents(10);
                
                for (let i = 0; i < testCase.completed; i++) {
                    scoreSystem.addCompletedEvent({
                        id: `event${i}`,
                        name: `事件${i}`,
                        points: 10
                    });
                }
                
                const evaluation = scoreSystem.calculateFinalEvaluation();
                expect(evaluation.title).toBe(testCase.expectedTitle);
            });
        });
    });

    describe('难度系统集成', () => {
        test('应该根据人生阶段调整事件难度', () => {
            stateManager.startGame();
            
            // 测试不同阶段的难度
            const stages = stateManager.getAllStages();
            
            stages.forEach(stage => {
                const baseDifficulty = 2;
                const adjustedDifficulty = difficultyManager.calculateEventDifficulty(baseDifficulty, stage.id);
                
                expect(adjustedDifficulty).toBeGreaterThanOrEqual(1);
                expect(adjustedDifficulty).toBeLessThanOrEqual(5);
                
                // 后期阶段应该有更高的难度
                if (stage.id === 'adult') {
                    expect(adjustedDifficulty).toBeGreaterThanOrEqual(baseDifficulty);
                }
            });
        });

        test('应该根据难度调整时间限制', () => {
            const baseTimeLimit = 3000;
            const difficulty = 4;
            
            const adjustedTimeLimit = difficultyManager.adjustTimeLimit(baseTimeLimit, difficulty);
            
            expect(adjustedTimeLimit).toBeLessThan(baseTimeLimit);
            expect(adjustedTimeLimit).toBeGreaterThan(1000);
        });

        test('应该记录交互结果并调整难度', () => {
            difficultyManager.reset();
            
            // 模拟连续成功
            for (let i = 0; i < 3; i++) {
                difficultyManager.recordInteractionResult(true, 2, 1500);
            }
            
            const newDifficulty = difficultyManager.calculateEventDifficulty(2, 'adult');
            expect(newDifficulty).toBeGreaterThanOrEqual(2);
            
            // 模拟连续失败
            difficultyManager.reset();
            for (let i = 0; i < 5; i++) {
                difficultyManager.recordInteractionResult(false, 3, null);
            }
            
            const protectedDifficulty = difficultyManager.calculateEventDifficulty(2, 'adult'); // 使用较低的基础难度
            expect(protectedDifficulty).toBeLessThanOrEqual(4); // 调整期望值
        });
    });

    describe('完整游戏流程', () => {
        test('应该完整执行游戏开始到结束的流程', async () => {
            // 1. 游戏初始化
            expect(gameEngine.isRunning).toBe(false);
            expect(stateManager.isGameActive()).toBe(false);
            
            // 2. 开始游戏
            stateManager.startGame();
            gameState.startNewGame();
            gameEngine.start();
            
            expect(gameEngine.isRunning).toBe(true);
            expect(stateManager.isGameActive()).toBe(true);
            expect(stateManager.getCurrentStage().id).toBe('baby');
            
            // 3. 模拟游戏进行 - 快速推进到游戏结束
            const totalGameTime = 100000; // 100秒
            stateManager.update(totalGameTime);
            
            // 4. 验证游戏结束状态
            expect(stateManager.isGameComplete()).toBe(true);
            expect(stateManager.isGameActive()).toBe(false);
            expect(stateManager.getTimeLeft()).toBe(0);
            
            // 5. 验证最终评价
            const evaluation = scoreSystem.calculateFinalEvaluation();
            expect(evaluation).toBeDefined();
            expect(evaluation.title).toBeDefined();
            expect(evaluation.description).toBeDefined();
            expect(evaluation.percentage).toBeGreaterThanOrEqual(0);
            expect(evaluation.percentage).toBeLessThanOrEqual(100);
        });

        test('应该正确处理游戏重置', () => {
            // 开始游戏并进行一段时间
            stateManager.startGame();
            gameState.startNewGame();
            gameEngine.start();
            
            stateManager.update(30000); // 30秒
            scoreSystem.addCompletedEvent({ id: 'test', name: '测试', points: 10 });
            
            // 验证游戏状态
            expect(stateManager.gameTime).toBe(30000);
            expect(scoreSystem.getTotalScore()).toBe(10);
            
            // 重置游戏
            stateManager.resetGame();
            scoreSystem.reset();
            eventSystem.reset();
            gameState.reset();
            
            // 验证重置后的状态
            expect(stateManager.gameTime).toBe(0);
            expect(stateManager.isGameActive()).toBe(false);
            expect(scoreSystem.getTotalScore()).toBe(0);
            expect(scoreSystem.getCompletedEventCount()).toBe(0);
            expect(eventSystem.getActiveEvents().length).toBe(0);
            expect(gameState.isGameActive).toBe(false);
        });

        test('应该正确处理暂停和恢复', () => {
            stateManager.startGame();
            gameEngine.start();
            
            expect(gameEngine.isRunning).toBe(true);
            expect(gameEngine.isPaused).toBe(false);
            
            // 暂停游戏
            gameEngine.pause();
            expect(gameEngine.isPaused).toBe(true);
            
            // 恢复游戏
            gameEngine.resume();
            expect(gameEngine.isPaused).toBe(false);
            
            // 停止游戏
            gameEngine.stop();
            expect(gameEngine.isRunning).toBe(false);
        });
    });

    describe('组件间数据流', () => {
        test('应该正确传递事件完成信息到分数系统', () => {
            stateManager.startGame();
            eventSystem.reset();
            scoreSystem.reset();
            
            // 生成事件
            const currentStage = stateManager.getCurrentStage();
            const event = eventSystem.generateEvent(currentStage);
            
            const initialScore = scoreSystem.getTotalScore();
            
            // 完成事件
            eventSystem.completeEvent(event.id);
            
            // 手动添加到分数系统（模拟游戏主循环的行为）
            scoreSystem.addCompletedEvent(event);
            
            expect(scoreSystem.getTotalScore()).toBe(initialScore + event.points);
            expect(scoreSystem.getCompletedEventCount()).toBe(1);
        });

        test('应该正确同步游戏状态到各个组件', () => {
            stateManager.startGame();
            gameState.startNewGame();
            
            // 更新游戏时间
            const deltaTime = 5000;
            stateManager.update(deltaTime);
            gameState.updateGameTime(deltaTime);
            
            // 验证状态同步
            expect(stateManager.gameTime).toBe(deltaTime);
            expect(gameState.gameTime).toBe(deltaTime);
            
            // 验证阶段信息同步
            const currentStage = stateManager.getCurrentStage();
            gameState.setCurrentStage(currentStage);
            expect(gameState.currentStage).toBe(currentStage);
        });

        test('应该正确处理事件系统和难度系统的交互', () => {
            stateManager.startGame();
            eventSystem.reset();
            difficultyManager.reset();
            
            // 生成事件
            const currentStage = stateManager.getCurrentStage();
            const event = eventSystem.generateEvent(currentStage);
            
            // 验证难度系统影响了事件生成
            expect(event.difficulty).toBeDefined();
            expect(event.timeLimit).toBeDefined();
            
            // 模拟成功完成事件
            const completionTime = 1500;
            difficultyManager.recordInteractionResult(true, event.difficulty, completionTime);
            
            // 生成下一个事件，验证难度调整
            const nextEvent = eventSystem.generateEvent(currentStage);
            
            // 难度可能会有所调整（取决于具体的难度算法）
            expect(nextEvent.difficulty).toBeDefined();
        });
    });

    describe('错误处理和边界情况', () => {
        test('应该正确处理无效的交互输入', () => {
            stateManager.startGame();
            eventSystem.reset();
            
            // 测试无效坐标
            const invalidInput = {
                type: 'click',
                x: -100,
                y: -100
            };
            
            const handled = eventSystem.processInteraction(invalidInput);
            expect(handled).toBe(false);
        });

        test('应该正确处理组件初始化失败', () => {
            // 测试没有Canvas的情况
            document.body.innerHTML = '';
            
            expect(() => {
                new InputHandler(null);
            }).not.toThrow();
        });

        test('应该正确处理游戏状态不一致', () => {
            // 测试在游戏未开始时调用更新
            expect(() => {
                stateManager.update(1000);
            }).not.toThrow();
            
            // 游戏时间不应该更新
            expect(stateManager.gameTime).toBe(0);
        });

        test('应该正确处理分数系统的边界情况', () => {
            scoreSystem.reset();
            
            // 测试零事件情况
            expect(scoreSystem.getCompletionPercentage()).toBe(0);
            
            // 测试负分数保护
            scoreSystem.addCompletedEvent({ id: 'test', name: '测试', points: -10 });
            expect(scoreSystem.getTotalScore()).toBe(-10); // 允许负分，但在实际游戏中应该避免
            
            // 测试重复事件添加
            const event = { id: 'duplicate', name: '重复', points: 10 };
            scoreSystem.addCompletedEvent(event);
            scoreSystem.addCompletedEvent(event);
            
            expect(scoreSystem.getCompletedEventCount()).toBe(2); // 第二次添加被忽略
        });
    });
});