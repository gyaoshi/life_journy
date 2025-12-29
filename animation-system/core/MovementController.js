/**
 * 移动控制器 - 处理角色的移动逻辑和动画
 * 支持点击移动、平滑动画和事件位置协调
 */
class MovementController {
    constructor(character, scene, options = {}) {
        this.character = character;
        this.scene = scene;
        
        // 移动状态
        this.currentPosition = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.isMoving = false;
        this.movementSpeed = options.speed || 200; // 像素/秒
        this.movementProgress = 0;
        
        // 动画配置
        this.easingFunction = options.easing || 'easeInOutQuad';
        this.pathType = options.pathType || 'direct';
        this.smoothing = options.smoothing || 0.1;
        
        // 移动路径
        this.currentPath = [];
        this.pathIndex = 0;
        
        // 事件集成
        this.eventIntegration = {
            pauseOnEvent: true,
            resumeAfterEvent: true,
            eventPositioning: new Map()
        };
        
        // 动画帧管理
        this.animationFrame = null;
        this.lastUpdateTime = 0;
        
        // 初始化事件位置配置
        this.initializeEventPositions();
    }

    /**
     * 初始化事件位置配置
     */
    initializeEventPositions() {
        // 婴儿期事件位置
        this.eventIntegration.eventPositioning.set('first_smile', {
            position: { x: 100, y: 150 },
            scene: 'nursery',
            description: '婴儿房中央，靠近摇篮'
        });

        this.eventIntegration.eventPositioning.set('learn_rollover', {
            position: { x: 120, y: 180 },
            scene: 'nursery',
            description: '婴儿床上，适合翻身的位置'
        });

        // 儿童期事件位置
        this.eventIntegration.eventPositioning.set('first_day_kindergarten', {
            position: { x: 300, y: 200 },
            scene: 'school_entrance',
            description: '学校大门前，准备进入校园'
        });

        this.eventIntegration.eventPositioning.set('learn_bicycle', {
            position: { x: 250, y: 250 },
            scene: 'park',
            description: '公园小径，适合骑自行车'
        });

        this.eventIntegration.eventPositioning.set('make_first_friend', {
            position: { x: 200, y: 220 },
            scene: 'playground',
            description: '游乐场中央，便于社交互动'
        });

        // 青少年期事件位置
        this.eventIntegration.eventPositioning.set('first_love_confession', {
            position: { x: 180, y: 160 },
            scene: 'school_garden',
            description: '学校花园，浪漫的告白场所'
        });

        this.eventIntegration.eventPositioning.set('graduation_ceremony', {
            position: { x: 350, y: 180 },
            scene: 'auditorium',
            description: '礼堂舞台前，毕业典礼位置'
        });

        // 成年期事件位置
        this.eventIntegration.eventPositioning.set('first_job', {
            position: { x: 400, y: 150 },
            scene: 'office_building',
            description: '办公楼入口，职业生涯开始'
        });

        this.eventIntegration.eventPositioning.set('wedding_ceremony', {
            position: { x: 300, y: 120 },
            scene: 'church',
            description: '教堂祭坛前，神圣的婚礼现场'
        });

        this.eventIntegration.eventPositioning.set('child_birth', {
            position: { x: 150, y: 100 },
            scene: 'hospital',
            description: '医院产房，新生命诞生的地方'
        });

        // 老年期事件位置
        this.eventIntegration.eventPositioning.set('retirement_party', {
            position: { x: 280, y: 200 },
            scene: 'banquet_hall',
            description: '宴会厅，退休庆典现场'
        });

        this.eventIntegration.eventPositioning.set('grandparent_time', {
            position: { x: 120, y: 180 },
            scene: 'living_room',
            description: '客厅沙发旁，与孙辈共度时光'
        });
    }

    /**
     * 移动到指定位置
     * @param {number} targetX - 目标X坐标
     * @param {number} targetY - 目标Y坐标
     * @param {number} duration - 移动持续时间（可选）
     * @returns {Promise} 移动完成的Promise
     */
    moveToPosition(targetX, targetY, duration = null) {
        if (this.isMoving) {
            this.stopMovement();
        }

        this.targetPosition = { x: targetX, y: targetY };
        
        // 计算移动距离和时间
        const distance = this._calculateDistance(this.currentPosition, this.targetPosition);
        const moveDuration = duration || (distance / this.movementSpeed) * 1000;
        
        // 生成移动路径
        this.currentPath = this._generatePath(this.currentPosition, this.targetPosition);
        this.pathIndex = 0;
        
        return this._startMovement(moveDuration);
    }

    /**
     * 移动到事件位置
     * @param {string} eventType - 事件类型
     * @param {Object} eventData - 事件数据
     * @returns {Promise} 移动完成的Promise
     */
    moveToEvent(eventType, eventData = {}) {
        const eventPosition = this.eventIntegration.eventPositioning.get(eventType);
        
        if (!eventPosition) {
            console.warn(`No position configured for event: ${eventType}`);
            return Promise.resolve();
        }

        // 设置场景（如果需要）
        if (eventPosition.scene && this.scene.setBackground) {
            this.scene.setBackground(eventPosition.scene);
        }

        // 移动到事件位置
        return this.moveToPosition(
            eventPosition.position.x,
            eventPosition.position.y
        );
    }

    /**
     * 设置移动速度
     * @param {number} speed - 新的移动速度（像素/秒）
     */
    setMovementSpeed(speed) {
        this.movementSpeed = Math.max(50, speed); // 最小速度限制
    }

    /**
     * 暂停移动
     */
    pauseMovement() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * 恢复移动
     */
    resumeMovement() {
        if (this.isMoving && !this.animationFrame) {
            this.lastUpdateTime = performance.now();
            this._updateMovement();
        }
    }

    /**
     * 停止移动
     */
    stopMovement() {
        this.isMoving = false;
        this.movementProgress = 0;
        this.pathIndex = 0;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * 检查是否正在移动
     * @returns {boolean} 是否正在移动
     */
    isMoving() {
        return this.isMoving;
    }

    /**
     * 获取当前位置
     * @returns {Object} 当前位置 {x, y}
     */
    getCurrentPosition() {
        return { ...this.currentPosition };
    }

    /**
     * 获取移动进度
     * @returns {number} 移动进度 (0-1)
     */
    getMovementProgress() {
        return this.movementProgress;
    }

    /**
     * 设置当前位置（不触发移动动画）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    setPosition(x, y) {
        this.currentPosition = { x, y };
        this.targetPosition = { x, y };
        
        // 更新角色位置
        if (this.character && this.character.setPosition) {
            this.character.setPosition(x, y);
        }
    }

    /**
     * 添加事件位置配置
     * @param {string} eventType - 事件类型
     * @param {Object} positionConfig - 位置配置
     */
    addEventPosition(eventType, positionConfig) {
        this.eventIntegration.eventPositioning.set(eventType, positionConfig);
    }

    /**
     * 开始移动动画
     * @private
     */
    _startMovement(duration) {
        return new Promise((resolve) => {
            this.isMoving = true;
            this.movementProgress = 0;
            this.movementDuration = duration;
            this.movementStartTime = performance.now();
            this.lastUpdateTime = this.movementStartTime;
            
            this.movementResolve = resolve;
            
            // 开始动画循环
            this._updateMovement();
        });
    }

    /**
     * 更新移动动画
     * @private
     */
    _updateMovement() {
        if (!this.isMoving) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;

        // 计算移动进度
        const elapsed = currentTime - this.movementStartTime;
        this.movementProgress = Math.min(elapsed / this.movementDuration, 1);

        // 应用缓动函数
        const easedProgress = this._applyEasing(this.movementProgress);

        // 更新位置
        this._updatePosition(easedProgress);

        // 更新角色动画状态
        this._updateCharacterAnimation();

        // 检查是否完成移动
        if (this.movementProgress >= 1) {
            this._completeMovement();
        } else {
            this.animationFrame = requestAnimationFrame(() => this._updateMovement());
        }
    }

    /**
     * 更新角色位置
     * @private
     */
    _updatePosition(progress) {
        if (this.pathType === 'direct') {
            // 直线移动
            this.currentPosition.x = this._lerp(
                this.currentPath[0].x,
                this.targetPosition.x,
                progress
            );
            this.currentPosition.y = this._lerp(
                this.currentPath[0].y,
                this.targetPosition.y,
                progress
            );
        } else if (this.pathType === 'curved') {
            // 曲线移动
            this._updateCurvedPosition(progress);
        } else if (this.pathType === 'smart') {
            // 智能路径移动
            this._updateSmartPathPosition(progress);
        }

        // 更新角色渲染位置
        if (this.character && this.character.setPosition) {
            this.character.setPosition(this.currentPosition.x, this.currentPosition.y);
        }
    }

    /**
     * 更新角色动画状态
     * @private
     */
    _updateCharacterAnimation() {
        if (!this.character) return;

        // 计算移动方向
        const direction = this._calculateMovementDirection();
        
        // 设置角色动画状态
        if (this.character.setAnimationState) {
            this.character.setAnimationState('walking', {
                direction: direction,
                speed: this.movementSpeed
            });
        }

        // 更新角色朝向
        if (this.character.setFacing && direction.x !== 0) {
            this.character.setFacing(direction.x > 0 ? 'right' : 'left');
        }
    }

    /**
     * 完成移动
     * @private
     */
    _completeMovement() {
        this.isMoving = false;
        this.currentPosition = { ...this.targetPosition };
        
        // 设置角色为待机状态
        if (this.character && this.character.setAnimationState) {
            this.character.setAnimationState('idle');
        }

        // 清理动画帧
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        // 触发完成回调
        if (this.movementResolve) {
            this.movementResolve();
            this.movementResolve = null;
        }
    }

    /**
     * 生成移动路径
     * @private
     */
    _generatePath(start, end) {
        const path = [start];
        
        if (this.pathType === 'curved') {
            // 生成曲线路径点
            const midPoint = {
                x: (start.x + end.x) / 2,
                y: Math.min(start.y, end.y) - 50 // 向上弯曲
            };
            path.push(midPoint);
        } else if (this.pathType === 'smart') {
            // 智能路径规划（避开障碍物等）
            const smartPath = this._calculateSmartPath(start, end);
            path.push(...smartPath);
        }
        
        path.push(end);
        return path;
    }

    /**
     * 计算智能路径
     * @private
     */
    _calculateSmartPath(start, end) {
        // 简化的智能路径算法
        // 实际实现中可以加入A*算法或其他路径寻找算法
        const waypoints = [];
        
        // 如果需要绕过障碍物，添加中间点
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        
        if (Math.abs(dx) > 100 && Math.abs(dy) > 100) {
            // 添加一个中间转折点
            waypoints.push({
                x: start.x + dx * 0.7,
                y: start.y + dy * 0.3
            });
        }
        
        return waypoints;
    }

    /**
     * 更新曲线位置
     * @private
     */
    _updateCurvedPosition(progress) {
        if (this.currentPath.length >= 3) {
            // 二次贝塞尔曲线
            const p0 = this.currentPath[0];
            const p1 = this.currentPath[1];
            const p2 = this.currentPath[2];
            
            this.currentPosition.x = this._quadraticBezier(p0.x, p1.x, p2.x, progress);
            this.currentPosition.y = this._quadraticBezier(p0.y, p1.y, p2.y, progress);
        }
    }

    /**
     * 更新智能路径位置
     * @private
     */
    _updateSmartPathPosition(progress) {
        if (this.currentPath.length <= 2) {
            // 退化为直线移动
            this._updatePosition(progress);
            return;
        }

        // 计算当前应该在哪个路径段
        const totalSegments = this.currentPath.length - 1;
        const segmentProgress = progress * totalSegments;
        const currentSegment = Math.floor(segmentProgress);
        const segmentLocalProgress = segmentProgress - currentSegment;

        if (currentSegment >= totalSegments) {
            this.currentPosition = { ...this.targetPosition };
            return;
        }

        const startPoint = this.currentPath[currentSegment];
        const endPoint = this.currentPath[currentSegment + 1];

        this.currentPosition.x = this._lerp(startPoint.x, endPoint.x, segmentLocalProgress);
        this.currentPosition.y = this._lerp(startPoint.y, endPoint.y, segmentLocalProgress);
    }

    /**
     * 计算移动方向
     * @private
     */
    _calculateMovementDirection() {
        const dx = this.targetPosition.x - this.currentPosition.x;
        const dy = this.targetPosition.y - this.currentPosition.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) {
            return { x: 0, y: 0 };
        }
        
        return {
            x: dx / length,
            y: dy / length
        };
    }

    /**
     * 计算两点间距离
     * @private
     */
    _calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 应用缓动函数
     * @private
     */
    _applyEasing(progress) {
        switch (this.easingFunction) {
            case 'linear':
                return progress;
            case 'easeInQuad':
                return progress * progress;
            case 'easeOutQuad':
                return progress * (2 - progress);
            case 'easeInOutQuad':
                return progress < 0.5 
                    ? 2 * progress * progress 
                    : -1 + (4 - 2 * progress) * progress;
            case 'easeInCubic':
                return progress * progress * progress;
            case 'easeOutCubic':
                return (--progress) * progress * progress + 1;
            case 'easeInOutCubic':
                return progress < 0.5 
                    ? 4 * progress * progress * progress 
                    : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
            default:
                return progress;
        }
    }

    /**
     * 线性插值
     * @private
     */
    _lerp(start, end, progress) {
        return start + (end - start) * progress;
    }

    /**
     * 二次贝塞尔曲线
     * @private
     */
    _quadraticBezier(p0, p1, p2, t) {
        const oneMinusT = 1 - t;
        return oneMinusT * oneMinusT * p0 + 2 * oneMinusT * t * p1 + t * t * p2;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MovementController;
} else if (typeof window !== 'undefined') {
    window.MovementController = MovementController;
}