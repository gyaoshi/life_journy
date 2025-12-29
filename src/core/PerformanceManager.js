/**
 * PerformanceManager - 性能监控和优化管理器
 * 负责监控游戏性能、内存使用和帧率，并提供优化建议
 */
class PerformanceManager {
    constructor() {
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 0;
        this.targetFPS = 60;
        this.minFPS = 30;
        
        // 性能统计
        this.performanceStats = {
            averageFPS: 0,
            minFPS: Infinity,
            maxFPS: 0,
            frameDrops: 0,
            memoryUsage: 0,
            renderTime: 0,
            updateTime: 0
        };
        
        // 性能历史记录
        this.fpsHistory = [];
        this.maxHistoryLength = 60; // 保存60帧的历史
        
        // 优化设置
        this.optimizationLevel = 'auto'; // 'low', 'medium', 'high', 'auto'
        this.adaptiveQuality = true;
        
        // 错误处理
        this.errorCount = 0;
        this.maxErrors = 10;
        this.errorLog = [];
        
        console.log('PerformanceManager initialized');
    }
    
    /**
     * 更新性能统计
     */
    update(deltaTime) {
        this.frameCount++;
        const currentTime = performance.now();
        
        // 计算FPS
        if (currentTime - this.lastFPSUpdate >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
            
            // 更新FPS统计
            this.updateFPSStats(this.currentFPS);
            
            // 检查是否需要调整质量
            if (this.adaptiveQuality) {
                this.adjustQualityBasedOnPerformance();
            }
        }
        
        // 更新内存使用情况
        this.updateMemoryStats();
    }
    
    /**
     * 更新FPS统计
     */
    updateFPSStats(fps) {
        // 添加到历史记录
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > this.maxHistoryLength) {
            this.fpsHistory.shift();
        }
        
        // 更新统计数据
        this.performanceStats.minFPS = Math.min(this.performanceStats.minFPS, fps);
        this.performanceStats.maxFPS = Math.max(this.performanceStats.maxFPS, fps);
        
        // 计算平均FPS
        if (this.fpsHistory.length > 0) {
            this.performanceStats.averageFPS = 
                this.fpsHistory.reduce((sum, f) => sum + f, 0) / this.fpsHistory.length;
        }
        
        // 检测帧率下降
        if (fps < this.minFPS) {
            this.performanceStats.frameDrops++;
        }
    }
    
    /**
     * 更新内存使用统计
     */
    updateMemoryStats() {
        if (performance.memory) {
            this.performanceStats.memoryUsage = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
    }
    
    /**
     * 测量渲染时间
     */
    measureRenderTime(renderFunction) {
        const startTime = performance.now();
        
        try {
            renderFunction();
        } catch (error) {
            this.handleError('Render Error', error);
        }
        
        const endTime = performance.now();
        this.performanceStats.renderTime = endTime - startTime;
        
        return this.performanceStats.renderTime;
    }
    
    /**
     * 测量更新时间
     */
    measureUpdateTime(updateFunction) {
        const startTime = performance.now();
        
        try {
            updateFunction();
        } catch (error) {
            this.handleError('Update Error', error);
        }
        
        const endTime = performance.now();
        this.performanceStats.updateTime = endTime - startTime;
        
        return this.performanceStats.updateTime;
    }
    
    /**
     * 根据性能调整质量设置
     */
    adjustQualityBasedOnPerformance() {
        const avgFPS = this.performanceStats.averageFPS;
        
        if (avgFPS < 25) {
            // 性能很差，降低到最低质量
            this.setOptimizationLevel('low');
        } else if (avgFPS < 40) {
            // 性能较差，使用中等质量
            this.setOptimizationLevel('medium');
        } else if (avgFPS >= 55) {
            // 性能良好，可以使用高质量
            this.setOptimizationLevel('high');
        }
    }
    
    /**
     * 设置优化级别
     */
    setOptimizationLevel(level) {
        if (this.optimizationLevel === level) return;
        
        this.optimizationLevel = level;
        console.log(`Performance optimization level changed to: ${level}`);
        
        // 触发优化级别变更事件
        const event = new CustomEvent('optimizationLevelChanged', {
            detail: { level: level, stats: this.performanceStats }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 获取优化建议
     */
    getOptimizationRecommendations() {
        const recommendations = [];
        const stats = this.performanceStats;
        
        if (stats.averageFPS < this.minFPS) {
            recommendations.push({
                type: 'fps',
                severity: 'high',
                message: `平均FPS (${stats.averageFPS.toFixed(1)}) 低于最低要求 (${this.minFPS})`,
                suggestions: [
                    '降低渲染质量',
                    '减少同时显示的视觉效果',
                    '优化事件处理逻辑'
                ]
            });
        }
        
        if (stats.renderTime > 16) { // 超过16ms会影响60fps
            recommendations.push({
                type: 'render',
                severity: 'medium',
                message: `渲染时间过长 (${stats.renderTime.toFixed(2)}ms)`,
                suggestions: [
                    '使用对象池减少垃圾回收',
                    '批量处理渲染操作',
                    '减少Canvas绘制调用'
                ]
            });
        }
        
        if (stats.memoryUsage && stats.memoryUsage.used > 50) {
            recommendations.push({
                type: 'memory',
                severity: 'medium',
                message: `内存使用较高 (${stats.memoryUsage.used}MB)`,
                suggestions: [
                    '清理未使用的对象',
                    '优化图像资源',
                    '实施对象池模式'
                ]
            });
        }
        
        if (stats.frameDrops > 10) {
            recommendations.push({
                type: 'stability',
                severity: 'high',
                message: `检测到频繁的帧率下降 (${stats.frameDrops} 次)`,
                suggestions: [
                    '启用自适应质量调整',
                    '检查是否有阻塞操作',
                    '优化游戏循环逻辑'
                ]
            });
        }
        
        return recommendations;
    }
    
    /**
     * 错误处理
     */
    handleError(type, error) {
        this.errorCount++;
        
        const errorInfo = {
            type: type,
            message: error.message,
            stack: error.stack,
            timestamp: Date.now(),
            performanceContext: {
                fps: this.currentFPS,
                memoryUsage: this.performanceStats.memoryUsage
            }
        };
        
        this.errorLog.push(errorInfo);
        
        // 限制错误日志大小
        if (this.errorLog.length > this.maxErrors) {
            this.errorLog.shift();
        }
        
        console.error(`[PerformanceManager] ${type}:`, error);
        
        // 如果错误过多，触发降级模式
        if (this.errorCount > 5) {
            this.setOptimizationLevel('low');
            console.warn('Too many errors detected, switching to low performance mode');
        }
        
        // 触发错误事件
        const event = new CustomEvent('gameError', {
            detail: errorInfo
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        return {
            fps: {
                current: this.currentFPS,
                average: this.performanceStats.averageFPS,
                min: this.performanceStats.minFPS,
                max: this.performanceStats.maxFPS
            },
            timing: {
                render: this.performanceStats.renderTime,
                update: this.performanceStats.updateTime
            },
            memory: this.performanceStats.memoryUsage,
            stability: {
                frameDrops: this.performanceStats.frameDrops,
                errorCount: this.errorCount
            },
            optimization: {
                level: this.optimizationLevel,
                adaptiveQuality: this.adaptiveQuality
            },
            recommendations: this.getOptimizationRecommendations()
        };
    }
    
    /**
     * 重置性能统计
     */
    reset() {
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 0;
        this.fpsHistory = [];
        this.errorCount = 0;
        this.errorLog = [];
        
        this.performanceStats = {
            averageFPS: 0,
            minFPS: Infinity,
            maxFPS: 0,
            frameDrops: 0,
            memoryUsage: 0,
            renderTime: 0,
            updateTime: 0
        };
        
        console.log('PerformanceManager reset');
    }
    
    /**
     * 启用/禁用自适应质量
     */
    setAdaptiveQuality(enabled) {
        this.adaptiveQuality = enabled;
        console.log(`Adaptive quality ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * 获取当前FPS
     */
    getCurrentFPS() {
        return this.currentFPS;
    }
    
    /**
     * 检查性能是否良好
     */
    isPerformanceGood() {
        return this.currentFPS >= this.minFPS && 
               this.performanceStats.renderTime < 16 &&
               this.errorCount < 3;
    }
    
    /**
     * 获取优化级别配置
     */
    getOptimizationConfig() {
        const configs = {
            low: {
                maxParticles: 10,
                enableShadows: false,
                enableBlur: false,
                renderScale: 0.75,
                maxActiveEvents: 2
            },
            medium: {
                maxParticles: 25,
                enableShadows: true,
                enableBlur: false,
                renderScale: 0.9,
                maxActiveEvents: 3
            },
            high: {
                maxParticles: 50,
                enableShadows: true,
                enableBlur: true,
                renderScale: 1.0,
                maxActiveEvents: 4
            }
        };
        
        return configs[this.optimizationLevel] || configs.medium;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceManager;
}