/**
 * 特效渲染器测试
 * 测试渲染性能、视觉效果正确性和浏览器兼容性
 */

// 模拟Canvas和Context
class MockContext {
    constructor() {
        this.fillStyle = '#000000';
        this.strokeStyle = '#000000';
        this.lineWidth = 1;
        this.globalAlpha = 1;
        this.globalCompositeOperation = 'source-over';
        this.calls = [];
    }
    
    // 记录所有调用
    _recordCall(method, args) {
        this.calls.push({ method, args: Array.from(args) });
    }
    
    clearRect(...args) { this._recordCall('clearRect', args); }
    fillRect(...args) { this._recordCall('fillRect', args); }
    strokeRect(...args) { this._recordCall('strokeRect', args); }
    beginPath(...args) { this._recordCall('beginPath', args); }
    closePath(...args) { this._recordCall('closePath', args); }
    moveTo(...args) { this._recordCall('moveTo', args); }
    lineTo(...args) { this._recordCall('lineTo', args); }
    arc(...args) { this._recordCall('arc', args); }
    ellipse(...args) { this._recordCall('ellipse', args); }
    bezierCurveTo(...args) { this._recordCall('bezierCurveTo', args); }
    fill(...args) { this._recordCall('fill', args); }
    stroke(...args) { this._recordCall('stroke', args); }
    save(...args) { this._recordCall('save', args); }
    restore(...args) { this._recordCall('restore', args); }
    translate(...args) { this._recordCall('translate', args); }
    rotate(...args) { this._recordCall('rotate', args); }
    scale(...args) { this._recordCall('scale', args); }
    
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
        this._recordCall('createRadialGradient', [x0, y0, r0, x1, y1, r1]);
        return new MockGradient();
    }
    
    createLinearGradient(x0, y0, x1, y1) {
        this._recordCall('createLinearGradient', [x0, y0, x1, y1]);
        return new MockGradient();
    }
    
    getCallCount(method) {
        return this.calls.filter(call => call.method === method).length;
    }
    
    getLastCall(method) {
        const calls = this.calls.filter(call => call.method === method);
        return calls[calls.length - 1];
    }
    
    clearCalls() {
        this.calls = [];
    }
}

class MockGradient {
    constructor() {
        this.colorStops = [];
    }
    
    addColorStop(offset, color) {
        this.colorStops.push({ offset, color });
    }
}

// 导入EffectRenderer
import { EffectRenderer } from '../core/EffectRenderer.js';

/**
 * 测试套件：特效渲染器核心功能
 */
describe('EffectRenderer Core Tests', () => {
    let ctx, renderer;
    
    beforeEach(() => {
        ctx = new MockContext();
        renderer = new EffectRenderer(ctx, {
            enableBatching: true,
            maxBatchSize: 1000,
            enableBlending: true
        });
    });
    
    /**
     * 测试渲染器初始化
     */
    test('should initialize renderer correctly', () => {
        expect(renderer).toBeDefined();
        expect(renderer.ctx).toBe(ctx);
        expect(renderer.options.enableBatching).toBe(true);
        expect(renderer.options.maxBatchSize).toBe(1000);
        expect(renderer.currentBlendMode).toBe('source-over');
    });
    
    /**
     * 测试混合模式设置
     */
    test('should set blend modes correctly', () => {
        renderer.setBlendMode('multiply');
        expect(ctx.globalCompositeOperation).toBe('multiply');
        expect(renderer.currentBlendMode).toBe('multiply');
        
        renderer.setBlendMode('screen');
        expect(ctx.globalCompositeOperation).toBe('screen');
        expect(renderer.currentBlendMode).toBe('screen');
        
        renderer.setBlendMode('normal');
        expect(ctx.globalCompositeOperation).toBe('source-over');
        expect(renderer.currentBlendMode).toBe('source-over');
    });
});

/**
 * 测试套件：粒子渲染功能
 */
describe('Particle Rendering Tests', () => {
    let ctx, renderer;
    
    beforeEach(() => {
        ctx = new MockContext();
        renderer = new EffectRenderer(ctx);
    });
    
    /**
     * 测试圆形粒子渲染
     */
    test('should render circle particles correctly', () => {
        const particles = [
            { type: 'circle', x: 100, y: 100, size: 10, color: '#ff0000', opacity: 1 },
            { type: 'circle', x: 200, y: 200, size: 15, color: '#00ff00', opacity: 0.8 }
        ];
        
        renderer.renderParticles(particles);
        
        // 验证渲染调用
        expect(ctx.getCallCount('save')).toBeGreaterThan(0);
        expect(ctx.getCallCount('restore')).toBeGreaterThan(0);
        expect(ctx.getCallCount('arc')).toBeGreaterThan(0);
        expect(ctx.getCallCount('fill')).toBeGreaterThan(0);
    });
    
    /**
     * 测试心形粒子渲染
     */
    test('should render heart particles correctly', () => {
        const particles = [
            { type: 'heart', x: 100, y: 100, size: 20, color: '#ff69b4', opacity: 1 }
        ];
        
        renderer.renderParticles(particles);
        
        // 验证心形路径绘制
        expect(ctx.getCallCount('beginPath')).toBeGreaterThan(0);
        expect(ctx.getCallCount('bezierCurveTo')).toBeGreaterThan(0);
        expect(ctx.getCallCount('fill')).toBeGreaterThan(0);
    });
    
    /**
     * 测试星形粒子渲染
     */
    test('should render star particles correctly', () => {
        const particles = [
            { type: 'star', x: 150, y: 150, size: 25, color: '#ffd700', opacity: 1, spikes: 5 }
        ];
        
        renderer.renderParticles(particles);
        
        // 验证星形路径绘制
        expect(ctx.getCallCount('beginPath')).toBeGreaterThan(0);
        expect(ctx.getCallCount('moveTo')).toBeGreaterThan(0);
        expect(ctx.getCallCount('lineTo')).toBeGreaterThan(0);
        expect(ctx.getCallCount('closePath')).toBeGreaterThan(0);
        expect(ctx.getCallCount('fill')).toBeGreaterThan(0);
    });
    
    /**
     * 测试闪光粒子渲染
     */
    test('should render sparkle particles correctly', () => {
        const particles = [
            { type: 'sparkle', x: 175, y: 175, size: 12, color: '#ffffff', opacity: 1, thickness: 3 }
        ];
        
        renderer.renderParticles(particles);
        
        // 验证闪光线条绘制
        expect(ctx.getCallCount('beginPath')).toBeGreaterThan(0);
        expect(ctx.getCallCount('moveTo')).toBeGreaterThan(0);
        expect(ctx.getCallCount('lineTo')).toBeGreaterThan(0);
        expect(ctx.getCallCount('stroke')).toBeGreaterThan(0);
    });
    
    /**
     * 测试批量渲染
     */
    test('should batch render particles efficiently', () => {
        const particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push({
                type: 'circle',
                x: i * 10,
                y: i * 10,
                size: 5,
                color: '#0000ff',
                opacity: 1
            });
        }
        
        ctx.clearCalls();
        renderer.renderParticles(particles, { batchByType: true });
        
        // 批量渲染应该减少save/restore调用次数
        const saveCount = ctx.getCallCount('save');
        const restoreCount = ctx.getCallCount('restore');
        
        expect(saveCount).toBeLessThan(particles.length);
        expect(restoreCount).toBeLessThan(particles.length);
        expect(saveCount).toBe(restoreCount);
    });
});

/**
 * 测试套件：光效渲染功能
 */
describe('Light Effects Rendering Tests', () => {
    let ctx, renderer;
    
    beforeEach(() => {
        ctx = new MockContext();
        renderer = new EffectRenderer(ctx);
    });
    
    /**
     * 测试光晕效果渲染
     */
    test('should render glow effects correctly', () => {
        const glowConfig = {
            x: 200,
            y: 200,
            radius: 50,
            color: 'rgba(255, 255, 0, 0.8)',
            intensity: 1,
            innerRadius: 10
        };
        
        renderer.renderGlow(glowConfig);
        
        // 验证径向渐变和圆形绘制
        expect(ctx.getCallCount('createRadialGradient')).toBe(1);
        expect(ctx.getCallCount('arc')).toBe(1);
        expect(ctx.getCallCount('fill')).toBe(1);
    });
    
    /**
     * 测试聚光灯效果渲染
     */
    test('should render spotlight effects correctly', () => {
        const spotlightConfig = {
            x: 300,
            y: 300,
            radius: 100,
            angle: Math.PI / 4,
            spread: Math.PI / 6,
            color: 'rgba(255, 255, 255, 0.6)',
            intensity: 0.8
        };
        
        renderer.renderSpotlight(spotlightConfig);
        
        // 验证扇形路径和渐变
        expect(ctx.getCallCount('save')).toBe(1);
        expect(ctx.getCallCount('translate')).toBe(1);
        expect(ctx.getCallCount('rotate')).toBe(1);
        expect(ctx.getCallCount('arc')).toBe(1);
        expect(ctx.getCallCount('createRadialGradient')).toBe(1);
        expect(ctx.getCallCount('restore')).toBe(1);
    });
    
    /**
     * 测试光线效果渲染
     */
    test('should render ray effects correctly', () => {
        const raysConfig = {
            x: 400,
            y: 400,
            rays: [
                { startX: 0, startY: 0, endX: 50, endY: 0 },
                { startX: 0, startY: 0, endX: 0, endY: 50 },
                { startX: 0, startY: 0, endX: -50, endY: 0 },
                { startX: 0, startY: 0, endX: 0, endY: -50 }
            ],
            color: 'rgba(255, 215, 0, 0.9)',
            intensity: 1
        };
        
        renderer.renderRays(raysConfig);
        
        // 验证光线绘制
        expect(ctx.getCallCount('save')).toBe(1);
        expect(ctx.getCallCount('translate')).toBe(1);
        expect(ctx.getCallCount('beginPath')).toBe(raysConfig.rays.length);
        expect(ctx.getCallCount('moveTo')).toBe(raysConfig.rays.length);
        expect(ctx.getCallCount('lineTo')).toBe(raysConfig.rays.length);
        expect(ctx.getCallCount('stroke')).toBe(raysConfig.rays.length);
        expect(ctx.getCallCount('restore')).toBe(1);
    });
    
    /**
     * 测试爆发效果渲染
     */
    test('should render burst effects correctly', () => {
        const burstConfig = {
            x: 500,
            y: 500,
            radius: 75,
            particles: [
                { angle: 0, color: '#ff0000', size: 5 },
                { angle: Math.PI / 2, color: '#00ff00', size: 5 },
                { angle: Math.PI, color: '#0000ff', size: 5 },
                { angle: 3 * Math.PI / 2, color: '#ffff00', size: 5 }
            ],
            color: 'rgba(255, 100, 0, 0.8)',
            intensity: 1
        };
        
        renderer.renderBurst(burstConfig);
        
        // 验证爆发圆圈和粒子绘制
        expect(ctx.getCallCount('save')).toBe(1);
        expect(ctx.getCallCount('translate')).toBe(1);
        expect(ctx.getCallCount('arc')).toBeGreaterThan(1); // 圆圈 + 粒子
        expect(ctx.getCallCount('stroke')).toBe(1); // 爆发圆圈
        expect(ctx.getCallCount('fill')).toBe(burstConfig.particles.length); // 粒子
        expect(ctx.getCallCount('restore')).toBe(1);
    });
    
    /**
     * 测试光效数组渲染
     */
    test('should render multiple light effects', () => {
        const lights = [
            { type: 'glow', x: 100, y: 100, radius: 30, color: 'rgba(255, 0, 0, 0.5)' },
            { type: 'glow', x: 200, y: 200, radius: 40, color: 'rgba(0, 255, 0, 0.5)' },
            { type: 'glow', x: 300, y: 300, radius: 50, color: 'rgba(0, 0, 255, 0.5)' }
        ];
        
        renderer.renderLightEffects(lights, { blendMode: 'screen' });
        
        // 验证混合模式设置和多个光效渲染
        expect(ctx.globalCompositeOperation).toBe('screen');
        expect(ctx.getCallCount('createRadialGradient')).toBe(lights.length);
        expect(ctx.getCallCount('arc')).toBe(lights.length);
        expect(ctx.getCallCount('fill')).toBe(lights.length);
    });
});

/**
 * 测试套件：性能基准测试
 */
describe('Performance Benchmark Tests', () => {
    let ctx, renderer;
    
    beforeEach(() => {
        ctx = new MockContext();
        renderer = new EffectRenderer(ctx, { enableBatching: true });
    });
    
    /**
     * 测试大量粒子渲染性能
     */
    test('should handle large number of particles efficiently', () => {
        const particleCount = 1000;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                type: 'circle',
                x: Math.random() * 800,
                y: Math.random() * 600,
                size: Math.random() * 10 + 2,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                opacity: Math.random() * 0.8 + 0.2
            });
        }
        
        const startTime = performance.now();
        renderer.renderParticles(particles, { batchByType: true });
        const endTime = performance.now();
        
        const renderTime = endTime - startTime;
        
        // 渲染时间应该在合理范围内（这里设置为100ms，实际可能更快）
        expect(renderTime).toBeLessThan(100);
        
        // 验证批量渲染统计
        const stats = renderer.getRenderStats();
        expect(stats.batchedCalls).toBeGreaterThan(0);
    });
    
    /**
     * 测试渲染统计功能
     */
    test('should track render statistics correctly', () => {
        const particles = [
            { type: 'circle', x: 100, y: 100, size: 10, color: '#ff0000' },
            { type: 'heart', x: 200, y: 200, size: 15, color: '#ff69b4' }
        ];
        
        renderer.resetStats();
        renderer.renderParticles(particles, { batchByType: true });
        
        const stats = renderer.getRenderStats();
        expect(stats.batchedCalls).toBeGreaterThan(0);
        expect(typeof stats.cacheSize).toBe('number');
        expect(typeof stats.queueSize).toBe('number');
    });
    
    /**
     * 测试缓存性能
     */
    test('should use gradient cache for performance', () => {
        const glowConfig = {
            x: 200,
            y: 200,
            radius: 50,
            color: 'rgba(255, 255, 0, 0.8)',
            innerRadius: 10
        };
        
        // 第一次渲染
        renderer.renderGlow(glowConfig);
        const firstCallCount = ctx.getCallCount('createRadialGradient');
        
        // 第二次渲染相同配置
        renderer.renderGlow(glowConfig);
        const secondCallCount = ctx.getCallCount('createRadialGradient');
        
        // 第二次应该使用缓存，不创建新的渐变
        expect(secondCallCount).toBe(firstCallCount);
    });
});

/**
 * 测试套件：浏览器兼容性测试
 */
describe('Browser Compatibility Tests', () => {
    let ctx, renderer;
    
    beforeEach(() => {
        ctx = new MockContext();
        renderer = new EffectRenderer(ctx);
    });
    
    /**
     * 测试混合模式兼容性
     */
    test('should handle unsupported blend modes gracefully', () => {
        // 测试标准混合模式
        expect(() => renderer.setBlendMode('multiply')).not.toThrow();
        expect(() => renderer.setBlendMode('screen')).not.toThrow();
        expect(() => renderer.setBlendMode('overlay')).not.toThrow();
        
        // 测试自定义混合模式
        expect(() => renderer.setBlendMode('custom-mode')).not.toThrow();
    });
    
    /**
     * 测试Canvas API兼容性
     */
    test('should work with basic Canvas 2D API', () => {
        const particles = [
            { type: 'circle', x: 100, y: 100, size: 10, color: '#ff0000' }
        ];
        
        // 基本渲染不应该抛出错误
        expect(() => renderer.renderParticles(particles)).not.toThrow();
        
        const glowConfig = {
            x: 200, y: 200, radius: 50, color: 'rgba(255, 255, 0, 0.8)'
        };
        
        expect(() => renderer.renderGlow(glowConfig)).not.toThrow();
    });
    
    /**
     * 测试性能API兼容性
     */
    test('should handle missing performance API', () => {
        // 模拟没有performance.now的环境
        const originalPerformance = global.performance;
        global.performance = undefined;
        
        // 渲染应该仍然工作
        const particles = [
            { type: 'circle', x: 100, y: 100, size: 10, color: '#ff0000' }
        ];
        
        expect(() => renderer.renderParticles(particles)).not.toThrow();
        
        // 恢复performance对象
        global.performance = originalPerformance;
    });
});

/**
 * 测试套件：视觉效果正确性验证
 */
describe('Visual Effects Correctness Tests', () => {
    let ctx, renderer;
    
    beforeEach(() => {
        ctx = new MockContext();
        renderer = new EffectRenderer(ctx);
    });
    
    /**
     * 测试粒子属性正确应用
     */
    test('should apply particle properties correctly', () => {
        const particle = {
            type: 'circle',
            x: 150,
            y: 250,
            size: 20,
            color: '#ff6600',
            opacity: 0.7,
            rotation: Math.PI / 4,
            scale: 1.5
        };
        
        renderer.renderSingleParticle(particle);
        
        // 验证变换应用
        expect(ctx.getCallCount('save')).toBe(1);
        expect(ctx.getCallCount('translate')).toBe(1);
        expect(ctx.getCallCount('rotate')).toBe(1);
        expect(ctx.getCallCount('scale')).toBe(1);
        expect(ctx.getCallCount('restore')).toBe(1);
        
        // 验证样式设置
        expect(ctx.fillStyle).toBe(particle.color);
        expect(ctx.globalAlpha).toBe(particle.opacity);
    });
    
    /**
     * 测试光效参数正确应用
     */
    test('should apply light effect parameters correctly', () => {
        const glowConfig = {
            x: 300,
            y: 400,
            radius: 60,
            color: 'rgba(0, 255, 255, 0.9)',
            intensity: 0.5,
            innerRadius: 20
        };
        
        renderer.renderGlow(glowConfig);
        
        // 验证渐变参数
        const gradientCall = ctx.getLastCall('createRadialGradient');
        expect(gradientCall.args[0]).toBe(glowConfig.x); // x0
        expect(gradientCall.args[1]).toBe(glowConfig.y); // y0
        expect(gradientCall.args[2]).toBe(glowConfig.innerRadius); // r0
        expect(gradientCall.args[3]).toBe(glowConfig.x); // x1
        expect(gradientCall.args[4]).toBe(glowConfig.y); // y1
        expect(gradientCall.args[5]).toBe(glowConfig.radius); // r1
        
        // 验证透明度设置
        expect(ctx.globalAlpha).toBe(glowConfig.intensity);
    });
    
    /**
     * 测试混合模式正确性
     */
    test('should apply blend modes correctly', () => {
        const particles = [
            { type: 'circle', x: 100, y: 100, size: 10, color: '#ff0000' }
        ];
        
        // 测试不同混合模式
        renderer.renderParticles(particles, { blendMode: 'multiply' });
        expect(ctx.globalCompositeOperation).toBe('multiply');
        
        renderer.renderParticles(particles, { blendMode: 'screen' });
        expect(ctx.globalCompositeOperation).toBe('screen');
        
        renderer.renderParticles(particles, { blendMode: 'normal' });
        expect(ctx.globalCompositeOperation).toBe('source-over');
    });
});

// 运行测试
console.log('EffectRenderer tests completed');