/**
 * StateManager - 人生阶段状态机
 * 负责管理游戏的人生阶段转换和时间进度跟踪
 */
class StateManager {
    constructor() {
        this.currentStage = null;
        this.gameTime = 0; // 游戏已进行时间(毫秒)
        this.totalGameTime = 100000; // 总游戏时间100秒(毫秒)
        this.isGameActive = false;
        this.isGameComplete = false;
        
        // 人生阶段定义
        this.lifeStages = [
            {
                id: 'baby',
                name: '婴儿期',
                duration: 15000, // 15秒
                difficulty: 1,
                startTime: 0
            },
            {
                id: 'child',
                name: '儿童期',
                duration: 20000, // 20秒
                difficulty: 2,
                startTime: 15000
            },
            {
                id: 'teen',
                name: '青少年期',
                duration: 20000, // 20秒
                difficulty: 3,
                startTime: 35000
            },
            {
                id: 'adult',
                name: '成年期',
                duration: 30000, // 30秒
                difficulty: 4,
                startTime: 55000
            },
            {
                id: 'elder',
                name: '老年期',
                duration: 15000, // 15秒
                difficulty: 3,
                startTime: 85000
            }
        ];
        
        console.log('StateManager initialized');
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        this.gameTime = 0;
        this.isGameActive = true;
        this.isGameComplete = false;
        this.currentStage = this.lifeStages[0];
        
        console.log('Game started - entering', this.currentStage.name);
    }
    
    /**
     * 重置游戏状态
     */
    resetGame() {
        this.gameTime = 0;
        this.isGameActive = false;
        this.isGameComplete = false;
        this.currentStage = null;
        
        console.log('Game reset');
    }
    
    /**
     * 更新游戏时间和状态
     */
    update(deltaTime) {
        if (!this.isGameActive || this.isGameComplete) return;
        
        this.gameTime += deltaTime;
        
        // 检查是否需要切换人生阶段
        this.checkStageTransition();
        
        // 检查游戏是否结束
        if (this.gameTime >= this.totalGameTime) {
            this.endGame();
        }
    }
    
    /**
     * 检查并执行人生阶段转换
     */
    checkStageTransition() {
        const newStage = this.getStageForTime(this.gameTime);
        
        if (newStage && newStage.id !== this.currentStage.id) {
            this.transitionToStage(newStage);
        }
    }
    
    /**
     * 根据时间获取对应的人生阶段
     */
    getStageForTime(time) {
        for (let i = this.lifeStages.length - 1; i >= 0; i--) {
            if (time >= this.lifeStages[i].startTime) {
                return this.lifeStages[i];
            }
        }
        return this.lifeStages[0];
    }
    
    /**
     * 切换到指定的人生阶段
     */
    transitionToStage(stage) {
        const previousStage = this.currentStage;
        this.currentStage = stage;
        
        console.log(`Stage transition: ${previousStage?.name || 'None'} -> ${stage.name}`);
        
        // 触发阶段切换事件
        this.onStageTransition(previousStage, stage);
    }
    
    /**
     * 阶段切换事件处理
     */
    onStageTransition(previousStage, newStage) {
        // 可以在这里添加阶段切换的特殊逻辑
        // 比如播放过渡动画、音效等
    }
    
    /**
     * 结束游戏
     */
    endGame() {
        this.isGameActive = false;
        this.isGameComplete = true;
        
        console.log('Game completed');
    }
    
    /**
     * 获取当前人生阶段
     */
    getCurrentStage() {
        return this.currentStage;
    }
    
    /**
     * 获取当前阶段的进度(0-1)
     */
    getStageProgress() {
        if (!this.currentStage) return 0;
        
        const stageElapsed = this.gameTime - this.currentStage.startTime;
        return Math.min(stageElapsed / this.currentStage.duration, 1);
    }
    
    /**
     * 获取游戏总进度(0-1)
     */
    getGameProgress() {
        return Math.min(this.gameTime / this.totalGameTime, 1);
    }
    
    /**
     * 获取剩余时间(秒)
     */
    getTimeLeft() {
        const timeLeft = this.totalGameTime - this.gameTime;
        return Math.max(timeLeft / 1000, 0);
    }
    
    /**
     * 获取已用时间(秒)
     */
    getElapsedTime() {
        return this.gameTime / 1000;
    }
    
    /**
     * 检查游戏是否完成
     */
    isGameComplete() {
        return this.isGameComplete;
    }
    
    /**
     * 检查游戏是否活跃
     */
    isGameActive() {
        return this.isGameActive;
    }
    
    /**
     * 获取所有人生阶段
     */
    getAllStages() {
        return [...this.lifeStages];
    }
    
    /**
     * 根据ID获取人生阶段
     */
    getStageById(stageId) {
        return this.lifeStages.find(stage => stage.id === stageId);
    }
}