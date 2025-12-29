/**
 * 交互管理器 - 简化版本
 */
class InteractionManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 当前交互事件
        this.currentEvent = null;
        this.events = [];
        
        // 交互类型配置
        this.interactionTypes = {
            click: {
                name: '点击',
                color: '#ff6b6b',
                icon: '👆',
                duration: 3000
            },
            drag: {
                name: '拖拽',
                color: '#4ecdc4',
                icon: '👋',
                duration: 4000
            },
            tap: {
                name: '连击',
                color: '#ffe66d',
                icon: '👊',
                duration: 2000,
                requiredTaps: 5
            },
            hold: {
                name: '长按',
                color: '#ff9ff3',
                icon: '✋',
                duration: 2000,
                holdTime: 1500
            }
        };
        
        // 事件监听
        this.setupEventListeners();
        
        console.log('InteractionManager created');
    }
    
    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 鼠标事件
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        // 防止默认行为
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    /**
     * 创建新的交互事件
     */
    createEvent(stage) {
        // 根据人生阶段选择合适的交互类型和故事
        const storyEvents = this.getStoryEvents(stage);
        const eventData = storyEvents[Math.floor(Math.random() * storyEvents.length)];
        
        const availableTypes = this.getAvailableTypes(stage);
        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        const config = this.interactionTypes[type];
        
        const event = {
            id: Date.now() + Math.random(),
            type: type,
            config: config,
            story: eventData,
            x: Math.random() * (this.canvas.width - 200) + 100,
            y: Math.random() * (this.canvas.height - 300) + 150,
            startTime: Date.now(),
            completed: false,
            progress: 0,
            // 特定类型的属性
            taps: 0,
            isHolding: false,
            holdStartTime: 0,
            dragStartX: 0,
            dragStartY: 0,
            dragDistance: 0,
            // 视觉效果
            pulseTime: 0,
            glowIntensity: 0
        };
        
        this.currentEvent = event;
        this.events.push(event);
        
        console.log('Created story event:', eventData.title, 'with interaction:', type);
        
        // 触发故事事件
        this.dispatchStoryEvent(eventData);
        
        return event;
    }
    
    /**
     * 获取阶段的故事事件
     */
    getStoryEvents(stage) {
        const storyEvents = {
            baby: [
                { title: '第一次微笑', description: '学会用微笑表达快乐', action: 'smile', emotion: 'happy' },
                { title: '学会爬行', description: '探索世界的第一步', action: 'crawl', emotion: 'excited' },
                { title: '认识妈妈', description: '与最重要的人建立联系', action: 'bond', emotion: 'happy' },
                { title: '第一次说话', description: '发出人生第一个词语', action: 'speak', emotion: 'excited' }
            ],
            child: [
                { title: '结识好友', description: '在游乐场遇到第一个朋友', action: 'play', emotion: 'happy' },
                { title: '学会读书', description: '打开知识世界的大门', action: 'learn', emotion: 'excited' },
                { title: '帮助他人', description: '学会关爱和分享', action: 'help', emotion: 'happy' },
                { title: '克服恐惧', description: '勇敢面对黑暗', action: 'brave', emotion: 'excited' }
            ],
            teen: [
                { title: '追逐梦想', description: '开始思考未来的方向', action: 'dream', emotion: 'excited' },
                { title: '珍贵友谊', description: '与朋友们共度美好时光', action: 'friendship', emotion: 'happy' },
                { title: '努力学习', description: '为了理想而刻苦读书', action: 'study', emotion: 'thinking' },
                { title: '初恋体验', description: '体验人生第一次心动', action: 'love', emotion: 'excited' }
            ],
            adult: [
                { title: '职场成功', description: '在工作中证明自己的价值', action: 'work', emotion: 'excited' },
                { title: '找到真爱', description: '遇到生命中最重要的人', action: 'love', emotion: 'happy' },
                { title: '建立家庭', description: '拥有温馨的小家', action: 'family', emotion: 'happy' },
                { title: '实现目标', description: '完成人生重要里程碑', action: 'achieve', emotion: 'excited' }
            ],
            elder: [
                { title: '传授智慧', description: '将经验传给年轻一代', action: 'teach', emotion: 'happy' },
                { title: '内心平静', description: '享受宁静祥和的时光', action: 'peace', emotion: 'neutral' },
                { title: '回忆往昔', description: '回望人生的美好时光', action: 'remember', emotion: 'happy' },
                { title: '留下遗产', description: '为世界留下美好回忆', action: 'legacy', emotion: 'happy' }
            ]
        };
        
        return storyEvents[stage] || storyEvents.adult;
    }
    
    /**
     * 触发故事事件
     */
    dispatchStoryEvent(eventData) {
        const storyEvent = new CustomEvent('storyEvent', {
            detail: { 
                title: eventData.title,
                description: eventData.description,
                action: eventData.action,
                emotion: eventData.emotion
            }
        });
        document.dispatchEvent(storyEvent);
    }
    
    /**
     * 获取阶段可用的交互类型
     */
    getAvailableTypes(stage) {
        switch (stage) {
            case 'baby':
                return ['click', 'tap'];
            case 'child':
                return ['click', 'drag', 'tap'];
            case 'teen':
                return ['click', 'drag', 'tap', 'hold'];
            case 'adult':
                return ['click', 'drag', 'tap', 'hold'];
            case 'elder':
                return ['click', 'hold'];
            default:
                return ['click'];
        }
    }
    
    /**
     * 更新交互事件
     */
    update(deltaTime) {
        if (!this.currentEvent || this.currentEvent.completed) return;
        
        const event = this.currentEvent;
        const elapsed = Date.now() - event.startTime;
        
        // 检查超时
        if (elapsed >= event.config.duration) {
            this.failEvent(event);
            return;
        }
        
        // 更新进度
        event.progress = Math.min(1, elapsed / event.config.duration);
        
        // 检查长按事件
        if (event.type === 'hold' && event.isHolding) {
            const holdTime = Date.now() - event.holdStartTime;
            if (holdTime >= event.config.holdTime) {
                this.completeEvent(event);
            }
        }
    }
    
    /**
     * 渲染交互事件
     */
    render() {
        if (!this.currentEvent || this.currentEvent.completed) return;
        
        const event = this.currentEvent;
        const ctx = this.ctx;
        
        // 渲染事件区域
        ctx.save();
        
        // 事件背景
        ctx.fillStyle = event.config.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(event.x, event.y, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // 事件边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1;
        ctx.stroke();
        
        // 事件图标
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(event.config.icon, event.x, event.y - 10);
        
        // 事件名称
        ctx.font = '16px Arial';
        ctx.fillText(event.config.name, event.x, event.y + 20);
        
        // 进度条
        this.renderProgress(event);
        
        // 特定类型的渲染
        this.renderTypeSpecific(event);
        
        ctx.restore();
    }
    
    /**
     * 渲染进度条
     */
    renderProgress(event) {
        const ctx = this.ctx;
        const x = event.x;
        const y = event.y + 60;
        const width = 80;
        const height = 8;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x - width/2, y, width, height);
        
        // 进度
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - width/2, y, width * (1 - event.progress), height);
    }
    
    /**
     * 渲染特定类型的元素
     */
    renderTypeSpecific(event) {
        const ctx = this.ctx;
        
        switch (event.type) {
            case 'tap':
                // 显示点击次数
                ctx.font = '20px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText(`${event.taps}/${event.config.requiredTaps}`, event.x, event.y + 40);
                break;
                
            case 'drag':
                // 显示拖拽距离
                if (event.dragDistance > 0) {
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(event.dragStartX, event.dragStartY);
                    ctx.lineTo(event.x, event.y);
                    ctx.stroke();
                }
                break;
                
            case 'hold':
                // 显示长按进度
                if (event.isHolding) {
                    const holdProgress = Math.min(1, (Date.now() - event.holdStartTime) / event.config.holdTime);
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.arc(event.x, event.y, 60, -Math.PI/2, -Math.PI/2 + holdProgress * Math.PI * 2);
                    ctx.stroke();
                }
                break;
        }
    }
    
    /**
     * 处理点击事件
     */
    handleClick(e) {
        if (!this.currentEvent || this.currentEvent.completed) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const event = this.currentEvent;
        const distance = Math.sqrt((x - event.x) ** 2 + (y - event.y) ** 2);
        
        if (distance <= 50) {
            if (event.type === 'click') {
                this.completeEvent(event);
            } else if (event.type === 'tap') {
                event.taps++;
                if (event.taps >= event.config.requiredTaps) {
                    this.completeEvent(event);
                }
            }
        }
    }
    
    /**
     * 处理鼠标按下
     */
    handleMouseDown(e) {
        if (!this.currentEvent || this.currentEvent.completed) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const event = this.currentEvent;
        const distance = Math.sqrt((x - event.x) ** 2 + (y - event.y) ** 2);
        
        if (distance <= 50) {
            if (event.type === 'hold') {
                event.isHolding = true;
                event.holdStartTime = Date.now();
            } else if (event.type === 'drag') {
                event.dragStartX = x;
                event.dragStartY = y;
            }
        }
    }
    
    /**
     * 处理鼠标抬起
     */
    handleMouseUp(e) {
        if (!this.currentEvent || this.currentEvent.completed) return;
        
        const event = this.currentEvent;
        
        if (event.type === 'hold') {
            event.isHolding = false;
        } else if (event.type === 'drag' && event.dragDistance >= 100) {
            this.completeEvent(event);
        }
    }
    
    /**
     * 处理鼠标移动
     */
    handleMouseMove(e) {
        if (!this.currentEvent || this.currentEvent.completed) return;
        
        const event = this.currentEvent;
        
        if (event.type === 'drag' && event.dragStartX > 0) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            event.dragDistance = Math.sqrt((x - event.dragStartX) ** 2 + (y - event.dragStartY) ** 2);
        }
    }
    
    /**
     * 处理触摸事件
     */
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        if (e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            this.handleClick({ clientX: touch.clientX, clientY: touch.clientY });
            this.handleMouseUp({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }
    
    /**
     * 完成事件
     */
    completeEvent(event) {
        event.completed = true;
        console.log('Event completed:', event.type);
        
        // 触发完成事件
        const customEvent = new CustomEvent('interactionCompleted', {
            detail: { event: event, success: true }
        });
        document.dispatchEvent(customEvent);
        
        this.currentEvent = null;
    }
    
    /**
     * 失败事件
     */
    failEvent(event) {
        event.completed = true;
        console.log('Event failed:', event.type);
        
        // 触发失败事件
        const customEvent = new CustomEvent('interactionCompleted', {
            detail: { event: event, success: false }
        });
        document.dispatchEvent(customEvent);
        
        this.currentEvent = null;
    }
    
    /**
     * 清除当前事件
     */
    clearCurrentEvent() {
        this.currentEvent = null;
    }
    
    /**
     * 获取当前事件
     */
    getCurrentEvent() {
        return this.currentEvent;
    }
}

// Export for Node.js (testing) and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractionManager;
}