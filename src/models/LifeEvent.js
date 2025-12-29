/**
 * LifeEvent - 人生事件数据模型
 * 定义人生事件的属性和行为
 */
class LifeEvent {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.type = config.type; // 交互类型
        this.difficulty = config.difficulty;
        this.timeLimit = config.timeLimit; // 时间限制(毫秒)
        this.timeRemaining = config.timeLimit; // 剩余时间
        this.points = config.points; // 完成后获得分数
        this.position = config.position || { x: 0, y: 0 }; // 屏幕位置
        this.target = config.target; // 交互目标配置
        
        // 事件状态
        this.completed = false;
        this.failed = false;
        this.startTime = Date.now();
        this.completedTime = null;
        
        // 交互状态
        this.clickCount = 0;
        this.dragDistance = 0;
        this.lastInteractionTime = 0;
        
        // 基础视觉属性
        this.scale = 1.0;
        this.opacity = 1.0;
        
        console.log(`LifeEvent created: ${this.name}`);
    }
    
    /**
     * 更新事件状态
     */
    update(deltaTime) {
        if (this.completed || this.failed) return;
        
        // 更新剩余时间
        this.timeRemaining -= deltaTime;
        
        // 检查是否超时
        if (this.timeRemaining <= 0) {
            this.fail();
            return;
        }
        
        // 更新移动目标位置
        if (this.target.type === 'moving_object') {
            this.updateMovingTarget(deltaTime);
        }
    }
    
    /**
     * 更新移动目标位置
     */
    updateMovingTarget(deltaTime) {
        if (!this.movement) {
            // 初始化移动参数
            this.movement = {
                vx: (Math.random() - 0.5) * this.target.speed,
                vy: (Math.random() - 0.5) * this.target.speed,
                bounds: this.getMovementBounds()
            };
        }
        
        // 更新位置
        this.position.x += this.movement.vx * deltaTime / 1000;
        this.position.y += this.movement.vy * deltaTime / 1000;
        
        // 边界反弹
        const bounds = this.movement.bounds;
        if (this.position.x <= bounds.left || this.position.x >= bounds.right) {
            this.movement.vx *= -1;
        }
        if (this.position.y <= bounds.top || this.position.y >= bounds.bottom) {
            this.movement.vy *= -1;
        }
        
        // 限制在边界内
        this.position.x = Math.max(bounds.left, Math.min(bounds.right, this.position.x));
        this.position.y = Math.max(bounds.top, Math.min(bounds.bottom, this.position.y));
    }
    
    /**
     * 获取移动边界
     */
    getMovementBounds() {
        const canvas = document.getElementById('gameCanvas');
        const margin = Math.max(this.target.size.width, this.target.size.height) / 2;
        
        return {
            left: margin,
            right: canvas.width - margin,
            top: 100, // 留出UI空间
            bottom: canvas.height - 100
        };
    }
    
    /**
     * 处理交互输入
     */
    handleInteraction(inputEvent) {
        if (this.completed || this.failed) return false;
        
        this.lastInteractionTime = Date.now();
        
        switch (this.target.type) {
            case 'button':
                return this.handleButtonClick(inputEvent);
            case 'drag_target':
                return this.handleDragInteraction(inputEvent);
            case 'moving_object':
                return this.handleMovingObjectClick(inputEvent);
            default:
                return false;
        }
    }
    
    /**
     * 处理按钮点击
     */
    handleButtonClick(inputEvent) {
        if (inputEvent.type === 'click') {
            this.clickCount++;
            
            if (this.clickCount >= this.target.requiredClicks) {
                this.complete();
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 处理拖拽交互
     */
    handleDragInteraction(inputEvent) {
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
        
        return false;
    }
    
    /**
     * 处理移动物体点击
     */
    handleMovingObjectClick(inputEvent) {
        if (inputEvent.type === 'click') {
            this.complete();
            return true;
        }
        
        return false;
    }
    
    /**
     * 完成事件
     */
    complete() {
        if (this.completed || this.failed) return;
        
        this.completed = true;
        this.completedTime = Date.now();
        
        console.log(`Event completed: ${this.name} (+${this.points} points)`);
    }
    
    /**
     * 事件失败
     */
    fail() {
        if (this.completed || this.failed) return;
        
        this.failed = true;
        
        console.log(`Event failed: ${this.name}`);
    }
    
    /**
     * 检查点击是否在事件区域内
     */
    isPointInside(x, y) {
        const dx = x - this.position.x;
        const dy = y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const radius = Math.max(this.target.size.width, this.target.size.height) / 2;
        return distance <= radius;
    }
    
    /**
     * 获取事件的渲染信息
     */
    getRenderInfo() {
        return {
            position: { ...this.position },
            size: { ...this.target.size },
            scale: this.scale,
            opacity: this.opacity,
            color: this.getEventColor(),
            text: this.getDisplayText(),
            progress: this.getProgress()
        };
    }
    
    /**
     * 获取事件颜色
     */
    getEventColor() {
        const urgencyRatio = 1 - (this.timeRemaining / this.timeLimit);
        
        if (urgencyRatio > 0.8) {
            return '#ff4757'; // 红色 - 非常紧急
        } else if (urgencyRatio > 0.5) {
            return '#ffa502'; // 橙色 - 紧急
        } else {
            return '#2ed573'; // 绿色 - 正常
        }
    }
    
    /**
     * 获取显示文本
     */
    getDisplayText() {
        let text = this.name;
        
        if (this.target.type === 'rapid_click') {
            text += `\n(${this.clickCount}/${this.target.requiredClicks})`;
        } else if (this.target.type === 'drag_target') {
            const progress = Math.min(100, (this.dragDistance / this.target.dragDistance) * 100);
            text += `\n(${Math.round(progress)}%)`;
        }
        
        return text;
    }
    
    /**
     * 获取完成进度(0-1)
     */
    getProgress() {
        switch (this.target.type) {
            case 'button':
            case 'moving_object':
                return this.clickCount >= this.target.requiredClicks ? 1 : 0;
            case 'rapid_click':
                return this.clickCount / this.target.requiredClicks;
            case 'drag_target':
                return Math.min(1, this.dragDistance / this.target.dragDistance);
            default:
                return 0;
        }
    }
    
    /**
     * 获取剩余时间百分比
     */
    getTimeRemainingRatio() {
        return Math.max(0, this.timeRemaining / this.timeLimit);
    }
    
    /**
     * 获取事件持续时间
     */
    getDuration() {
        const endTime = this.completedTime || Date.now();
        return endTime - this.startTime;
    }
    
    /**
     * 检查事件是否活跃
     */
    isActive() {
        return !this.completed && !this.failed && this.timeRemaining > 0;
    }
    
    /**
     * 序列化事件数据
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            difficulty: this.difficulty,
            timeLimit: this.timeLimit,
            timeRemaining: this.timeRemaining,
            points: this.points,
            position: this.position,
            target: this.target,
            completed: this.completed,
            failed: this.failed,
            startTime: this.startTime,
            completedTime: this.completedTime,
            clickCount: this.clickCount,
            dragDistance: this.dragDistance
        };
    }
    
    /**
     * 从序列化数据创建事件
     */
    static deserialize(data) {
        const event = new LifeEvent(data);
        
        // 恢复状态
        event.completed = data.completed || false;
        event.failed = data.failed || false;
        event.startTime = data.startTime || Date.now();
        event.completedTime = data.completedTime || null;
        event.clickCount = data.clickCount || 0;
        event.dragDistance = data.dragDistance || 0;
        
        return event;
    }
}