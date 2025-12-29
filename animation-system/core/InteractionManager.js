/**
 * 交互管理器 - 处理用户交互和协调移动与事件动画
 * 负责点击事件处理、移动协调和事件集成
 */
class InteractionManager {
    constructor(canvas, movementController, animationEngine, options = {}) {
        this.canvas = canvas;
        this.movementController = movementController;
        this.animationEngine = animationEngine;
        
        // 交互状态
        this.isInteractionEnabled = true;
        this.isEventInProgress = false;
        this.currentEvent = null;
        
        // 点击处理
        this.clickHandlers = new Map();
        this.clickableAreas = [];
        
        // 事件协调
        this.eventQueue = [];
        this.coordinationSettings = {
            waitForMovement: true,
            pauseMovementDuringEvent: true,
            resumeMovementAfterEvent: true,
            movementEventDelay: options.movementEventDelay || 200
        };
        
        // 视觉提示
        this.showMovementHints = options.showMovementHints !== false;
        this.showEventPositions = options.showEventPositions !== false;
        
        // 初始化事件监听
        this.initializeEventListeners();
        
        // 初始化可点击区域
        this.initializeClickableAreas();
    }

    /**
     * 初始化事件监听器
     */
    initializeEventListeners() {
        if (!this.canvas) return;

        // 鼠标点击事件
        this.canvas.addEventListener('click', (event) => {
            if (this.isInteractionEnabled) {
                this.handleClick(event.offsetX, event.offsetY, event);
            }
        });

        // 鼠标移动事件（用于显示提示）
        this.canvas.addEventListener('mousemove', (event) => {
            if (this.isInteractionEnabled && this.showMovementHints) {
                this.handleMouseMove(event.offsetX, event.offsetY);
            }
        });

        // 鼠标离开事件
        this.canvas.addEventListener('mouseleave', () => {
            this.clearMovementHints();
        });

        // 键盘事件（可选的快捷键支持）
        document.addEventListener('keydown', (event) => {
            if (this.isInteractionEnabled) {
                this.handleKeyDown(event);
            }
        });
    }

    /**
     * 初始化可点击区域
     */
    initializeClickableAreas() {
        // 定义游戏中的可点击区域
        this.clickableAreas = [
            {
                id: 'nursery',
                bounds: { x: 50, y: 100, width: 150, height: 100 },
                description: '婴儿房',
                events: ['first_smile', 'learn_rollover', 'first_crawl']
            },
            {
                id: 'school',
                bounds: { x: 250, y: 150, width: 120, height: 80 },
                description: '学校',
                events: ['first_day_kindergarten', 'graduation_ceremony']
            },
            {
                id: 'playground',
                bounds: { x: 150, y: 200, width: 100, height: 80 },
                description: '游乐场',
                events: ['make_first_friend', 'learn_bicycle']
            },
            {
                id: 'office',
                bounds: { x: 350, y: 120, width: 100, height: 90 },
                description: '办公室',
                events: ['first_job', 'promotion']
            },
            {
                id: 'home',
                bounds: { x: 80, y: 50, width: 140, height: 120 },
                description: '家庭',
                events: ['wedding_ceremony', 'child_birth', 'retirement_party']
            }
        ];
    }

    /**
     * 处理点击事件
     * @param {number} x - 点击的X坐标
     * @param {number} y - 点击的Y坐标
     * @param {Event} originalEvent - 原始事件对象
     */
    handleClick(x, y, originalEvent = null) {
        console.log(`Click detected at (${x}, ${y})`);

        // 检查是否点击了特殊区域
        const clickedArea = this.getClickedArea(x, y);
        
        if (clickedArea) {
            this.handleAreaClick(clickedArea, x, y);
        } else {
            this.handleGeneralClick(x, y);
        }

        // 触发自定义点击处理器
        this.triggerClickHandlers(x, y, originalEvent);
    }

    /**
     * 处理区域点击
     * @param {Object} area - 被点击的区域
     * @param {number} x - 点击坐标X
     * @param {number} y - 点击坐标Y
     */
    handleAreaClick(area, x, y) {
        console.log(`Clicked on area: ${area.description}`);
        
        // 移动到区域中心或点击位置
        const targetX = area.bounds.x + area.bounds.width / 2;
        const targetY = area.bounds.y + area.bounds.height / 2;
        
        this.moveToPositionWithFeedback(targetX, targetY)
            .then(() => {
                // 移动完成后，可以触发相关事件
                this.showAreaEvents(area);
            });
    }

    /**
     * 处理一般点击
     * @param {number} x - 点击坐标X
     * @param {number} y - 点击坐标Y
     */
    handleGeneralClick(x, y) {
        // 直接移动到点击位置
        this.moveToPositionWithFeedback(x, y);
    }

    /**
     * 带反馈的移动到位置
     * @param {number} x - 目标X坐标
     * @param {number} y - 目标Y坐标
     * @returns {Promise} 移动完成的Promise
     */
    moveToPositionWithFeedback(x, y) {
        if (!this.movementController) {
            return Promise.resolve();
        }

        // 显示移动目标提示
        this.showMovementTarget(x, y);

        // 开始移动
        return this.movementController.moveToPosition(x, y)
            .then(() => {
                // 移动完成，清除提示
                this.clearMovementTarget();
                console.log(`Movement completed to (${x}, ${y})`);
            })
            .catch((error) => {
                console.error('Movement failed:', error);
                this.clearMovementTarget();
            });
    }

    /**
     * 处理事件触发
     * @param {string} eventType - 事件类型
     * @param {Object} eventData - 事件数据
     * @returns {Promise} 事件处理完成的Promise
     */
    async handleEventTrigger(eventType, eventData = {}) {
        if (this.isEventInProgress) {
            // 如果有事件正在进行，加入队列
            this.eventQueue.push({ eventType, eventData });
            return;
        }

        console.log(`Handling event: ${eventType}`);
        
        try {
            this.isEventInProgress = true;
            this.currentEvent = { eventType, eventData };

            // 协调移动和事件动画
            await this.coordinateMovementAndEvent(eventType, eventData);

        } finally {
            this.isEventInProgress = false;
            this.currentEvent = null;
            
            // 处理队列中的下一个事件
            this.processEventQueue();
        }
    }

    /**
     * 协调移动和事件动画
     * @param {string} eventType - 事件类型
     * @param {Object} eventData - 事件数据
     * @returns {Promise} 协调完成的Promise
     */
    async coordinateMovementAndEvent(eventType, eventData = {}) {
        console.log(`Coordinating movement and event for: ${eventType}`);

        // 第一步：移动到事件位置
        if (this.coordinationSettings.waitForMovement && this.movementController) {
            console.log(`Moving to event position for: ${eventType}`);
            await this.movementController.moveToEvent(eventType, eventData);
            
            // 移动完成后的短暂延迟
            if (this.coordinationSettings.movementEventDelay > 0) {
                await this.delay(this.coordinationSettings.movementEventDelay);
            }
        }

        // 第二步：暂停移动（如果需要）
        if (this.coordinationSettings.pauseMovementDuringEvent && this.movementController) {
            this.movementController.pauseMovement();
        }

        // 第三步：播放事件动画
        if (this.animationEngine) {
            console.log(`Playing event animation for: ${eventType}`);
            await this.animationEngine.playAnimation(eventType, eventData);
        }

        // 第四步：恢复移动（如果需要）
        if (this.coordinationSettings.resumeMovementAfterEvent && this.movementController) {
            this.movementController.resumeMovement();
        }

        console.log(`Event coordination completed for: ${eventType}`);
    }

    /**
     * 设置交互启用状态
     * @param {boolean} enabled - 是否启用交互
     */
    setInteractionEnabled(enabled) {
        this.isInteractionEnabled = enabled;
        
        if (this.canvas) {
            this.canvas.style.cursor = enabled ? 'pointer' : 'default';
        }
    }

    /**
     * 获取可点击区域
     * @returns {Array} 可点击区域列表
     */
    getClickableAreas() {
        return [...this.clickableAreas];
    }

    /**
     * 添加点击处理器
     * @param {string} id - 处理器ID
     * @param {Function} handler - 处理函数
     */
    addClickHandler(id, handler) {
        this.clickHandlers.set(id, handler);
    }

    /**
     * 移除点击处理器
     * @param {string} id - 处理器ID
     */
    removeClickHandler(id) {
        this.clickHandlers.delete(id);
    }

    /**
     * 添加可点击区域
     * @param {Object} area - 区域配置
     */
    addClickableArea(area) {
        this.clickableAreas.push(area);
    }

    /**
     * 移除可点击区域
     * @param {string} areaId - 区域ID
     */
    removeClickableArea(areaId) {
        this.clickableAreas = this.clickableAreas.filter(area => area.id !== areaId);
    }

    /**
     * 显示移动提示
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    showMovementTarget(x, y) {
        if (!this.showMovementHints) return;

        // 创建视觉提示（可以是圆圈、箭头等）
        this.movementTarget = { x, y, timestamp: Date.now() };
        
        // 触发重绘以显示提示
        this.requestRedraw();
    }

    /**
     * 清除移动目标提示
     */
    clearMovementTarget() {
        this.movementTarget = null;
        this.requestRedraw();
    }

    /**
     * 清除移动提示
     */
    clearMovementHints() {
        this.movementHint = null;
        this.requestRedraw();
    }

    /**
     * 显示区域事件
     * @param {Object} area - 区域对象
     */
    showAreaEvents(area) {
        if (!this.showEventPositions) return;

        console.log(`Available events in ${area.description}:`, area.events);
        
        // 可以在这里显示事件选择UI或自动触发相关事件
        // 这里简化为控制台输出
    }

    /**
     * 处理鼠标移动
     * @param {number} x - 鼠标X坐标
     * @param {number} y - 鼠标Y坐标
     */
    handleMouseMove(x, y) {
        // 检查是否悬停在可点击区域上
        const hoveredArea = this.getClickedArea(x, y);
        
        if (hoveredArea) {
            this.showMovementHint(x, y, hoveredArea.description);
            this.canvas.style.cursor = 'pointer';
        } else {
            this.clearMovementHints();
            this.canvas.style.cursor = 'default';
        }
    }

    /**
     * 显示移动提示
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} description - 描述文本
     */
    showMovementHint(x, y, description) {
        this.movementHint = { x, y, description };
        this.requestRedraw();
    }

    /**
     * 处理键盘按下事件
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeyDown(event) {
        switch (event.key) {
            case 'Escape':
                // 取消当前移动
                if (this.movementController) {
                    this.movementController.stopMovement();
                }
                break;
            case ' ':
                // 空格键暂停/恢复移动
                if (this.movementController) {
                    if (this.movementController.isMoving()) {
                        this.movementController.pauseMovement();
                    } else {
                        this.movementController.resumeMovement();
                    }
                }
                event.preventDefault();
                break;
        }
    }

    /**
     * 获取点击的区域
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Object|null} 被点击的区域或null
     */
    getClickedArea(x, y) {
        return this.clickableAreas.find(area => {
            return x >= area.bounds.x && 
                   x <= area.bounds.x + area.bounds.width &&
                   y >= area.bounds.y && 
                   y <= area.bounds.y + area.bounds.height;
        });
    }

    /**
     * 触发点击处理器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Event} originalEvent - 原始事件
     */
    triggerClickHandlers(x, y, originalEvent) {
        for (const [id, handler] of this.clickHandlers) {
            try {
                handler(x, y, originalEvent);
            } catch (error) {
                console.error(`Error in click handler ${id}:`, error);
            }
        }
    }

    /**
     * 处理事件队列
     */
    processEventQueue() {
        if (this.eventQueue.length > 0 && !this.isEventInProgress) {
            const nextEvent = this.eventQueue.shift();
            this.handleEventTrigger(nextEvent.eventType, nextEvent.eventData);
        }
    }

    /**
     * 请求重绘
     */
    requestRedraw() {
        // 触发画布重绘事件
        if (this.canvas && this.canvas.dispatchEvent) {
            this.canvas.dispatchEvent(new CustomEvent('redraw-requested'));
        }
    }

    /**
     * 渲染交互提示
     * @param {CanvasRenderingContext2D} context - 画布上下文
     */
    renderInteractionHints(context) {
        if (!context) return;

        // 渲染移动目标提示
        if (this.movementTarget) {
            this.renderMovementTarget(context, this.movementTarget);
        }

        // 渲染移动提示
        if (this.movementHint) {
            this.renderMovementHint(context, this.movementHint);
        }

        // 渲染可点击区域（如果启用）
        if (this.showEventPositions) {
            this.renderClickableAreas(context);
        }
    }

    /**
     * 渲染移动目标
     * @param {CanvasRenderingContext2D} context - 画布上下文
     * @param {Object} target - 目标对象
     */
    renderMovementTarget(context, target) {
        const age = Date.now() - target.timestamp;
        const maxAge = 2000; // 2秒后消失
        
        if (age > maxAge) {
            this.clearMovementTarget();
            return;
        }

        const alpha = 1 - (age / maxAge);
        const radius = 20 + (age / maxAge) * 10;

        context.save();
        context.globalAlpha = alpha;
        context.strokeStyle = '#00FF00';
        context.lineWidth = 3;
        context.setLineDash([5, 5]);
        
        context.beginPath();
        context.arc(target.x, target.y, radius, 0, 2 * Math.PI);
        context.stroke();
        
        context.restore();
    }

    /**
     * 渲染移动提示
     * @param {CanvasRenderingContext2D} context - 画布上下文
     * @param {Object} hint - 提示对象
     */
    renderMovementHint(context, hint) {
        context.save();
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.font = '14px Arial';
        
        const textWidth = context.measureText(hint.description).width;
        const padding = 8;
        
        // 绘制背景
        context.fillRect(
            hint.x - textWidth/2 - padding,
            hint.y - 30,
            textWidth + padding * 2,
            20
        );
        
        // 绘制文本
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.fillText(hint.description, hint.x, hint.y - 15);
        
        context.restore();
    }

    /**
     * 渲染可点击区域
     * @param {CanvasRenderingContext2D} context - 画布上下文
     */
    renderClickableAreas(context) {
        context.save();
        context.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        context.lineWidth = 2;
        context.setLineDash([10, 5]);
        
        for (const area of this.clickableAreas) {
            context.strokeRect(
                area.bounds.x,
                area.bounds.y,
                area.bounds.width,
                area.bounds.height
            );
        }
        
        context.restore();
    }

    /**
     * 延迟函数
     * @param {number} ms - 延迟毫秒数
     * @returns {Promise} 延迟Promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 销毁交互管理器
     */
    destroy() {
        // 清理事件监听器
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.handleClick);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mouseleave', this.clearMovementHints);
        }

        // 清理状态
        this.clickHandlers.clear();
        this.eventQueue = [];
        this.isInteractionEnabled = false;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractionManager;
} else if (typeof window !== 'undefined') {
    window.InteractionManager = InteractionManager;
}