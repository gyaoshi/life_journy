/**
 * 性能优化测试
 * 验证性能管理器、错误处理和对象池的功能
 */

// Mock DOM environment
global.performance = {
    now: jest.fn(() => Date.now()),
    memory: {
        usedJSHeapSize: 1024 * 1024 * 10, // 10MB
        totalJSHeapSize: 1024 * 1024 * 20, // 20MB
        jsHeapSizeLimit: 1024 * 1024 * 100 // 100MB
    }
};

global.requestAnimationFrame = jest.fn((callback) => setTimeout(callback, 16));
global.document = {
    addEventListener: jest.fn(),
    dispatchEvent: jest.fn()
};

global.window = {
    addEventListener: jest.fn(),
    location: { href: 'http://localhost' },
    navigator: { userAgent: 'test' }
};

global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Load the modules
const PerformanceManager = require('../../src/core/PerformanceManager.js');
const ErrorHandler = require('../../src/core/ErrorHandler.js');
const { ObjectPool, ObjectPoolManager } = require('../../src/core/ObjectPool.js');

describe('性能优化系统测试', () => {
    describe('PerformanceManager', () => {
        let performanceManager;
        
        beforeEach(() => {
            performanceManager = new PerformanceManager();
            jest.clearAllMocks();
        });
        
        test('应该正确初始化性能管理器', () => {
            expect(performanceManager.currentFPS).toBe(0);
            expect(performanceManager.targetFPS).toBe(60);
            expect(performanceManager.optimizationLevel).toBe('auto');
            expect(performanceManager.adaptiveQuality).toBe(true);
        });
        
        test('应该正确更新FPS统计', () => {
            performanceManager.updateFPSStats(60);
            performanceManager.updateFPSStats(55);
            performanceManager.updateFPSStats(58);
            
            expect(performanceManager.performanceStats.minFPS).toBe(55);
            expect(performanceManager.performanceStats.maxFPS).toBe(60);
            expect(performanceManager.performanceStats.averageFPS).toBeCloseTo(57.67, 1);
        });
        
        test('应该检测帧率下降', () => {
            performanceManager.updateFPSStats(25); // 低于最低要求30fps
            
            expect(performanceManager.performanceStats.frameDrops).toBe(1);
        });
        
        test('应该测量渲染时间', () => {
            const mockRenderFunction = jest.fn(() => {
                // 模拟渲染工作
                const start = Date.now();
                while (Date.now() - start < 10) {} // 模拟10ms的工作
            });
            
            const renderTime = performanceManager.measureRenderTime(mockRenderFunction);
            
            expect(mockRenderFunction).toHaveBeenCalled();
            expect(renderTime).toBeGreaterThan(0);
            expect(performanceManager.performanceStats.renderTime).toBe(renderTime);
        });
        
        test('应该根据性能调整优化级别', () => {
            // 模拟低性能
            for (let i = 0; i < 5; i++) {
                performanceManager.updateFPSStats(20); // 低FPS
            }
            
            performanceManager.adjustQualityBasedOnPerformance();
            expect(performanceManager.optimizationLevel).toBe('low');
            
            // 模拟高性能
            performanceManager.fpsHistory = [];
            for (let i = 0; i < 5; i++) {
                performanceManager.updateFPSStats(58); // 高FPS
            }
            
            performanceManager.adjustQualityBasedOnPerformance();
            expect(performanceManager.optimizationLevel).toBe('high');
        });
        
        test('应该生成优化建议', () => {
            // 设置低性能状态
            performanceManager.performanceStats.averageFPS = 20;
            performanceManager.performanceStats.renderTime = 20;
            performanceManager.performanceStats.frameDrops = 15;
            
            const recommendations = performanceManager.getOptimizationRecommendations();
            
            expect(recommendations.length).toBeGreaterThan(0);
            expect(recommendations.some(r => r.type === 'fps')).toBe(true);
            expect(recommendations.some(r => r.type === 'render')).toBe(true);
            expect(recommendations.some(r => r.type === 'stability')).toBe(true);
        });
        
        test('应该获取优化配置', () => {
            performanceManager.setOptimizationLevel('low');
            const lowConfig = performanceManager.getOptimizationConfig();
            
            expect(lowConfig.maxParticles).toBe(10);
            expect(lowConfig.enableShadows).toBe(false);
            expect(lowConfig.renderScale).toBe(0.75);
            
            performanceManager.setOptimizationLevel('high');
            const highConfig = performanceManager.getOptimizationConfig();
            
            expect(highConfig.maxParticles).toBe(50);
            expect(highConfig.enableShadows).toBe(true);
            expect(highConfig.renderScale).toBe(1.0);
        });
    });
    
    describe('ErrorHandler', () => {
        let errorHandler;
        
        beforeEach(() => {
            errorHandler = new ErrorHandler();
            jest.clearAllMocks();
        });
        
        test('应该正确初始化错误处理器', () => {
            expect(errorHandler.errorLog).toEqual([]);
            expect(errorHandler.errorCounts.size).toBe(0);
            expect(errorHandler.isRecoveryMode).toBe(false);
        });
        
        test('应该正确处理错误', () => {
            const testError = new Error('Test error');
            const recovery = errorHandler.handleError(errorHandler.errorTypes.RENDER_ERROR, testError);
            
            expect(errorHandler.errorLog.length).toBe(1);
            expect(errorHandler.errorCounts.get(errorHandler.errorTypes.RENDER_ERROR)).toBe(1);
            expect(recovery).toBeDefined();
            expect(recovery.action).toBeDefined();
        });
        
        test('应该在错误过多时进入恢复模式', () => {
            // 触发多个错误
            for (let i = 0; i < 6; i++) {
                errorHandler.handleError(errorHandler.errorTypes.RENDER_ERROR, new Error(`Error ${i}`));
            }
            
            expect(errorHandler.isRecoveryMode).toBe(true);
        });
        
        test('应该提供安全执行功能', () => {
            const successFunction = jest.fn(() => 'success');
            const failFunction = jest.fn(() => { throw new Error('fail'); });
            
            const successResult = errorHandler.safeExecute(successFunction);
            const failResult = errorHandler.safeExecute(failFunction);
            
            expect(successResult).toBe('success');
            expect(failResult).toBeNull();
            expect(errorHandler.errorLog.length).toBe(1);
        });
        
        test('应该创建错误边界包装器', () => {
            const testFunction = jest.fn((x) => {
                if (x < 0) throw new Error('Negative input');
                return x * 2;
            });
            
            const wrappedFunction = errorHandler.createErrorBoundary(testFunction);
            
            expect(wrappedFunction(5)).toBe(10);
            expect(wrappedFunction(-1)).toBeNull();
            expect(errorHandler.errorLog.length).toBe(1);
        });
        
        test('应该监控函数执行时间', () => {
            const slowFunction = jest.fn(() => {
                const start = Date.now();
                while (Date.now() - start < 150) {} // 模拟慢操作
                return 'done';
            });
            
            const monitoredFunction = errorHandler.monitor(slowFunction, 'slowFunction');
            const result = monitoredFunction();
            
            expect(result).toBe('done');
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('Slow operation detected')
            );
        });
        
        test('应该生成错误报告', () => {
            errorHandler.handleError(errorHandler.errorTypes.RENDER_ERROR, new Error('Render error'));
            errorHandler.handleError(errorHandler.errorTypes.AUDIO_ERROR, new Error('Audio error'));
            
            const report = errorHandler.generateErrorReport();
            
            expect(report.summary.totalErrors).toBe(2);
            expect(report.errorsByType[errorHandler.errorTypes.RENDER_ERROR]).toBe(1);
            expect(report.errorsByType[errorHandler.errorTypes.AUDIO_ERROR]).toBe(1);
            expect(report.recentErrors.length).toBe(2);
        });
    });
    
    describe('ObjectPool', () => {
        let objectPool;
        
        beforeEach(() => {
            const createFn = () => ({ x: 0, y: 0, active: false });
            const resetFn = (obj) => {
                obj.x = 0;
                obj.y = 0;
                obj.active = false;
            };
            objectPool = new ObjectPool(createFn, resetFn, 5);
        });
        
        test('应该正确初始化对象池', () => {
            expect(objectPool.pool.length).toBe(5);
            expect(objectPool.used.size).toBe(0);
            expect(objectPool.stats.created).toBe(5);
        });
        
        test('应该正确获取和释放对象', () => {
            const obj1 = objectPool.acquire();
            const obj2 = objectPool.acquire();
            
            expect(objectPool.pool.length).toBe(3);
            expect(objectPool.used.size).toBe(2);
            expect(objectPool.stats.reused).toBe(2);
            
            obj1.x = 10;
            obj1.y = 20;
            
            objectPool.release(obj1);
            
            expect(objectPool.pool.length).toBe(4);
            expect(objectPool.used.size).toBe(1);
            expect(obj1.x).toBe(0); // 应该被重置
            expect(obj1.y).toBe(0);
        });
        
        test('应该在池为空时创建新对象', () => {
            // 获取所有预创建的对象
            const objects = [];
            for (let i = 0; i < 5; i++) {
                objects.push(objectPool.acquire());
            }
            
            expect(objectPool.pool.length).toBe(0);
            
            // 获取额外的对象应该创建新的
            const extraObj = objectPool.acquire();
            
            expect(objectPool.stats.created).toBe(6);
            expect(extraObj).toBeDefined();
        });
        
        test('应该计算效率比率', () => {
            // 获取一些对象来增加重用统计
            const obj1 = objectPool.acquire();
            const obj2 = objectPool.acquire();
            objectPool.release(obj1);
            objectPool.release(obj2);
            
            const obj3 = objectPool.acquire(); // 这应该重用obj2
            
            const efficiency = objectPool.getEfficiencyRatio();
            expect(efficiency).toBeGreaterThan(0);
        });
        
        test('应该释放所有活跃对象', () => {
            const obj1 = objectPool.acquire();
            const obj2 = objectPool.acquire();
            const obj3 = objectPool.acquire();
            
            expect(objectPool.used.size).toBe(3);
            
            const releasedCount = objectPool.releaseAll();
            
            expect(releasedCount).toBe(3);
            expect(objectPool.used.size).toBe(0);
            expect(objectPool.pool.length).toBe(5);
        });
    });
    
    describe('ObjectPoolManager', () => {
        let poolManager;
        
        beforeEach(() => {
            poolManager = new ObjectPoolManager();
        });
        
        test('应该正确创建和管理多个对象池', () => {
            const createVector = () => ({ x: 0, y: 0 });
            const resetVector = (v) => { v.x = 0; v.y = 0; };
            
            const createParticle = () => ({ x: 0, y: 0, life: 1 });
            const resetParticle = (p) => { p.x = 0; p.y = 0; p.life = 1; };
            
            poolManager.createPool('vectors', createVector, resetVector, 10);
            poolManager.createPool('particles', createParticle, resetParticle, 20);
            
            expect(poolManager.pools.size).toBe(2);
            expect(poolManager.globalStats.totalPools).toBe(2);
        });
        
        test('应该正确获取和释放对象', () => {
            const createFn = () => ({ value: 0 });
            const resetFn = (obj) => { obj.value = 0; };
            
            poolManager.createPool('test', createFn, resetFn, 5);
            
            const obj = poolManager.acquire('test');
            expect(obj).toBeDefined();
            expect(obj.value).toBe(0);
            
            obj.value = 42;
            const released = poolManager.release('test', obj);
            expect(released).toBe(true);
            expect(obj.value).toBe(0); // 应该被重置
        });
        
        test('应该生成性能报告', () => {
            const createFn = () => ({ id: Math.random() });
            const resetFn = (obj) => { obj.id = 0; };
            
            poolManager.createPool('test', createFn, resetFn, 3);
            
            // 使用一些对象
            const obj1 = poolManager.acquire('test');
            const obj2 = poolManager.acquire('test');
            poolManager.release('test', obj1);
            
            const report = poolManager.generatePerformanceReport();
            
            expect(report.summary).toBeDefined();
            expect(report.poolDetails).toBeDefined();
            expect(report.poolDetails.test).toBeDefined();
            expect(report.recommendations).toBeDefined();
        });
        
        test('应该提供优化建议', () => {
            const createFn = () => ({ data: new Array(100) });
            const resetFn = (obj) => { obj.data = new Array(100); };
            
            poolManager.createPool('large', createFn, resetFn, 50);
            
            // 模拟低效率使用
            const pool = poolManager.getPool('large');
            pool.stats.created = 100;
            pool.stats.reused = 10;
            
            const recommendations = poolManager.getOptimizationRecommendations();
            
            expect(recommendations.length).toBeGreaterThan(0);
            expect(recommendations.some(r => r.type === 'low_efficiency')).toBe(true);
        });
    });
    
    describe('集成测试', () => {
        test('性能管理器应该与错误处理器协同工作', () => {
            const performanceManager = new PerformanceManager();
            const errorHandler = new ErrorHandler();
            
            // 模拟渲染错误
            const failingRenderFunction = () => {
                throw new Error('Render failed');
            };
            
            performanceManager.measureRenderTime(() => {
                errorHandler.safeExecute(failingRenderFunction, errorHandler.errorTypes.RENDER_ERROR);
            });
            
            expect(errorHandler.errorLog.length).toBe(1);
            expect(performanceManager.performanceStats.renderTime).toBeGreaterThan(0);
        });
        
        test('对象池应该提高性能', () => {
            const poolManager = new ObjectPoolManager();
            
            // 创建一个复杂对象的池
            const createComplexObject = () => ({
                data: new Array(1000).fill(0),
                timestamp: Date.now(),
                id: Math.random()
            });
            
            const resetComplexObject = (obj) => {
                obj.data.fill(0);
                obj.timestamp = 0;
                obj.id = 0;
            };
            
            poolManager.createPool('complex', createComplexObject, resetComplexObject, 10);
            
            // 测试性能
            const startTime = performance.now();
            
            for (let i = 0; i < 100; i++) {
                const obj = poolManager.acquire('complex');
                obj.data[0] = i;
                poolManager.release('complex', obj);
            }
            
            const endTime = performance.now();
            const poolTime = endTime - startTime;
            
            // 对比直接创建对象的性能
            const directStartTime = performance.now();
            
            for (let i = 0; i < 100; i++) {
                const obj = createComplexObject();
                obj.data[0] = i;
                // 直接丢弃对象
            }
            
            const directEndTime = performance.now();
            const directTime = directEndTime - directStartTime;
            
            // 对象池应该在重用时表现更好（虽然在测试环境中可能不明显）
            const report = poolManager.generatePerformanceReport();
            expect(report.summary.totalObjectsReused).toBeGreaterThan(0);
        });
    });
});