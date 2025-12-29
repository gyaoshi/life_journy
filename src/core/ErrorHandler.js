/**
 * ErrorHandler - 全局错误处理和恢复管理器
 * 负责捕获、记录和处理游戏中的各种错误，提供降级方案
 */
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 50;
        this.errorCounts = new Map();
        this.recoveryStrategies = new Map();
        this.isRecoveryMode = false;
        this.criticalErrorThreshold = 5;
        
        // 错误类型定义
        this.errorTypes = {
            RENDER_ERROR: 'render',
            AUDIO_ERROR: 'audio',
            INPUT_ERROR: 'input',
            STATE_ERROR: 'state',
            NETWORK_ERROR: 'network',
            MEMORY_ERROR: 'memory',
            UNKNOWN_ERROR: 'unknown'
        };
        
        // 初始化全局错误处理
        this.setupGlobalErrorHandling();
        
        // 注册默认恢复策略
        this.registerDefaultRecoveryStrategies();
        
        console.log('ErrorHandler initialized');
    }
    
    /**
     * 设置全局错误处理
     */
    setupGlobalErrorHandling() {
        // 捕获未处理的JavaScript错误
        window.addEventListener('error', (event) => {
            this.handleError(this.errorTypes.UNKNOWN_ERROR, event.error || new Error(event.message), {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // 捕获未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(this.errorTypes.UNKNOWN_ERROR, event.reason, {
                promise: true
            });
        });
        
        // 捕获资源加载错误
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError(this.errorTypes.NETWORK_ERROR, new Error(`Failed to load resource: ${event.target.src || event.target.href}`), {
                    element: event.target.tagName,
                    source: event.target.src || event.target.href
                });
            }
        }, true);
    }
    
    /**
     * 注册默认恢复策略
     */
    registerDefaultRecoveryStrategies() {
        // 渲染错误恢复策略
        this.registerRecoveryStrategy(this.errorTypes.RENDER_ERROR, (error, context) => {
            console.warn('Render error detected, switching to safe rendering mode');
            return {
                action: 'fallback',
                config: {
                    disableEffects: true,
                    simplifiedRendering: true,
                    reducedQuality: true
                }
            };
        });
        
        // 音频错误恢复策略
        this.registerRecoveryStrategy(this.errorTypes.AUDIO_ERROR, (error, context) => {
            console.warn('Audio error detected, disabling audio features');
            return {
                action: 'disable',
                config: {
                    muteAudio: true,
                    disableAudioEffects: true
                }
            };
        });
        
        // 输入错误恢复策略
        this.registerRecoveryStrategy(this.errorTypes.INPUT_ERROR, (error, context) => {
            console.warn('Input error detected, resetting input handlers');
            return {
                action: 'reset',
                config: {
                    reinitializeInput: true,
                    fallbackToMouse: true
                }
            };
        });
        
        // 状态错误恢复策略
        this.registerRecoveryStrategy(this.errorTypes.STATE_ERROR, (error, context) => {
            console.warn('State error detected, attempting state recovery');
            return {
                action: 'recover',
                config: {
                    resetToSafeState: true,
                    preserveScore: true
                }
            };
        });
        
        // 内存错误恢复策略
        this.registerRecoveryStrategy(this.errorTypes.MEMORY_ERROR, (error, context) => {
            console.warn('Memory error detected, performing cleanup');
            return {
                action: 'cleanup',
                config: {
                    forceGarbageCollection: true,
                    clearCaches: true,
                    reduceQuality: true
                }
            };
        });
    }
    
    /**
     * 处理错误
     */
    handleError(type, error, context = {}) {
        const errorInfo = {
            id: this.generateErrorId(),
            type: type,
            message: error.message || 'Unknown error',
            stack: error.stack,
            context: context,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // 记录错误
        this.logError(errorInfo);
        
        // 更新错误计数
        this.updateErrorCount(type);
        
        // 尝试恢复
        const recovery = this.attemptRecovery(type, error, context);
        
        // 检查是否需要进入紧急模式
        this.checkCriticalErrorThreshold();
        
        // 触发错误事件
        this.dispatchErrorEvent(errorInfo, recovery);
        
        return recovery;
    }
    
    /**
     * 记录错误
     */
    logError(errorInfo) {
        this.errorLog.push(errorInfo);
        
        // 限制日志大小
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }
        
        // 输出到控制台
        console.error(`[ErrorHandler] ${errorInfo.type}: ${errorInfo.message}`, errorInfo);
        
        // 如果有外部日志服务，可以在这里发送
        this.sendToExternalLogger(errorInfo);
    }
    
    /**
     * 更新错误计数
     */
    updateErrorCount(type) {
        const count = this.errorCounts.get(type) || 0;
        this.errorCounts.set(type, count + 1);
    }
    
    /**
     * 尝试错误恢复
     */
    attemptRecovery(type, error, context) {
        const strategy = this.recoveryStrategies.get(type);
        
        if (strategy) {
            try {
                const recovery = strategy(error, context);
                console.log(`Recovery strategy applied for ${type}:`, recovery);
                return recovery;
            } catch (recoveryError) {
                console.error('Recovery strategy failed:', recoveryError);
                return this.getDefaultRecovery();
            }
        }
        
        return this.getDefaultRecovery();
    }
    
    /**
     * 获取默认恢复策略
     */
    getDefaultRecovery() {
        return {
            action: 'continue',
            config: {
                logOnly: true
            }
        };
    }
    
    /**
     * 检查关键错误阈值
     */
    checkCriticalErrorThreshold() {
        const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
        
        if (totalErrors >= this.criticalErrorThreshold && !this.isRecoveryMode) {
            this.enterRecoveryMode();
        }
    }
    
    /**
     * 进入恢复模式
     */
    enterRecoveryMode() {
        this.isRecoveryMode = true;
        console.warn('Entering recovery mode due to critical error threshold');
        
        // 触发恢复模式事件
        const event = new CustomEvent('recoveryModeEntered', {
            detail: {
                errorCounts: Object.fromEntries(this.errorCounts),
                totalErrors: Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0)
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 退出恢复模式
     */
    exitRecoveryMode() {
        this.isRecoveryMode = false;
        console.log('Exiting recovery mode');
        
        const event = new CustomEvent('recoveryModeExited');
        document.dispatchEvent(event);
    }
    
    /**
     * 注册恢复策略
     */
    registerRecoveryStrategy(errorType, strategy) {
        this.recoveryStrategies.set(errorType, strategy);
    }
    
    /**
     * 触发错误事件
     */
    dispatchErrorEvent(errorInfo, recovery) {
        const event = new CustomEvent('gameError', {
            detail: {
                error: errorInfo,
                recovery: recovery,
                isRecoveryMode: this.isRecoveryMode
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 生成错误ID
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 发送到外部日志服务
     */
    sendToExternalLogger(errorInfo) {
        // 这里可以集成外部日志服务，如Sentry、LogRocket等
        // 目前只是占位符实现
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: errorInfo.message,
                fatal: false
            });
        }
    }
    
    /**
     * 获取错误统计
     */
    getErrorStats() {
        return {
            totalErrors: this.errorLog.length,
            errorsByType: Object.fromEntries(this.errorCounts),
            recentErrors: this.errorLog.slice(-10),
            isRecoveryMode: this.isRecoveryMode,
            criticalErrorThreshold: this.criticalErrorThreshold
        };
    }
    
    /**
     * 清理错误日志
     */
    clearErrorLog() {
        this.errorLog = [];
        this.errorCounts.clear();
        this.isRecoveryMode = false;
        console.log('Error log cleared');
    }
    
    /**
     * 设置关键错误阈值
     */
    setCriticalErrorThreshold(threshold) {
        this.criticalErrorThreshold = threshold;
    }
    
    /**
     * 安全执行函数
     */
    safeExecute(fn, errorType = this.errorTypes.UNKNOWN_ERROR, context = {}) {
        try {
            return fn();
        } catch (error) {
            this.handleError(errorType, error, context);
            return null;
        }
    }
    
    /**
     * 安全异步执行函数
     */
    async safeExecuteAsync(fn, errorType = this.errorTypes.UNKNOWN_ERROR, context = {}) {
        try {
            return await fn();
        } catch (error) {
            this.handleError(errorType, error, context);
            return null;
        }
    }
    
    /**
     * 创建错误边界包装器
     */
    createErrorBoundary(component, errorType = this.errorTypes.UNKNOWN_ERROR) {
        return (...args) => {
            return this.safeExecute(() => component(...args), errorType, {
                component: component.name || 'anonymous',
                arguments: args
            });
        };
    }
    
    /**
     * 监控函数执行
     */
    monitor(fn, name, errorType = this.errorTypes.UNKNOWN_ERROR) {
        return (...args) => {
            const startTime = performance.now();
            
            try {
                const result = fn(...args);
                const endTime = performance.now();
                
                // 记录性能信息
                if (endTime - startTime > 100) { // 超过100ms的操作
                    console.warn(`Slow operation detected: ${name} took ${(endTime - startTime).toFixed(2)}ms`);
                }
                
                return result;
            } catch (error) {
                this.handleError(errorType, error, {
                    function: name,
                    arguments: args,
                    executionTime: performance.now() - startTime
                });
                return null;
            }
        };
    }
    
    /**
     * 获取错误报告
     */
    generateErrorReport() {
        return {
            summary: {
                totalErrors: this.errorLog.length,
                uniqueErrorTypes: this.errorCounts.size,
                isRecoveryMode: this.isRecoveryMode,
                reportGeneratedAt: new Date().toISOString()
            },
            errorsByType: Object.fromEntries(this.errorCounts),
            recentErrors: this.errorLog.slice(-20),
            systemInfo: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: Date.now()
            }
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}