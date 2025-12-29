/**
 * 特效渲染器 - 负责各种视觉特效的高性能渲染
 * @author Animation System Team
 * @version 1.0.0
 */

export class EffectRenderer {
    constructor(context, options = {}) {
        this.ctx = context;
        this.options = {
            enableBatching: true,
            maxBatchSize: 1000,
            enableBlending: true,
            ...options
        };
        
        // 渲染状态
        this.currentBlendMode = 'source-over';
        this.renderQueue = [];
        this.batchedCalls = 0;
        
        // 缓存
        this.gradientCache = new Map();
        this.pathCache = new Map();
        
        this.init();
    }
    
    /**
     * 初始化渲染器
     */
    init() {
        this.setupBlendModes();
        console.log('EffectRenderer initialized');
    }
    
    /**
     * 设置混合模式
     */
    setupBlendModes() {
        this.blendModes = {
            normal: 'source-over',
            multiply: 'multiply',
            screen: 'screen',
            overlay: 'overlay',
            softLight: 'soft-light',
            hardLight: 'hard-light',
            colorDodge: 'color-dodge',
            colorBurn: 'color-burn',
            darken: 'darken',
            lighten: 'lighten',
            difference: 'difference',
            exclusion: 'exclusion'
        };
    }
    
    /**
     * 设置混合模式
     * @param {string} mode - 混合模式
     */
    setBlendMode(mode) {
        const blendMode = this.blendModes[mode] || mode;
        if (this.currentBlendMode !== blendMode) {
            this.flushRenderQueue(); // 先渲染队列中的内容
            this.ctx.globalCompositeOperation = blendMode;
            this.currentBlendMode = blendMode;
        }
    }
    
    /**
     * 渲染粒子系统
     * @param {Array} particles - 粒子数组
     * @param {Object} options - 渲染选项
     */
    renderParticles(particles, options = {}) {
        if (!particles || particles.length === 0) return;
        
        const {
            blendMode = 'normal',
            batchByType = true,
            enableGlow = false
        } = options;
        
        this.setBlendMode(blendMode);
        
        if (batchByType && this.options.enableBatching) {
            this.renderParticlesBatched(particles, options);
        } else {
            this.renderParticlesIndividual(particles, options);
        }
    }
    
    /**
     * 批量渲染粒子
     */
    renderParticlesBatched(particles, options) {
        // 按类型分组
        const particleGroups = new Map();
        
        particles.forEach(particle => {
            const key = `${particle.type}_${particle.color}_${particle.size}`;
            if (!particleGroups.has(key)) {
                particleGroups.set(key, []);
            }
            particleGroups.get(key).push(particle);
        });
        
        // 批量渲染每组
        particleGroups.forEach((group, key) => {
            this.renderParticleGroup(group, options);
        });
    }
    
    /**
     * 渲染粒子组
     */
    renderParticleGroup(particles, options) {
        if (particles.length === 0) return;
        
        const firstParticle = particles[0];
        
        this.ctx.save();
        this.ctx.fillStyle = firstParticle.color;
        this.ctx.globalAlpha = firstParticle.opacity || 1;
        
        particles.forEach(particle => {
            if (particle.opacity !== undefined) {
                this.ctx.globalAlpha = particle.opacity;
            }
            
            switch (particle.type) {
                case 'circle':
                    this.renderCircleParticle(particle);
                    break;
                case 'heart':
                    this.renderHeartParticle(particle);
                    break;
                case 'star':
                    this.renderStarParticle(particle);
                    break;
                case 'sparkle':
                    this.renderSparkleParticle(particle);
                    break;
                default:
                    this.renderCircleParticle(particle);
            }
        });
        
        this.ctx.restore();
        this.batchedCalls++;
    }
    
    /**
     * 单独渲染粒子
     */
    renderParticlesIndividual(particles, options) {
        particles.forEach(particle => {
            this.renderSingleParticle(particle, options);
        });
    }
    
    /**
     * 渲染单个粒子
     */
    renderSingleParticle(particle, options) {
        this.ctx.save();
        
        this.ctx.translate(particle.x, particle.y);
        if (particle.rotation) {
            this.ctx.rotate(particle.rotation);
        }
        if (particle.scale) {
            this.ctx.scale(particle.scale, particle.scale);
        }
        
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = particle.opacity || 1;
        
        switch (particle.type) {
            case 'circle':
                this.renderCircleParticle(particle);
                break;
            case 'heart':
                this.renderHeartParticle(particle);
                break;
            case 'star':
                this.renderStarParticle(particle);
                break;
            case 'sparkle':
                this.renderSparkleParticle(particle);
                break;
            default:
                this.renderCircleParticle(particle);
        }
        
        this.ctx.restore();
    }
    
    /**
     * 渲染圆形粒子
     */
    renderCircleParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * 渲染心形粒子
     */
    renderHeartParticle(particle) {
        const size = particle.size;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, size * 0.3);
        
        // 左半心
        this.ctx.bezierCurveTo(-size * 0.5, -size * 0.2, -size, -size * 0.2, -size, size * 0.3);
        this.ctx.bezierCurveTo(-size, size * 0.8, 0, size * 1.2, 0, size * 1.5);
        
        // 右半心
        this.ctx.bezierCurveTo(0, size * 1.2, size, size * 0.8, size, size * 0.3);
        this.ctx.bezierCurveTo(size, -size * 0.2, size * 0.5, -size * 0.2, 0, size * 0.3);
        
        this.ctx.fill();
    }
    
    /**
     * 渲染星形粒子
     */
    renderStarParticle(particle) {
        const size = particle.size;
        const spikes = particle.spikes || 5;
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        this.ctx.beginPath();
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * 渲染闪光粒子
     */
    renderSparkleParticle(particle) {
        const size = particle.size;
        
        // 十字闪光
        this.ctx.beginPath();
        this.ctx.moveTo(-size, 0);
        this.ctx.lineTo(size, 0);
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(0, size);
        
        // 对角线闪光
        const diagonalSize = size * 0.7;
        this.ctx.moveTo(-diagonalSize, -diagonalSize);
        this.ctx.lineTo(diagonalSize, diagonalSize);
        this.ctx.moveTo(-diagonalSize, diagonalSize);
        this.ctx.lineTo(diagonalSize, -diagonalSize);
        
        this.ctx.lineWidth = particle.thickness || 2;
        this.ctx.stroke();
    }
    
    /**
     * 渲染光效
     * @param {Array} lights - 光效数组
     * @param {Object} options - 渲染选项
     */
    renderLightEffects(lights, options = {}) {
        if (!lights || lights.length === 0) return;
        
        const { blendMode = 'screen' } = options;
        this.setBlendMode(blendMode);
        
        lights.forEach(light => {
            this.renderSingleLight(light);
        });
    }
    
    /**
     * 渲染单个光效
     */
    renderSingleLight(light) {
        this.ctx.save();
        
        switch (light.type) {
            case 'glow':
                this.renderGlow(light);
                break;
            case 'spotlight':
                this.renderSpotlight(light);
                break;
            case 'rays':
                this.renderRays(light);
                break;
            case 'burst':
                this.renderBurst(light);
                break;
            default:
                this.renderGlow(light);
        }
        
        this.ctx.restore();
    }
    
    /**
     * 渲染光晕效果
     */
    renderGlow(glowConfig) {
        const { x, y, radius, color, intensity = 1, innerRadius = 0 } = glowConfig;
        
        // 使用缓存的渐变
        const cacheKey = `glow_${radius}_${color}_${innerRadius}`;
        let gradient = this.gradientCache.get(cacheKey);
        
        if (!gradient) {
            gradient = this.ctx.createRadialGradient(x, y, innerRadius, x, y, radius);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.7, color.replace(/[\d\.]+\)$/g, '0.3)'));
            gradient.addColorStop(1, 'transparent');
            this.gradientCache.set(cacheKey, gradient);
        }
        
        this.ctx.globalAlpha = intensity;
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * 渲染聚光灯效果
     */
    renderSpotlight(spotlightConfig) {
        const { x, y, radius, angle, spread, color, intensity = 1 } = spotlightConfig;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        
        // 创建扇形路径
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.arc(0, 0, radius, -spread / 2, spread / 2);
        this.ctx.closePath();
        
        // 创建渐变
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.globalAlpha = intensity;
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    /**
     * 渲染光线效果
     */
    renderRays(raysConfig) {
        const { x, y, rays, color, intensity = 1 } = raysConfig;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.strokeStyle = color;
        this.ctx.globalAlpha = intensity;
        this.ctx.lineWidth = 2;
        
        rays.forEach(ray => {
            this.ctx.beginPath();
            this.ctx.moveTo(ray.startX, ray.startY);
            this.ctx.lineTo(ray.endX, ray.endY);
            this.ctx.stroke();
        });
        
        this.ctx.restore();
    }
    
    /**
     * 渲染爆发效果
     */
    renderBurst(burstConfig) {
        const { x, y, radius, particles, color, intensity = 1 } = burstConfig;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.globalAlpha = intensity;
        
        // 渲染爆发圆圈
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 渲染爆发粒子
        if (particles) {
            particles.forEach(particle => {
                const angle = particle.angle;
                const distance = radius * 0.8;
                const px = Math.cos(angle) * distance;
                const py = Math.sin(angle) * distance;
                
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(px, py, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }
        
        this.ctx.restore();
    }
    
    /**
     * 刷新渲染队列
     */
    flushRenderQueue() {
        if (this.renderQueue.length === 0) return;
        
        // 执行队列中的渲染命令
        this.renderQueue.forEach(command => {
            command();
        });
        
        this.renderQueue = [];
    }
    
    /**
     * 清理缓存
     */
    clearCache() {
        this.gradientCache.clear();
        this.pathCache.clear();
    }
    
    /**
     * 获取渲染统计
     */
    getRenderStats() {
        return {
            batchedCalls: this.batchedCalls,
            cacheSize: this.gradientCache.size + this.pathCache.size,
            queueSize: this.renderQueue.length
        };
    }
    
    /**
     * 重置统计
     */
    resetStats() {
        this.batchedCalls = 0;
    }
}