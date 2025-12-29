/**
 * DifficultyManager - 难度管理系统
 * 负责基于人生阶段的难度递进机制和动态难度调整
 */
class DifficultyManager {
    constructor(stateManager, eventSystem) {
        this.stateManager = stateManager;
        this.eventSystem = eventSystem;
        
        // 基础难度配置
        this.baseDifficulty = {
            'baby': 1,
            'child': 2,
            'teen': 3,
            'adult': 4,
            'elder': 3
        };
        
        // 动态难度调整参数
        this.dynamicDifficultyEnabled = true;
        this.currentDifficultyModifier = 0; // -2 到 +2 的调整值
        this.maxDifficultyModifier = 2;
        this.minDifficultyModifier = -2;
        
        // 性能跟踪
        this.recentPerformance = []; // 最近的交互结果
        this.performanceWindowSize = 5; // 跟踪最近5次交互
        this.consecutiveSuccesses = 0;
        this.consecutiveFailures = 0;
        
        // 难度调整阈值
        this.successThreshold = 3; // 连续成功3次后提高难度
        this.failureThreshold = 3; // 连续失败3次后降低难度
        this.adjustmentCooldown = 5000; // 调整冷却时间(毫秒)
        this.lastAdjustmentTime = 0;
        
        // 时间限制调整参数
        this.timeLimitMultipliers = {
            1: 1.5,  // 简单: +50% 时间
            2: 1.2,  // 容易: +20% 时间
            3: 1.0,  // 正常: 基础时间
            4: 0.8,  // 困难: -20% 时间
            5: 0.6   // 极难: -40% 时间
        };
        
        console.log('DifficultyManager initialized');
    }
    
    /**
     * 获取当前有效难度
     */
    getCurrentDifficulty() {
        const currentStage = this.stateManager.getCurrentStage();
        if (!currentStage) return 1;
        
        const baseDifficulty = this.baseDifficulty[currentStage.id] || 1;
        const adjustedDifficulty = baseDifficulty + this.currentDifficultyModifier;
        
        // 限制在1-5范围内
        return Math.max(1, Math.min(5, adjustedDifficulty));
    }
    
    /**
     * 根据人生阶段计算基础难度
     */
    getBaseDifficultyForStage(stageId) {
        return this.baseDifficulty[stageId] || 1;
    }
    
    /**
     * 计算事件的调整后难度
     */
    calculateEventDifficulty(baseEventDifficulty, stageId) {
        const stageDifficulty = this.getBaseDifficultyForStage(stageId);
        const currentDifficulty = this.getCurrentDifficulty();
        
        // 结合事件基础难度、阶段难度和动态调整
        const finalDifficulty = Math.min(5, Math.max(1, 
            baseEventDifficulty + stageDifficulty - 1 + this.currentDifficultyModifier
        ));
        
        return finalDifficulty;
    }
    
    /**
     * 根据难度调整时间限制
     */
    adjustTimeLimit(baseTimeLimit, difficulty) {
        const multiplier = this.timeLimitMultipliers[difficulty] || 1.0;
        return Math.max(1000, Math.round(baseTimeLimit * multiplier));
    }
    
    /**
     * 记录交互结果
     */
    recordInteractionResult(success, eventDifficulty, completionTime) {
        const result = {
            success: success,
            difficulty: eventDifficulty,
            completionTime: completionTime,
            timestamp: Date.now()
        };
        
        // 添加到性能记录
        this.recentPerformance.push(result);
        
        // 保持窗口大小
        if (this.recentPerformance.length > this.performanceWindowSize) {
            this.recentPerformance.shift();
        }
        
        // 更新连续计数
        if (success) {
            this.consecutiveSuccesses++;
            this.consecutiveFailures = 0;
        } else {
            this.consecutiveFailures++;
            this.consecutiveSuccesses = 0;
        }
        
        // 检查是否需要调整难度
        this.checkDifficultyAdjustment();
        
        console.log(`Interaction recorded: ${success ? 'SUCCESS' : 'FAILURE'}, consecutive: ${this.consecutiveSuccesses}/${this.consecutiveFailures}`);
    }
    
    /**
     * 检查并执行难度调整
     */
    checkDifficultyAdjustment() {
        if (!this.dynamicDifficultyEnabled) return;
        
        const currentTime = Date.now();
        
        // 检查冷却时间
        if (currentTime - this.lastAdjustmentTime < this.adjustmentCooldown) {
            return;
        }
        
        let shouldAdjust = false;
        let adjustment = 0;
        
        // 检查是否需要提高难度
        if (this.consecutiveSuccesses >= this.successThreshold) {
            if (this.currentDifficultyModifier < this.maxDifficultyModifier) {
                adjustment = 1;
                shouldAdjust = true;
                console.log('Increasing difficulty due to consecutive successes');
            }
        }
        // 检查是否需要降低难度
        else if (this.consecutiveFailures >= this.failureThreshold) {
            if (this.currentDifficultyModifier > this.minDifficultyModifier) {
                adjustment = -1;
                shouldAdjust = true;
                console.log('Decreasing difficulty due to consecutive failures');
            }
        }
        
        if (shouldAdjust) {
            this.adjustDifficulty(adjustment);
            this.lastAdjustmentTime = currentTime;
            
            // 重置连续计数
            this.consecutiveSuccesses = 0;
            this.consecutiveFailures = 0;
        }
    }
    
    /**
     * 调整难度修正值
     */
    adjustDifficulty(adjustment) {
        const oldModifier = this.currentDifficultyModifier;
        this.currentDifficultyModifier = Math.max(
            this.minDifficultyModifier,
            Math.min(this.maxDifficultyModifier, this.currentDifficultyModifier + adjustment)
        );
        
        console.log(`Difficulty adjusted: ${oldModifier} -> ${this.currentDifficultyModifier}`);
        
        // 触发难度调整事件
        this.onDifficultyAdjusted(oldModifier, this.currentDifficultyModifier);
    }
    
    /**
     * 难度调整事件处理
     */
    onDifficultyAdjusted(oldModifier, newModifier) {
        // 创建难度调整事件
        const adjustmentEvent = new CustomEvent('difficultyAdjusted', {
            detail: {
                oldModifier: oldModifier,
                newModifier: newModifier,
                currentDifficulty: this.getCurrentDifficulty(),
                reason: newModifier > oldModifier ? 'consecutive_success' : 'consecutive_failure'
            }
        });
        
        document.dispatchEvent(adjustmentEvent);
    }
    
    /**
     * 获取当前性能统计
     */
    getPerformanceStats() {
        if (this.recentPerformance.length === 0) {
            return {
                successRate: 0,
                averageCompletionTime: 0,
                recentResults: []
            };
        }
        
        const successes = this.recentPerformance.filter(r => r.success).length;
        const successRate = successes / this.recentPerformance.length;
        
        const completionTimes = this.recentPerformance
            .filter(r => r.success && r.completionTime)
            .map(r => r.completionTime);
        
        const averageCompletionTime = completionTimes.length > 0 
            ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
            : 0;
        
        return {
            successRate: successRate,
            averageCompletionTime: averageCompletionTime,
            recentResults: [...this.recentPerformance],
            consecutiveSuccesses: this.consecutiveSuccesses,
            consecutiveFailures: this.consecutiveFailures
        };
    }
    
    /**
     * 检查阶段难度递进一致性
     */
    validateStageDifficultyProgression() {
        const stages = this.stateManager.getAllStages();
        
        for (let i = 1; i < stages.length - 1; i++) { // 排除最后的elder阶段
            const currentStage = stages[i];
            const previousStage = stages[i - 1];
            
            const currentDifficulty = this.getBaseDifficultyForStage(currentStage.id);
            const previousDifficulty = this.getBaseDifficultyForStage(previousStage.id);
            
            if (currentDifficulty < previousDifficulty) {
                console.warn(`Stage difficulty regression detected: ${previousStage.id}(${previousDifficulty}) -> ${currentStage.id}(${currentDifficulty})`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 获取难度保护状态
     */
    getDifficultyProtectionStatus() {
        return {
            isProtected: this.consecutiveFailures >= this.failureThreshold && 
                        this.currentDifficultyModifier <= this.minDifficultyModifier,
            consecutiveFailures: this.consecutiveFailures,
            currentModifier: this.currentDifficultyModifier,
            canDecrease: this.currentDifficultyModifier > this.minDifficultyModifier
        };
    }
    
    /**
     * 强制设置难度修正值(用于测试)
     */
    setDifficultyModifier(modifier) {
        this.currentDifficultyModifier = Math.max(
            this.minDifficultyModifier,
            Math.min(this.maxDifficultyModifier, modifier)
        );
        
        console.log(`Difficulty modifier set to: ${this.currentDifficultyModifier}`);
    }
    
    /**
     * 启用/禁用动态难度调整
     */
    setDynamicDifficultyEnabled(enabled) {
        this.dynamicDifficultyEnabled = enabled;
        console.log(`Dynamic difficulty ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * 重置难度系统
     */
    reset() {
        this.currentDifficultyModifier = 0;
        this.recentPerformance = [];
        this.consecutiveSuccesses = 0;
        this.consecutiveFailures = 0;
        this.lastAdjustmentTime = 0;
        
        console.log('DifficultyManager reset');
    }
    
    /**
     * 获取难度系统状态
     */
    getStatus() {
        const currentStage = this.stateManager.getCurrentStage();
        
        return {
            currentStage: currentStage?.id || 'none',
            baseDifficulty: currentStage ? this.getBaseDifficultyForStage(currentStage.id) : 1,
            currentDifficulty: this.getCurrentDifficulty(),
            difficultyModifier: this.currentDifficultyModifier,
            dynamicEnabled: this.dynamicDifficultyEnabled,
            performance: this.getPerformanceStats(),
            protection: this.getDifficultyProtectionStatus()
        };
    }
    
    /**
     * 序列化难度管理器状态
     */
    serialize() {
        return {
            currentDifficultyModifier: this.currentDifficultyModifier,
            recentPerformance: this.recentPerformance,
            consecutiveSuccesses: this.consecutiveSuccesses,
            consecutiveFailures: this.consecutiveFailures,
            lastAdjustmentTime: this.lastAdjustmentTime,
            dynamicDifficultyEnabled: this.dynamicDifficultyEnabled
        };
    }
    
    /**
     * 从序列化数据恢复状态
     */
    deserialize(data) {
        this.currentDifficultyModifier = data.currentDifficultyModifier || 0;
        this.recentPerformance = data.recentPerformance || [];
        this.consecutiveSuccesses = data.consecutiveSuccesses || 0;
        this.consecutiveFailures = data.consecutiveFailures || 0;
        this.lastAdjustmentTime = data.lastAdjustmentTime || 0;
        this.dynamicDifficultyEnabled = data.dynamicDifficultyEnabled !== undefined 
            ? data.dynamicDifficultyEnabled : true;
        
        console.log('DifficultyManager state restored');
    }
}