/**
 * 动画引擎核心 - 负责动画生命周期管理和模块加载
 * @author Animation System Team
 * @version 1.0.0
 */

export class AnimationEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = {
            fps: 60,
            quality: 'high', // high, medium, low
            autoResize: true,
            ...options
        };
        
        // 动画状态
        this.currentAnimation = null;
        this.animationTime = 0;
        this.isPlaying = false;
        this.isPaused = false;
        
        // 模块管理
        this.loadedModules = new Map();
        this.moduleCache = new Map();
        
        // 性能监控
        this.performanceMetrics = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            renderCalls: 0
        };
        
        // 错误处理
        this.errorHandlers = new Map();
        
        this.init();
    }
    
    /**
     * 初始化动画引擎
     */
    init() {
        this.setupCanvas();
        this.setupPerformanceMonitoring();
        this.setupErrorHandling();
        
        console.log('AnimationEngine initialized:', {
            canvas: `${this.canvas.width}x${this.canvas.height}`,
            quality: this.options.quality,
            fps: this.options.fps
        });
    }
    
    /**
     * 设置Canvas
     */
    setupCanvas() {
        if (this.options.autoResize) {
            window.addEventListener('resize', () => this.handleResize());
        }
    }
    
    /**
     * 设置性能监控
     */
    setupPerformanceMonitoring() {
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fpsUpdateInterval = 1000; // 每秒更新一次FPS
        this.lastFpsUpdate = performance.now();
    }
    
    /**
     * 设置错误处理
     */
    setupErrorHandling() {
        this.errorHandlers.set('load', (error) => {
            console.error('Animation load error:', error);
            this.fallbackToSimpleAnimation();
        });
        
        this.errorHandlers.set('render', (error) => {
            console.error('Animation render error:', error);
            this.degradeQuality();
        });
        
        this.errorHandlers.set('performance', (error) => {
            console.warn('Performance issue:', error);
            this.optimizePerformance();
        });
    }
    
    /**
     * 动态加载动画模块
     * @param {string} animationType - 动画类型
     * @param {Object} config - 动画配置
     */
    async loadAnimation(animationType, config = {}) {
        try {
            // 检查缓存
            if (this.moduleCache.has(animationType)) {
                const AnimationClass = this.moduleCache.get(animationType);
                return new AnimationClass(this.ctx, config);
            }
            
            // 特殊处理出生动画
            if (animationType === 'birth') {
                const { BirthAnimation } = await import('../animations/birth/BirthAnimation.js');
                this.moduleCache.set(animationType, BirthAnimation);
                const animationInstance = new BirthAnimation(this.ctx, config);
                this.loadedModules.set(animationType, animationInstance);
                console.log(`Birth animation module loaded`);
                return animationInstance;
            }
            
            // 动态导入其他模块
            const modulePath = `../animations/${animationType}Animation.js`;
            const module = await import(modulePath);
            const AnimationClass = module[`${animationType}Animation`];
            
            if (!AnimationClass) {
                throw new Error(`Animation class not found: ${animationType}Animation`);
            }
            
            // 缓存模块
            this.moduleCache.set(animationType, AnimationClass);
            
            // 创建动画实例
            const animationInstance = new AnimationClass(this.ctx, config);
            this.loadedModules.set(animationType, animationInstance);
            
            console.log(`Animation module loaded: ${animationType}`);
            return animationInstance;
            
        } catch (error) {
            this.handleError('load', error);
            return null;
        }
    }
    
    /**
     * 播放动画
     * @param {string} animationType - 动画类型
     * @param {number} duration - 持续时间(ms)
     */
    async playAnimation(animationType, duration = 4000) {
        try {
            // 停止当前动画
            if (this.currentAnimation) {
                this.stopAnimation();
            }
            
            // 加载动画
            const animation = await this.loadAnimation(animationType);
            if (!animation) {
                throw new Error(`Failed to load animation: ${animationType}`);
            }
            
            // 设置动画状态
            this.currentAnimation = animation;
            this.animationTime = 0;
            this.isPlaying = true;
            this.isPaused = false;
            this.animationDuration = duration;
            
            // 开始动画循环
            this.startAnimationLoop();
            
            console.log(`Animation started: ${animationType}, duration: ${duration}ms`);
            
        } catch (error) {
            this.handleError('load', error);
        }
    }
    
    /**
     * 暂停动画
     */
    pauseAnimation() {
        if (this.isPlaying && !this.isPaused) {
            this.isPaused = true;
            console.log('Animation paused');
        }
    }
    
    /**
     * 恢复动画
     */
    resumeAnimation() {
        if (this.isPlaying && this.isPaused) {
            this.isPaused = false;
            this.startAnimationLoop();
            console.log('Animation resumed');
        }
    }
    
    /**
     * 停止动画
     */
    stopAnimation() {
        if (this.currentAnimation) {
            this.isPlaying = false;
            this.isPaused = false;
            this.animationTime = 0;
            
            // 清理动画资源
            if (this.currentAnimation.cleanup) {
                this.currentAnimation.cleanup();
            }
            
            this.currentAnimation = null;
            console.log('Animation stopped');
        }
    }
    
    /**
     * 播放出生动画（特殊处理）
     * 自动暂停游戏计时器，动画完成后恢复
     */
    async playBirthAnimation() {
        try {
            console.log('Starting birth animation sequence');
            
            // 暂停游戏计时器
            this.pauseGameTimer();
            
            // 播放出生动画
            await this.playAnimation('birth', 7000); // 7秒出生动画
            
            // 等待动画完成
            return new Promise((resolve) => {
                const checkCompletion = () => {
                    if (!this.isPlaying) {
                        // 恢复游戏计时器
                        this.resumeGameTimer();
                        console.log('Birth animation completed, game timer resumed');
                        resolve();
                    } else {
                        setTimeout(checkCompletion, 100);
                    }
                };
                checkCompletion();
            });
            
        } catch (error) {
            this.handleError('load', error);
            // 确保计时器恢复
            this.resumeGameTimer();
        }
    }
    
    /**
     * 暂停游戏计时器
     * 这个方法会被主游戏系统重写以实际控制计时器
     */
    pauseGameTimer() {
        console.log('Game timer paused for animation');
        // 触发游戏计时器暂停事件
        if (this.onGameTimerPause) {
            this.onGameTimerPause();
        }
    }
    
    /**
     * 恢复游戏计时器
     * 这个方法会被主游戏系统重写以实际控制计时器
     */
    resumeGameTimer() {
        console.log('Game timer resumed after animation');
        // 触发游戏计时器恢复事件
        if (this.onGameTimerResume) {
            this.onGameTimerResume();
        }
    }
    
    /**
     * 开始动画循环
     */
    startAnimationLoop() {
        if (!this.isPlaying || this.isPaused) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        // 更新性能指标
        this.updatePerformanceMetrics(currentTime, deltaTime);
        
        // 更新动画
        if (this.currentAnimation) {
            this.animationTime += deltaTime;
            
            try {
                // 更新动画状态
                this.currentAnimation.update(this.animationTime, deltaTime);
                
                // 清空画布
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // 渲染动画
                this.currentAnimation.render(this.ctx);
                
                this.performanceMetrics.renderCalls++;
                
            } catch (error) {
                this.handleError('render', error);
            }
        }
        
        // 检查动画是否结束
        if (this.animationTime >= this.animationDuration) {
            this.stopAnimation();
            return;
        }
        
        this.lastFrameTime = currentTime;
        
        // 请求下一帧
        requestAnimationFrame(() => this.startAnimationLoop());
    }
    
    /**
     * 更新性能指标
     */
    updatePerformanceMetrics(currentTime, deltaTime) {
        this.frameCount++;
        this.performanceMetrics.frameTime = deltaTime;
        
        // 更新FPS
        if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.performanceMetrics.fps = Math.round(
                (this.frameCount * 1000) / (currentTime - this.lastFpsUpdate)
            );
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
            
            // 检查性能问题
            if (this.performanceMetrics.fps < 30) {
                this.handleError('performance', {
                    message: 'Low FPS detected',
                    fps: this.performanceMetrics.fps
                });
            }
        }
        
        // 更新内存使用量（估算）
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = Math.round(
                performance.memory.usedJSHeapSize / 1024 / 1024
            );
        }
    }
    
    /**
     * 设置质量等级
     * @param {string} level - 质量等级 (high, medium, low)
     */
    setQuality(level) {
        this.options.quality = level;
        
        // 通知当前动画质量变化
        if (this.currentAnimation && this.currentAnimation.setQuality) {
            this.currentAnimation.setQuality(level);
        }
        
        console.log(`Quality set to: ${level}`);
    }
    
    /**
     * 获取性能指标
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }
    
    /**
     * 处理错误
     */
    handleError(type, error) {
        const handler = this.errorHandlers.get(type);
        if (handler) {
            handler(error);
        } else {
            console.error(`Unhandled animation error (${type}):`, error);
        }
    }
    
    /**
     * 回退到简单动画
     */
    fallbackToSimpleAnimation() {
        console.log('Falling back to simple animation');
        // 实现简单的回退动画
    }
    
    /**
     * 降级质量
     */
    degradeQuality() {
        const qualityLevels = ['high', 'medium', 'low'];
        const currentIndex = qualityLevels.indexOf(this.options.quality);
        
        if (currentIndex < qualityLevels.length - 1) {
            this.setQuality(qualityLevels[currentIndex + 1]);
        }
    }
    
    /**
     * 优化性能
     */
    optimizePerformance() {
        // 自动降级质量
        this.degradeQuality();
        
        // 清理未使用的模块
        this.cleanupUnusedModules();
        
        console.log('Performance optimization applied');
    }
    
    /**
     * 清理未使用的模块
     */
    cleanupUnusedModules() {
        // 保留当前动画，清理其他
        for (const [type, module] of this.loadedModules) {
            if (module !== this.currentAnimation) {
                if (module.cleanup) {
                    module.cleanup();
                }
                this.loadedModules.delete(type);
            }
        }
    }
    
    /**
     * 处理窗口大小变化
     */
    handleResize() {
        // 可以根据需要调整Canvas大小
        console.log('Canvas resize handled');
    }
    
    /**
     * 销毁动画引擎
     */
    destroy() {
        this.stopAnimation();
        this.cleanupUnusedModules();
        this.loadedModules.clear();
        this.moduleCache.clear();
        
        if (this.options.autoResize) {
            window.removeEventListener('resize', this.handleResize);
        }
        
        console.log('AnimationEngine destroyed');
    }
}