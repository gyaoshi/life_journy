/**
 * InteractionTarget - 交互目标数据模型
 * 定义交互目标的配置和行为
 */
class InteractionTarget {
    constructor(config) {
        this.type = config.type; // 目标类型
        this.size = config.size || { width: 80, height: 40 }; // 目标大小
        this.speed = config.speed || 0; // 移动速度
        this.requiredClicks = config.requiredClicks || 1; // 需要点击次数
        this.dragDistance = config.dragDistance || 0; // 拖拽距离
        
        // 视觉配置
        this.visual = config.visual || {};
        
        // 交互配置
        this.interaction = config.interaction || {};
        
        console.log(`InteractionTarget created: ${this.type}`);
    }
    
    /**
     * 获取目标的碰撞检测区域
     */
    getHitArea(position) {
        return {
            x: position.x - this.size.width / 2,
            y: position.y - this.size.height / 2,
            width: this.size.width,
            height: this.size.height
        };
    }
    
    /**
     * 检查点是否在目标区域内
     */
    isPointInside(point, position) {
        const hitArea = this.getHitArea(position);
        
        return point.x >= hitArea.x && 
               point.x <= hitArea.x + hitArea.width &&
               point.y >= hitArea.y && 
               point.y <= hitArea.y + hitArea.height;
    }
    
    /**
     * 获取目标的渲染配置
     */
    getRenderConfig() {
        const baseConfig = {
            size: this.size,
            visual: this.getVisualConfig()
        };
        
        return baseConfig;
    }
    
    /**
     * 获取视觉配置
     */
    getVisualConfig() {
        const defaultVisuals = {
            'button': {
                backgroundColor: '#4ecdc4',
                borderColor: '#45b7aa',
                borderWidth: 2,
                borderRadius: 8,
                textColor: '#ffffff',
                fontSize: 16,
                fontWeight: 'bold'
            },
            'drag_target': {
                backgroundColor: '#ff6b6b',
                borderColor: '#ee5a52',
                borderWidth: 2,
                borderRadius: 50, // 圆形
                textColor: '#ffffff',
                fontSize: 14,
                fontWeight: 'normal'
            },
            'moving_object': {
                backgroundColor: '#feca57',
                borderColor: '#ff9ff3',
                borderWidth: 2,
                borderRadius: 25, // 圆形
                textColor: '#2c2c54',
                fontSize: 12,
                fontWeight: 'bold'
            }
        };
        
        const typeDefaults = defaultVisuals[this.type] || defaultVisuals['button'];
        return { ...typeDefaults, ...this.visual };
    }
    
    /**
     * 获取交互提示文本
     */
    getInteractionHint() {
        const hints = {
            'button': this.requiredClicks > 1 ? `连续点击 ${this.requiredClicks} 次` : '点击',
            'drag_target': `拖拽 ${this.dragDistance} 像素`,
            'moving_object': '点击移动目标'
        };
        
        return hints[this.type] || '交互';
    }
    
    /**
     * 获取难度描述
     */
    getDifficultyDescription() {
        switch (this.type) {
            case 'button':
                if (this.requiredClicks === 1) return '简单';
                if (this.requiredClicks <= 3) return '中等';
                return '困难';
                
            case 'drag_target':
                if (this.dragDistance <= 50) return '简单';
                if (this.dragDistance <= 100) return '中等';
                return '困难';
                
            case 'moving_object':
                if (this.speed <= 100) return '简单';
                if (this.speed <= 200) return '中等';
                return '困难';
                
            default:
                return '未知';
        }
    }
    
    /**
     * 计算完成此目标的预期时间
     */
    getExpectedCompletionTime() {
        switch (this.type) {
            case 'button':
                return this.requiredClicks * 200; // 每次点击200ms
                
            case 'drag_target':
                return Math.max(500, this.dragDistance * 5); // 基于拖拽距离
                
            case 'moving_object':
                const baseTime = 1000;
                const speedFactor = this.speed / 100;
                return baseTime * (1 + speedFactor);
                
            default:
                return 1000;
        }
    }
    
    /**
     * 验证目标配置的有效性
     */
    validate() {
        const errors = [];
        
        // 检查必需字段
        if (!this.type) {
            errors.push('Target type is required');
        }
        
        // 检查尺寸
        if (this.size.width <= 0 || this.size.height <= 0) {
            errors.push('Target size must be positive');
        }
        
        // 检查类型特定配置
        switch (this.type) {
            case 'button':
                if (this.requiredClicks <= 0) {
                    errors.push('Required clicks must be positive');
                }
                break;
                
            case 'drag_target':
                if (this.dragDistance <= 0) {
                    errors.push('Drag distance must be positive');
                }
                break;
                
            case 'moving_object':
                if (this.speed < 0) {
                    errors.push('Speed cannot be negative');
                }
                break;
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * 创建目标的副本
     */
    clone() {
        return new InteractionTarget({
            type: this.type,
            size: { ...this.size },
            speed: this.speed,
            requiredClicks: this.requiredClicks,
            dragDistance: this.dragDistance,
            visual: { ...this.visual },
            interaction: { ...this.interaction }
        });
    }
    
    /**
     * 序列化目标数据
     */
    serialize() {
        return {
            type: this.type,
            size: this.size,
            speed: this.speed,
            requiredClicks: this.requiredClicks,
            dragDistance: this.dragDistance,
            visual: this.visual,
            interaction: this.interaction
        };
    }
    
    /**
     * 从序列化数据创建目标
     */
    static deserialize(data) {
        return new InteractionTarget(data);
    }
    
    /**
     * 创建预定义的目标类型
     */
    static createPreset(type, difficulty = 1) {
        const presets = {
            'simple_button': {
                type: 'button',
                size: { width: 80, height: 40 },
                requiredClicks: 1
            },
            'rapid_click': {
                type: 'button',
                size: { width: 100, height: 50 },
                requiredClicks: Math.max(3, difficulty * 2)
            },
            'drag_circle': {
                type: 'drag_target',
                size: { width: 60, height: 60 },
                dragDistance: Math.max(50, difficulty * 25)
            },
            'moving_target': {
                type: 'moving_object',
                size: { width: 50, height: 50 },
                speed: Math.min(300, 50 + difficulty * 40)
            }
        };
        
        const preset = presets[type];
        if (!preset) {
            throw new Error(`Unknown preset type: ${type}`);
        }
        
        return new InteractionTarget(preset);
    }
}