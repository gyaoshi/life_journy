/**
 * InteractionTypes - 交互类型系统
 * 定义和管理各种交互类型和挑战
 */
class InteractionTypes {
    constructor() {
        this.interactionDefinitions = this.initializeInteractionTypes();
        console.log('InteractionTypes initialized');
    }
    
    /**
     * 初始化交互类型定义
     */
    initializeInteractionTypes() {
        return {
            // 基础点击
            'simple_click': {
                name: '简单点击',
                description: '点击目标完成任务',
                difficulty: 1,
                instructions: '点击目标',
                validate: (event, input) => {
                    if (!input || input.type !== 'click') return false;
                    if (!event || typeof event.isPointInside !== 'function') return false;
                    return event.isPointInside(input.x, input.y);
                },
                progress: (event) => {
                    if (!event || !event.target) return 0;
                    return event.clickCount >= event.target.requiredClicks ? 1 : 0;
                }
            },
            
            // 快速连击
            'rapid_click': {
                name: '快速连击',
                description: '在时间限制内快速点击多次',
                difficulty: 2,
                instructions: '快速连续点击',
                validate: (event, input) => {
                    if (!input || input.type !== 'click') return false;
                    if (!event || typeof event.isPointInside !== 'function') return false;
                    if (event.isPointInside(input.x, input.y)) {
                        event.clickCount = (event.clickCount || 0) + 1;
                        return event.clickCount >= (event.target?.requiredClicks || 1);
                    }
                    return false;
                },
                progress: (event) => {
                    if (!event || !event.target) return 0;
                    return Math.min(1, (event.clickCount || 0) / event.target.requiredClicks);
                }
            },
            
            // 拖拽目标
            'drag_target': {
                name: '拖拽操作',
                description: '拖拽目标到指定位置或距离',
                difficulty: 2,
                instructions: '拖拽目标',
                validate: (event, input) => {
                    if (input.type === 'drag') {
                        const distance = Math.sqrt(input.deltaX * input.deltaX + input.deltaY * input.deltaY);
                        event.dragDistance = Math.max(event.dragDistance || 0, distance);
                        return event.dragDistance >= event.target.dragDistance;
                    }
                    return false;
                },
                progress: (event) => {
                    return Math.min(1, (event.dragDistance || 0) / event.target.dragDistance);
                }
            },
            
            // 移动目标点击
            'moving_object': {
                name: '移动目标',
                description: '点击移动中的目标',
                difficulty: 3,
                instructions: '点击移动的目标',
                validate: (event, input) => {
                    return input.type === 'click' && event.isPointInside(input.x, input.y);
                },
                progress: (event) => {
                    return event.completed ? 1 : 0;
                }
            },
            
            // 长按操作
            'long_press': {
                name: '长按操作',
                description: '长时间按住目标',
                difficulty: 2,
                instructions: '长按目标',
                validate: (event, input) => {
                    if (input.type === 'press_start' && event.isPointInside(input.x, input.y)) {
                        event.pressStartTime = Date.now();
                        event.isPressing = true;
                        return false;
                    } else if (input.type === 'press_end' && event.isPressing) {
                        const pressDuration = Date.now() - (event.pressStartTime || 0);
                        event.isPressing = false;
                        return pressDuration >= (event.target.requiredDuration || 1000);
                    }
                    return false;
                },
                progress: (event) => {
                    if (!event.isPressing || !event.pressStartTime) return 0;
                    const elapsed = Date.now() - event.pressStartTime;
                    return Math.min(1, elapsed / (event.target.requiredDuration || 1000));
                }
            },
            
            // 滑动手势
            'swipe_gesture': {
                name: '滑动手势',
                description: '按指定方向滑动',
                difficulty: 2,
                instructions: '向指定方向滑动',
                validate: (event, input) => {
                    if (input.type === 'swipe') {
                        const requiredDirection = event.target.direction || 'any';
                        if (requiredDirection === 'any') return true;
                        
                        const angle = Math.atan2(input.deltaY, input.deltaX);
                        const direction = this.getSwipeDirection(angle);
                        return direction === requiredDirection;
                    }
                    return false;
                },
                progress: (event) => {
                    return event.completed ? 1 : 0;
                }
            },
            
            // 双击操作
            'double_click': {
                name: '双击操作',
                description: '快速双击目标',
                difficulty: 2,
                instructions: '快速双击',
                validate: (event, input) => {
                    if (input.type === 'click' && event.isPointInside(input.x, input.y)) {
                        const now = Date.now();
                        const lastClickTime = event.lastClickTime || 0;
                        
                        if (now - lastClickTime < 500) { // 500ms内的第二次点击
                            return true;
                        } else {
                            event.lastClickTime = now;
                            return false;
                        }
                    }
                    return false;
                },
                progress: (event) => {
                    return event.completed ? 1 : 0;
                }
            },
            
            // 序列点击
            'sequence_click': {
                name: '序列点击',
                description: '按正确顺序点击多个目标',
                difficulty: 3,
                instructions: '按顺序点击目标',
                validate: (event, input) => {
                    if (input.type === 'click') {
                        const sequence = event.target.sequence || [];
                        const currentIndex = event.sequenceIndex || 0;
                        
                        if (currentIndex < sequence.length) {
                            const targetPoint = sequence[currentIndex];
                            const distance = Math.sqrt(
                                Math.pow(input.x - targetPoint.x, 2) + 
                                Math.pow(input.y - targetPoint.y, 2)
                            );
                            
                            if (distance <= (targetPoint.radius || 30)) {
                                event.sequenceIndex = currentIndex + 1;
                                return event.sequenceIndex >= sequence.length;
                            }
                        }
                    }
                    return false;
                },
                progress: (event) => {
                    const sequence = event.target.sequence || [];
                    const currentIndex = event.sequenceIndex || 0;
                    return sequence.length > 0 ? currentIndex / sequence.length : 0;
                }
            },
            
            // 画圆操作
            'draw_circle': {
                name: '画圆操作',
                description: '用手指画出圆形',
                difficulty: 3,
                instructions: '画一个圆形',
                validate: (event, input) => {
                    if (input.type === 'drag') {
                        event.drawPath = event.drawPath || [];
                        event.drawPath.push({ x: input.x, y: input.y });
                        
                        if (event.drawPath.length > 10) {
                            return this.isCircularPath(event.drawPath);
                        }
                    }
                    return false;
                },
                progress: (event) => {
                    const pathLength = (event.drawPath || []).length;
                    return Math.min(1, pathLength / 20);
                }
            },
            
            // 节奏点击
            'rhythm_click': {
                name: '节奏点击',
                description: '按照节拍点击',
                difficulty: 3,
                instructions: '跟随节拍点击',
                validate: (event, input) => {
                    if (input.type === 'click' && event.isPointInside(input.x, input.y)) {
                        const now = Date.now();
                        const beatInterval = event.target.beatInterval || 1000;
                        const startTime = event.startTime;
                        const expectedBeatTime = startTime + Math.floor((now - startTime) / beatInterval) * beatInterval;
                        const timeDiff = Math.abs(now - expectedBeatTime);
                        
                        if (timeDiff < beatInterval * 0.2) { // 20%的容错率
                            event.correctBeats = (event.correctBeats || 0) + 1;
                            return event.correctBeats >= (event.target.requiredBeats || 3);
                        }
                    }
                    return false;
                },
                progress: (event) => {
                    const correctBeats = event.correctBeats || 0;
                    const requiredBeats = event.target.requiredBeats || 3;
                    return Math.min(1, correctBeats / requiredBeats);
                }
            },
            
            // 多点触控
            'multi_touch': {
                name: '多点触控',
                description: '同时触摸多个点',
                difficulty: 4,
                instructions: '同时触摸所有目标',
                validate: (event, input) => {
                    if (input.type === 'multi_touch') {
                        const targets = event.target.touchPoints || [];
                        const touches = input.touches || [];
                        
                        if (touches.length >= targets.length) {
                            let matchedTargets = 0;
                            targets.forEach(target => {
                                const hasMatch = touches.some(touch => {
                                    const distance = Math.sqrt(
                                        Math.pow(touch.x - target.x, 2) + 
                                        Math.pow(touch.y - target.y, 2)
                                    );
                                    return distance <= (target.radius || 30);
                                });
                                if (hasMatch) matchedTargets++;
                            });
                            
                            return matchedTargets >= targets.length;
                        }
                    }
                    return false;
                },
                progress: (event) => {
                    return event.completed ? 1 : 0;
                }
            }
        };
    }
    
    /**
     * 获取交互类型定义
     */
    getInteractionType(type) {
        return this.interactionDefinitions[type];
    }
    
    /**
     * 验证交互输入
     */
    validateInteraction(event, input) {
        if (!event || !input) return false;
        
        const interactionType = this.getInteractionType(event.type);
        if (!interactionType) return false;
        
        return interactionType.validate(event, input);
    }
    
    /**
     * 获取交互进度
     */
    getInteractionProgress(event) {
        const interactionType = this.getInteractionType(event.type);
        if (!interactionType) return 0;
        
        return interactionType.progress(event);
    }
    
    /**
     * 获取交互说明
     */
    getInteractionInstructions(event) {
        const interactionType = this.getInteractionType(event.type);
        return interactionType ? interactionType.instructions : '完成任务';
    }
    
    /**
     * 获取滑动方向
     */
    getSwipeDirection(angle) {
        const degrees = angle * 180 / Math.PI;
        
        if (degrees >= -45 && degrees <= 45) return 'right';
        if (degrees >= 45 && degrees <= 135) return 'down';
        if (degrees >= 135 || degrees <= -135) return 'left';
        if (degrees >= -135 && degrees <= -45) return 'up';
        
        return 'unknown';
    }
    
    /**
     * 检查路径是否为圆形
     */
    isCircularPath(path) {
        if (path.length < 10) return false;
        
        // 计算路径的中心点
        const centerX = path.reduce((sum, p) => sum + p.x, 0) / path.length;
        const centerY = path.reduce((sum, p) => sum + p.y, 0) / path.length;
        
        // 计算平均半径
        const avgRadius = path.reduce((sum, p) => {
            return sum + Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
        }, 0) / path.length;
        
        // 检查路径点是否大致在圆周上
        let validPoints = 0;
        path.forEach(p => {
            const distance = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
            if (Math.abs(distance - avgRadius) <= avgRadius * 0.3) {
                validPoints++;
            }
        });
        
        return validPoints / path.length >= 0.7; // 70%的点在圆周附近
    }
    
    /**
     * 创建特定类型的交互目标配置
     */
    createInteractionTarget(type, options = {}) {
        const baseConfig = {
            type: type,
            size: options.size || { width: 80, height: 80 }
        };
        
        switch (type) {
            case 'simple_click':
                return {
                    ...baseConfig,
                    requiredClicks: options.requiredClicks || 1
                };
                
            case 'rapid_click':
                return {
                    ...baseConfig,
                    requiredClicks: options.requiredClicks || 5
                };
                
            case 'drag_target':
                return {
                    ...baseConfig,
                    dragDistance: options.dragDistance || 100
                };
                
            case 'moving_object':
                return {
                    ...baseConfig,
                    speed: options.speed || 100,
                    size: options.size || { width: 60, height: 60 }
                };
                
            case 'long_press':
                return {
                    ...baseConfig,
                    requiredDuration: options.requiredDuration || 1500
                };
                
            case 'swipe_gesture':
                return {
                    ...baseConfig,
                    direction: options.direction || 'any',
                    minDistance: options.minDistance || 50
                };
                
            case 'sequence_click':
                return {
                    ...baseConfig,
                    sequence: options.sequence || this.generateRandomSequence(3)
                };
                
            case 'rhythm_click':
                return {
                    ...baseConfig,
                    beatInterval: options.beatInterval || 800,
                    requiredBeats: options.requiredBeats || 4
                };
                
            case 'multi_touch':
                return {
                    ...baseConfig,
                    touchPoints: options.touchPoints || this.generateRandomTouchPoints(2)
                };
                
            default:
                return baseConfig;
        }
    }
    
    /**
     * 生成随机序列点击点
     */
    generateRandomSequence(count) {
        const sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push({
                x: 100 + Math.random() * 600,
                y: 100 + Math.random() * 400,
                radius: 25
            });
        }
        return sequence;
    }
    
    /**
     * 生成随机多点触控点
     */
    generateRandomTouchPoints(count) {
        const points = [];
        for (let i = 0; i < count; i++) {
            points.push({
                x: 100 + Math.random() * 600,
                y: 100 + Math.random() * 400,
                radius: 30
            });
        }
        return points;
    }
    
    /**
     * 获取适合人生阶段的交互类型
     */
    getStageAppropriateInteractions(stageId) {
        const stageInteractions = {
            'baby': ['simple_click', 'long_press'],
            'child': ['simple_click', 'drag_target', 'double_click'],
            'teen': ['rapid_click', 'swipe_gesture', 'sequence_click'],
            'adult': ['moving_object', 'rhythm_click', 'multi_touch'],
            'elder': ['simple_click', 'long_press', 'draw_circle']
        };
        
        return stageInteractions[stageId] || ['simple_click'];
    }
    
    /**
     * 根据难度调整交互参数
     */
    adjustInteractionForDifficulty(targetConfig, difficulty) {
        const adjustedConfig = { ...targetConfig };
        
        switch (targetConfig.type) {
            case 'rapid_click':
                adjustedConfig.requiredClicks = Math.max(1, 
                    Math.floor(adjustedConfig.requiredClicks * (1 + (difficulty - 1) * 0.3))
                );
                break;
                
            case 'moving_object':
                adjustedConfig.speed *= (1 + (difficulty - 1) * 0.4);
                adjustedConfig.size.width = Math.max(30, 
                    adjustedConfig.size.width - (difficulty - 1) * 5
                );
                adjustedConfig.size.height = Math.max(30, 
                    adjustedConfig.size.height - (difficulty - 1) * 5
                );
                break;
                
            case 'drag_target':
                adjustedConfig.dragDistance *= (1 + (difficulty - 1) * 0.25);
                break;
                
            case 'long_press':
                adjustedConfig.requiredDuration *= (1 + (difficulty - 1) * 0.2);
                break;
                
            case 'sequence_click':
                const baseCount = adjustedConfig.sequence.length;
                const newCount = Math.min(6, Math.max(2, baseCount + difficulty - 2));
                if (newCount !== baseCount) {
                    adjustedConfig.sequence = this.generateRandomSequence(newCount);
                }
                break;
                
            case 'rhythm_click':
                adjustedConfig.beatInterval = Math.max(400, 
                    adjustedConfig.beatInterval - (difficulty - 1) * 100
                );
                adjustedConfig.requiredBeats = Math.max(2, 
                    adjustedConfig.requiredBeats + Math.floor((difficulty - 1) * 0.5)
                );
                break;
        }
        
        return adjustedConfig;
    }
    
    /**
     * 获取所有可用的交互类型
     */
    getAllInteractionTypes() {
        return Object.keys(this.interactionDefinitions);
    }
    
    /**
     * 获取交互类型统计信息
     */
    getInteractionStats() {
        const types = this.getAllInteractionTypes();
        const difficultyDistribution = {};
        
        types.forEach(type => {
            const definition = this.interactionDefinitions[type];
            const difficulty = definition.difficulty;
            difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] || 0) + 1;
        });
        
        return {
            totalTypes: types.length,
            difficultyDistribution,
            averageDifficulty: types.reduce((sum, type) => 
                sum + this.interactionDefinitions[type].difficulty, 0
            ) / types.length
        };
    }
}

// Export for Node.js (testing) and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractionTypes;
}