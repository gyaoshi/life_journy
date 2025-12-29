/**
 * EventSystem - 人生事件管理器
 * 负责人生事件的生成、管理和完成逻辑，建立事件与人生阶段的关联机制
 */
class EventSystem {
    constructor(stateManager, difficultyManager = null) {
        this.stateManager = stateManager;
        this.difficultyManager = difficultyManager;
        this.activeEvents = [];
        this.completedEvents = [];
        this.eventQueue = [];
        this.lastEventTime = 0;
        this.eventIdCounter = 0;
        
        // 事件生成配置
        this.eventGenerationInterval = 2000; // 每2秒尝试生成新事件
        this.maxActiveEvents = 3; // 最大同时活跃事件数
        
        // 人生阶段事件模板
        this.eventTemplates = this.initializeEventTemplates();
        
        console.log('EventSystem initialized');
    }
    
    /**
     * 初始化事件模板
     */
    initializeEventTemplates() {
        // 使用新的丰富事件数据
        if (typeof LifeEventsData !== 'undefined') {
            return LifeEventsData.getAllEventTemplates();
        }
        
        // 回退到基础模板（如果LifeEventsData未加载）
        return {
            'baby': [
                {
                    name: '第一次微笑',
                    type: 'simple_click',
                    difficulty: 1,
                    timeLimit: 3000,
                    points: 10,
                    icon: '😊',
                    color: '#ffb3ba',
                    target: {
                        type: 'button',
                        size: { width: 100, height: 60 },
                        requiredClicks: 1
                    }
                }
            ],
            'child': [
                {
                    name: '学会走路',
                    type: 'rapid_click',
                    difficulty: 2,
                    timeLimit: 3000,
                    points: 20,
                    icon: '👣',
                    color: '#bae1ff',
                    target: {
                        type: 'button',
                        size: { width: 90, height: 50 },
                        requiredClicks: 3
                    }
                }
            ],
            'teen': [
                {
                    name: '考试及格',
                    type: 'rapid_click',
                    difficulty: 3,
                    timeLimit: 2500,
                    points: 30,
                    icon: '📝',
                    color: '#baffc9',
                    target: {
                        type: 'button',
                        size: { width: 80, height: 45 },
                        requiredClicks: 5
                    }
                }
            ],
            'adult': [
                {
                    name: '找到工作',
                    type: 'drag_target',
                    difficulty: 4,
                    timeLimit: 2000,
                    points: 40,
                    icon: '💼',
                    color: '#ffffba',
                    target: {
                        type: 'drag_target',
                        size: { width: 70, height: 70 },
                        dragDistance: 100
                    }
                }
            ],
            'elder': [
                {
                    name: '退休生活',
                    type: 'simple_click',
                    difficulty: 2,
                    timeLimit: 3000,
                    points: 30,
                    icon: '🎉',
                    color: '#ffdfba',
                    target: {
                        type: 'button',
                        size: { width: 90, height: 55 },
                        requiredClicks: 1
                    }
                }
            ]
        };
    }
    
    /**
     * 更新事件系统
     */
    update(deltaTime) {
        // 更新活跃事件
        this.updateActiveEvents(deltaTime);
        
        // 生成新事件
        this.generateEvents(deltaTime);
        
        // 清理完成或失败的事件
        this.cleanupEvents();
    }
    
    /**
     * 更新活跃事件
     */
    updateActiveEvents(deltaTime) {
        this.activeEvents.forEach(event => {
            event.update(deltaTime);
        });
    }
    
    /**
     * 生成新事件
     */
    generateEvents(deltaTime) {
        this.lastEventTime += deltaTime;
        
        // 检查是否需要生成新事件
        if (this.lastEventTime >= this.eventGenerationInterval && 
            this.activeEvents.length < this.maxActiveEvents) {
            
            const currentStage = this.stateManager.getCurrentStage();
            if (currentStage && this.stateManager.isGameActive()) {
                this.generateEvent(currentStage);
                this.lastEventTime = 0;
            }
        }
    }
    
    /**
     * 根据人生阶段生成事件
     */
    generateEvent(stage) {
        const templates = this.eventTemplates[stage.id];
        if (!templates || templates.length === 0) return null;
        
        // 随机选择事件模板
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        // 创建事件配置
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
        
        // 调整目标配置基于难度
        this.adjustTargetForDifficulty(eventConfig.target, eventConfig.difficulty);
        
        // 创建事件实例
        const event = new LifeEvent(eventConfig);
        
        // 添加到活跃事件列表
        this.activeEvents.push(event);
        
        console.log(`Generated event: ${event.name} (difficulty: ${eventConfig.difficulty})`);
        
        return event;
    }
    
    /**
     * 计算事件难度
     */
    calculateEventDifficulty(baseDifficulty, stageDifficulty) {
        if (this.difficultyManager) {
            return this.difficultyManager.calculateEventDifficulty(baseDifficulty, this.stateManager.getCurrentStage()?.id);
        }
        return Math.min(5, baseDifficulty + stageDifficulty - 1);
    }
    
    /**
     * 计算时间限制
     */
    calculateTimeLimit(baseTimeLimit, stageDifficulty) {
        if (this.difficultyManager) {
            const difficulty = this.difficultyManager.calculateEventDifficulty(1, this.stateManager.getCurrentStage()?.id);
            return this.difficultyManager.adjustTimeLimit(baseTimeLimit, difficulty);
        }
        const difficultyFactor = 1 - (stageDifficulty - 1) * 0.15;
        return Math.max(1000, baseTimeLimit * difficultyFactor);
    }
    
    /**
     * 生成事件位置
     */
    generateEventPosition() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            return { x: 400, y: 300 }; // 默认位置
        }
        
        const margin = 100;
        const x = margin + Math.random() * (canvas.width - 2 * margin);
        const y = margin + Math.random() * (canvas.height - 2 * margin);
        
        return { x, y };
    }
    
    /**
     * 根据难度调整目标配置
     */
    adjustTargetForDifficulty(target, difficulty) {
        switch (target.type) {
            case 'button':
                if (difficulty >= 3) {
                    target.requiredClicks = Math.max(target.requiredClicks, difficulty);
                }
                break;
                
            case 'drag_target':
                target.dragDistance = target.dragDistance * (1 + (difficulty - 1) * 0.3);
                break;
                
            case 'moving_object':
                target.speed = target.speed * (1 + (difficulty - 1) * 0.4);
                target.size.width = Math.max(30, target.size.width - (difficulty - 1) * 5);
                target.size.height = Math.max(30, target.size.height - (difficulty - 1) * 5);
                break;
        }
    }
    
    /**
     * 处理玩家交互
     */
    processInteraction(inputEvent) {
        let interactionHandled = false;
        
        // 检查每个活跃事件
        for (const event of this.activeEvents) {
            if (event.isActive() && event.isPointInside(inputEvent.x, inputEvent.y)) {
                const success = event.handleInteraction(inputEvent);
                
                if (success) {
                    this.onEventCompleted(event);
                    interactionHandled = true;
                    break; // 只处理第一个匹配的事件
                }
            }
        }
        
        return interactionHandled;
    }
    
    /**
     * 事件完成处理
     */
    onEventCompleted(event) {
        console.log(`Event completed: ${event.name} (+${event.points} points)`);
        
        // 记录到难度管理器
        if (this.difficultyManager) {
            const completionTime = event.getDuration();
            this.difficultyManager.recordInteractionResult(true, event.difficulty, completionTime);
        }
        
        // 触发成功反馈
        this.triggerSuccessFeedback(event);
        
        // 移动到完成列表
        this.completedEvents.push(event);
        
        // 从活跃列表移除
        const index = this.activeEvents.indexOf(event);
        if (index > -1) {
            this.activeEvents.splice(index, 1);
        }
    }
    
    /**
     * 事件失败处理
     */
    onEventFailed(event) {
        console.log(`Event failed: ${event.name}`);
        
        // 记录到难度管理器
        if (this.difficultyManager) {
            this.difficultyManager.recordInteractionResult(false, event.difficulty, null);
        }
        
        // 触发失败反馈
        this.triggerFailureFeedback(event);
        
        // 从活跃列表移除
        const index = this.activeEvents.indexOf(event);
        if (index > -1) {
            this.activeEvents.splice(index, 1);
        }
    }
    
    /**
     * 触发成功反馈
     */
    triggerSuccessFeedback(event) {
        // 这里可以触发视觉和音频反馈
        // 例如：粒子效果、音效播放等
        
        // 创建成功反馈事件
        const feedbackEvent = new CustomEvent('eventCompleted', {
            detail: {
                event: event,
                points: event.points,
                position: event.position
            }
        });
        
        document.dispatchEvent(feedbackEvent);
    }
    
    /**
     * 触发失败反馈
     */
    triggerFailureFeedback(event) {
        // 创建失败反馈事件
        const feedbackEvent = new CustomEvent('eventFailed', {
            detail: {
                event: event,
                position: event.position
            }
        });
        
        document.dispatchEvent(feedbackEvent);
    }
    
    /**
     * 清理完成或失败的事件
     */
    cleanupEvents() {
        // 移除失败的事件
        const failedEvents = this.activeEvents.filter(event => event.failed);
        failedEvents.forEach(event => this.onEventFailed(event));
    }
    
    /**
     * 完成指定事件
     */
    completeEvent(eventId) {
        const event = this.activeEvents.find(e => e.id === eventId);
        if (event && event.isActive()) {
            event.complete();
            this.onEventCompleted(event);
            return true;
        }
        return false;
    }
    
    /**
     * 获取活跃事件列表
     */
    getActiveEvents() {
        return [...this.activeEvents];
    }
    
    /**
     * 获取已完成事件列表
     */
    getCompletedEvents() {
        return [...this.completedEvents];
    }
    
    /**
     * 获取总完成事件数
     */
    getTotalCompletedEvents() {
        return this.completedEvents.length;
    }
    
    /**
     * 获取总分数
     */
    getTotalScore() {
        return this.completedEvents.reduce((total, event) => total + event.points, 0);
    }
    
    /**
     * 获取当前阶段的事件统计
     */
    getStageEventStats(stageId) {
        const stageEvents = this.completedEvents.filter(event => {
            const templates = this.eventTemplates[stageId] || [];
            return templates.some(template => template.name === event.name);
        });
        
        return {
            completed: stageEvents.length,
            totalScore: stageEvents.reduce((total, event) => total + event.points, 0),
            averageTime: this.calculateAverageCompletionTime(stageEvents)
        };
    }
    
    /**
     * 计算平均完成时间
     */
    calculateAverageCompletionTime(events) {
        if (events.length === 0) return 0;
        
        const totalTime = events.reduce((total, event) => total + event.getDuration(), 0);
        return totalTime / events.length;
    }
    
    /**
     * 重置事件系统
     */
    reset() {
        this.activeEvents = [];
        this.completedEvents = [];
        this.eventQueue = [];
        this.lastEventTime = 0;
        this.eventIdCounter = 0;
        
        console.log('EventSystem reset');
    }
    
    /**
     * 暂停事件生成
     */
    pauseEventGeneration() {
        this.eventGenerationPaused = true;
    }
    
    /**
     * 恢复事件生成
     */
    resumeEventGeneration() {
        this.eventGenerationPaused = false;
    }
    
    /**
     * 获取事件生成统计
     */
    getEventGenerationStats() {
        const totalEvents = this.completedEvents.length + this.activeEvents.length;
        const completionRate = totalEvents > 0 ? (this.completedEvents.length / totalEvents) * 100 : 0;
        
        return {
            totalGenerated: totalEvents,
            completed: this.completedEvents.length,
            active: this.activeEvents.length,
            completionRate: completionRate,
            totalScore: this.getTotalScore()
        };
    }
    
    /**
     * 序列化事件系统状态
     */
    serialize() {
        return {
            activeEvents: this.activeEvents.map(event => event.serialize()),
            completedEvents: this.completedEvents.map(event => event.serialize()),
            lastEventTime: this.lastEventTime,
            eventIdCounter: this.eventIdCounter
        };
    }
    
    /**
     * 从序列化数据恢复状态
     */
    deserialize(data) {
        this.activeEvents = data.activeEvents.map(eventData => LifeEvent.deserialize(eventData));
        this.completedEvents = data.completedEvents.map(eventData => LifeEvent.deserialize(eventData));
        this.lastEventTime = data.lastEventTime || 0;
        this.eventIdCounter = data.eventIdCounter || 0;
        
        console.log('EventSystem state restored');
    }
}