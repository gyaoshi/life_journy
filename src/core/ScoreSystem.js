/**
 * ScoreSystem - 评分系统
 * 负责分数计算、评价生成和结果显示功能
 */
class ScoreSystem {
    constructor() {
        this.totalScore = 0;
        this.completedEvents = [];
        this.totalPossibleEvents = 0;
        this.currentEvaluation = null;
        
        // 评价等级定义
        this.evaluationLevels = [
            { min: 0, max: 30.99, title: '匆忙人生', description: '生活太匆忙，错过了很多美好' },
            { min: 31, max: 60.99, title: '平凡人生', description: '平平淡淡才是真，也有自己的精彩' },
            { min: 61, max: 85.99, title: '充实人生', description: '把握了大部分机会，生活很充实' },
            { min: 86, max: 100, title: '完美人生', description: '几乎没有遗憾，这就是理想的人生' }
        ];
        
        console.log('ScoreSystem initialized');
    }
    
    /**
     * 更新分数系统
     */
    update(deltaTime) {
        // 分数系统通常不需要每帧更新
        // 但可以在这里处理分数动画等效果
    }
    
    /**
     * 添加完成的事件
     */
    addCompletedEvent(event) {
        if (!event || this.completedEvents.find(e => e.id === event.id)) {
            return; // 避免重复添加
        }
        
        this.completedEvents.push({
            id: event.id,
            name: event.name,
            points: event.points,
            stage: event.stage || 'unknown',
            completedAt: Date.now()
        });
        
        this.totalScore += event.points;
        
        console.log(`Event added to score: ${event.name} (+${event.points} points)`);
        console.log(`Total score: ${this.totalScore}`);
    }
    
    /**
     * 设置总可能事件数
     */
    setTotalPossibleEvents(count) {
        this.totalPossibleEvents = Math.max(0, count);
    }
    
    /**
     * 增加总可能事件数
     */
    incrementTotalPossibleEvents(increment = 1) {
        this.totalPossibleEvents += increment;
    }
    
    /**
     * 获取总分数
     */
    getTotalScore() {
        return this.totalScore;
    }
    
    /**
     * 获取完成事件数量
     */
    getCompletedEventCount() {
        return this.completedEvents.length;
    }
    
    /**
     * 获取完成百分比
     */
    getCompletionPercentage() {
        if (this.totalPossibleEvents === 0) return 0;
        return Math.min(100, (this.completedEvents.length / this.totalPossibleEvents) * 100);
    }
    
    /**
     * 计算最终评价
     */
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
    
    /**
     * 获取当前评价
     */
    getCurrentEvaluation() {
        if (!this.currentEvaluation) {
            return this.calculateFinalEvaluation();
        }
        return this.currentEvaluation;
    }
    
    /**
     * 获取按阶段分组的完成事件
     */
    getEventsByStage() {
        const eventsByStage = {};
        
        this.completedEvents.forEach(event => {
            const stage = event.stage || 'unknown';
            if (!eventsByStage[stage]) {
                eventsByStage[stage] = [];
            }
            eventsByStage[stage].push(event);
        });
        
        return eventsByStage;
    }
    
    /**
     * 获取分数统计信息
     */
    getScoreStatistics() {
        const eventsByStage = this.getEventsByStage();
        const statistics = {
            totalScore: this.totalScore,
            completedEvents: this.completedEvents.length,
            totalPossibleEvents: this.totalPossibleEvents,
            completionPercentage: this.getCompletionPercentage(),
            averagePointsPerEvent: this.completedEvents.length > 0 ? 
                this.totalScore / this.completedEvents.length : 0,
            stageBreakdown: {}
        };
        
        // 计算各阶段统计
        Object.keys(eventsByStage).forEach(stage => {
            const stageEvents = eventsByStage[stage];
            statistics.stageBreakdown[stage] = {
                eventCount: stageEvents.length,
                totalPoints: stageEvents.reduce((sum, event) => sum + event.points, 0),
                averagePoints: stageEvents.length > 0 ? 
                    stageEvents.reduce((sum, event) => sum + event.points, 0) / stageEvents.length : 0
            };
        });
        
        return statistics;
    }
    
    /**
     * 生成详细的游戏报告
     */
    generateGameReport() {
        const evaluation = this.getCurrentEvaluation();
        const statistics = this.getScoreStatistics();
        
        return {
            evaluation: evaluation,
            statistics: statistics,
            completedEvents: [...this.completedEvents],
            gameEndTime: new Date().toISOString(),
            summary: {
                title: evaluation.title,
                description: evaluation.description,
                scoreText: `${this.totalScore}分 (${evaluation.percentage}%完成度)`,
                eventText: `完成了${this.completedEvents.length}/${this.totalPossibleEvents}个人生事件`
            }
        };
    }
    
    /**
     * 重置分数系统
     */
    reset() {
        this.totalScore = 0;
        this.completedEvents = [];
        this.totalPossibleEvents = 0;
        this.currentEvaluation = null;
        
        console.log('ScoreSystem reset');
    }
    
    /**
     * 获取评价等级信息
     */
    getEvaluationLevels() {
        return [...this.evaluationLevels];
    }
    
    /**
     * 根据百分比获取评价等级
     */
    getEvaluationForPercentage(percentage) {
        for (const level of this.evaluationLevels) {
            if (percentage >= level.min && percentage <= level.max) {
                return level;
            }
        }
        return this.evaluationLevels[0]; // 默认返回第一个等级
    }
    
    /**
     * 检查是否达到特定评价等级
     */
    hasReachedEvaluationLevel(levelTitle) {
        const currentEvaluation = this.getCurrentEvaluation();
        return currentEvaluation && currentEvaluation.title === levelTitle;
    }
    
    /**
     * 获取下一个评价等级的要求
     */
    getNextLevelRequirement() {
        const currentPercentage = this.getCompletionPercentage();
        
        for (const level of this.evaluationLevels) {
            if (currentPercentage < level.min) {
                const eventsNeeded = Math.ceil(
                    (level.min / 100 * this.totalPossibleEvents) - this.completedEvents.length
                );
                
                return {
                    level: level,
                    eventsNeeded: Math.max(0, eventsNeeded),
                    percentageNeeded: Math.max(0, level.min - currentPercentage)
                };
            }
        }
        
        return null; // 已达到最高等级
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreSystem;
}