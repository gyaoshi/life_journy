/**
 * GameState - 游戏状态数据模型
 * 包含游戏的完整状态信息
 */
class GameState {
    constructor() {
        this.currentStage = null;
        this.gameTime = 0; // 游戏已进行时间(毫秒)
        this.totalScore = 0;
        this.completedEvents = [];
        this.activeEvents = [];
        this.character = null;
        this.isGameActive = false;
        this.isGameComplete = false;
        this.gameStartTime = null;
        this.gameEndTime = null;
        
        // 游戏设置
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'normal',
            language: 'zh-CN'
        };
        
        console.log('GameState initialized');
    }
    
    /**
     * 开始新游戏
     */
    startNewGame() {
        this.reset();
        this.isGameActive = true;
        this.gameStartTime = Date.now();
        
        console.log('New game started');
    }
    
    /**
     * 结束游戏
     */
    endGame() {
        this.isGameActive = false;
        this.isGameComplete = true;
        this.gameEndTime = Date.now();
        
        console.log('Game ended');
    }
    
    /**
     * 重置游戏状态
     */
    reset() {
        this.currentStage = null;
        this.gameTime = 0;
        this.totalScore = 0;
        this.completedEvents = [];
        this.activeEvents = [];
        this.character = null;
        this.isGameActive = false;
        this.isGameComplete = false;
        this.gameStartTime = null;
        this.gameEndTime = null;
        
        console.log('GameState reset');
    }
    
    /**
     * 更新游戏时间
     */
    updateGameTime(deltaTime) {
        if (this.isGameActive) {
            this.gameTime += deltaTime;
        }
    }
    
    /**
     * 设置当前人生阶段
     */
    setCurrentStage(stage) {
        this.currentStage = stage;
    }
    
    /**
     * 添加活跃事件
     */
    addActiveEvent(event) {
        if (!this.activeEvents.find(e => e.id === event.id)) {
            this.activeEvents.push(event);
        }
    }
    
    /**
     * 移除活跃事件
     */
    removeActiveEvent(eventId) {
        this.activeEvents = this.activeEvents.filter(e => e.id !== eventId);
    }
    
    /**
     * 完成事件
     */
    completeEvent(event) {
        // 从活跃事件中移除
        this.removeActiveEvent(event.id);
        
        // 添加到已完成事件
        if (!this.completedEvents.find(e => e.id === event.id)) {
            this.completedEvents.push({
                ...event,
                completedAt: Date.now(),
                gameTime: this.gameTime
            });
            
            // 更新总分数
            this.totalScore += event.points || 0;
        }
    }
    
    /**
     * 获取游戏持续时间(毫秒)
     */
    getGameDuration() {
        if (this.gameStartTime) {
            const endTime = this.gameEndTime || Date.now();
            return endTime - this.gameStartTime;
        }
        return 0;
    }
    
    /**
     * 获取游戏进度(0-1)
     */
    getGameProgress() {
        const totalGameTime = 100000; // 100秒
        return Math.min(this.gameTime / totalGameTime, 1);
    }
    
    /**
     * 获取剩余时间(毫秒)
     */
    getRemainingTime() {
        const totalGameTime = 100000; // 100秒
        return Math.max(totalGameTime - this.gameTime, 0);
    }
    
    /**
     * 获取完成事件数量
     */
    getCompletedEventCount() {
        return this.completedEvents.length;
    }
    
    /**
     * 获取活跃事件数量
     */
    getActiveEventCount() {
        return this.activeEvents.length;
    }
    
    /**
     * 检查事件是否已完成
     */
    isEventCompleted(eventId) {
        return this.completedEvents.some(e => e.id === eventId);
    }
    
    /**
     * 检查事件是否活跃
     */
    isEventActive(eventId) {
        return this.activeEvents.some(e => e.id === eventId);
    }
    
    /**
     * 获取按阶段分组的完成事件
     */
    getCompletedEventsByStage() {
        const eventsByStage = {};
        
        this.completedEvents.forEach(event => {
            const stageId = event.stageId || 'unknown';
            if (!eventsByStage[stageId]) {
                eventsByStage[stageId] = [];
            }
            eventsByStage[stageId].push(event);
        });
        
        return eventsByStage;
    }
    
    /**
     * 更新游戏设置
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
    
    /**
     * 获取游戏设置
     */
    getSettings() {
        return { ...this.settings };
    }
    
    /**
     * 序列化游戏状态
     */
    serialize() {
        return {
            currentStage: this.currentStage,
            gameTime: this.gameTime,
            totalScore: this.totalScore,
            completedEvents: this.completedEvents,
            activeEvents: this.activeEvents,
            character: this.character,
            isGameActive: this.isGameActive,
            isGameComplete: this.isGameComplete,
            gameStartTime: this.gameStartTime,
            gameEndTime: this.gameEndTime,
            settings: this.settings
        };
    }
    
    /**
     * 反序列化游戏状态
     */
    deserialize(data) {
        if (!data) return;
        
        this.currentStage = data.currentStage || null;
        this.gameTime = data.gameTime || 0;
        this.totalScore = data.totalScore || 0;
        this.completedEvents = data.completedEvents || [];
        this.activeEvents = data.activeEvents || [];
        this.character = data.character || null;
        this.isGameActive = data.isGameActive || false;
        this.isGameComplete = data.isGameComplete || false;
        this.gameStartTime = data.gameStartTime || null;
        this.gameEndTime = data.gameEndTime || null;
        this.settings = { ...this.settings, ...(data.settings || {}) };
    }
    
    /**
     * 创建游戏状态快照
     */
    createSnapshot() {
        return JSON.parse(JSON.stringify(this.serialize()));
    }
    
    /**
     * 从快照恢复游戏状态
     */
    restoreFromSnapshot(snapshot) {
        this.deserialize(snapshot);
    }
}