/**
 * 粒子系统 - 高性能粒子管理和物理模拟
 * @author Animation System Team
 * @version 1.0.0
 */

export class ParticleSystem {
    constructor(maxParticles = 1000, options = {}) {
        this.maxParticles = maxParticles;
        this.options = {
            enablePhysics: true,
            enableCollision: false,
            gravity: { x: 0, y: 0.1 },
            wind: { x: 0, y: 0 },
            ...options
        };
        
        // 粒子池
        this.particles = [];
        this.activeParticles = [];
        this.inactiveParticles = [];
        
        // 发射器
        this.emitters = [];
        
        // 物理环境
        this.physics = {
            gravity: this.options.gravity,
            wind: this.options.wind,
            friction: 0.99,
            bounce: 0.8
        };
        
        this.init();
    }
    
    /**
     * 初始化粒子系统
     */
    init() {
        // 预创建粒子池
        for (let i = 0; i < this.maxParticles; i++) {
            const particle = this.createParticle();
            this.inactiveParticles.push(particle);
        }
        
        console.log(`ParticleSystem initialized with ${this.maxParticles} particles`);
    }
    
    /**
     * 创建粒子对象
     */
    createParticle() {
        return {
            // 位置
            x: 0,
            y: 0,
            
            // 速度
            vx: 0,
            vy: 0,
            
            // 加速度
            ax: 0,
            ay: 0,
            
            // 外观
            size: 5,
            color: '#ffffff',
            opacity: 1,
            rotation: 0,
            scale: 1,
            
            // 生命周期
            life: 1000,
            maxLife: 1000,
            age: 0,
            
            // 类型和行为
            type: 'circle',
            active: false,
            
            // 物理属性
            mass: 1,
            friction: 0.99,
            bounce: 0.8,
            
            // 动画属性
            rotationSpeed: 0,
            scaleSpeed: 0,
            fadeSpeed: 0,
            
            // 自定义属性
            userData: {}
        };
    }
    
    /**
     * 创建发射器
     * @param {Object} config - 发射器配置
     */
    createEmitter(config) {
        const emitter = {
            // 位置
            x: config.x || 0,
            y: config.y || 0,
            
            // 发射参数
            rate: config.rate || 10, // 每秒发射数量
            burst: config.burst || 0, // 爆发数量
            
            // 粒子配置
            particleConfig: {
                life: config.life || 1000,
                size: config.size || 5,
                sizeVariation: config.sizeVariation || 0,
                color: config.color || '#ffffff',
                colorVariation: config.colorVariation || null,
                
                // 速度配置
                speed: config.speed || 1,
                speedVariation: config.speedVariation || 0,
                direction: config.direction || 0, // 弧度
                spread: config.spread || Math.PI * 2, // 发射角度范围
                
                // 物理配置
                gravity: config.gravity || { x: 0, y: 0.1 },
                friction: config.friction || 0.99,
                bounce: config.bounce || 0.8,
                
                // 动画配置
                rotationSpeed: config.rotationSpeed || 0,
                scaleSpeed: config.scaleSpeed || 0,
                fadeSpeed: config.fadeSpeed || 0
            },
            
            // 发射器状态
            active: true,
            lastEmitTime: 0,
            emitAccumulator: 0,
            
            // 形状
            shape: config.shape || 'point', // point, circle, rectangle, line
            shapeData: config.shapeData || {}
        };
        
        this.emitters.push(emitter);
        return emitter;
    }
    
    /**
     * 更新粒子系统
     * @param {number} deltaTime - 时间增量(ms)
     */
    updateParticles(deltaTime) {
        const dt = deltaTime / 1000; // 转换为秒
        
        // 更新发射器
        this.updateEmitters(deltaTime);
        
        // 更新活跃粒子
        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const particle = this.activeParticles[i];
            
            if (this.updateParticle(particle, dt)) {
                // 粒子仍然活跃
                continue;
            } else {
                // 粒子死亡，回收到池中
                this.recycleParticle(particle, i);
            }
        }
    }
    
    /**
     * 更新发射器
     */
    updateEmitters(deltaTime) {
        this.emitters.forEach(emitter => {
            if (!emitter.active) return;
            
            // 计算需要发射的粒子数量
            emitter.emitAccumulator += (emitter.rate * deltaTime) / 1000;
            const particlesToEmit = Math.floor(emitter.emitAccumulator);
            emitter.emitAccumulator -= particlesToEmit;
            
            // 发射粒子
            for (let i = 0; i < particlesToEmit; i++) {
                this.emitParticle(emitter);
            }
            
            // 处理爆发
            if (emitter.burst > 0) {
                for (let i = 0; i < emitter.burst; i++) {
                    this.emitParticle(emitter);
                }
                emitter.burst = 0;
            }
        });
    }
    
    /**
     * 发射单个粒子
     */
    emitParticle(emitter) {
        if (this.inactiveParticles.length === 0) return null;
        
        const particle = this.inactiveParticles.pop();
        const config = emitter.particleConfig;
        
        // 设置位置
        this.setParticlePosition(particle, emitter);
        
        // 设置速度
        this.setParticleVelocity(particle, config);
        
        // 设置外观
        particle.size = this.applyVariation(config.size, config.sizeVariation);
        particle.color = this.applyColorVariation(config.color, config.colorVariation);
        particle.opacity = 1;
        particle.rotation = Math.random() * Math.PI * 2;
        particle.scale = 1;
        
        // 设置生命周期
        particle.life = this.applyVariation(config.life, config.life * 0.2);
        particle.maxLife = particle.life;
        particle.age = 0;
        
        // 设置物理属性
        particle.friction = config.friction;
        particle.bounce = config.bounce;
        
        // 设置动画属性
        particle.rotationSpeed = this.applyVariation(config.rotationSpeed, config.rotationSpeed * 0.5);
        particle.scaleSpeed = config.scaleSpeed;
        particle.fadeSpeed = config.fadeSpeed;
        
        // 激活粒子
        particle.active = true;
        this.activeParticles.push(particle);
        
        return particle;
    }
    
    /**
     * 设置粒子位置
     */
    setParticlePosition(particle, emitter) {
        switch (emitter.shape) {
            case 'point':
                particle.x = emitter.x;
                particle.y = emitter.y;
                break;
                
            case 'circle':
                const radius = emitter.shapeData.radius || 10;
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * radius;
                particle.x = emitter.x + Math.cos(angle) * distance;
                particle.y = emitter.y + Math.sin(angle) * distance;
                break;
                
            case 'rectangle':
                const width = emitter.shapeData.width || 20;
                const height = emitter.shapeData.height || 20;
                particle.x = emitter.x + (Math.random() - 0.5) * width;
                particle.y = emitter.y + (Math.random() - 0.5) * height;
                break;
                
            case 'line':
                const length = emitter.shapeData.length || 20;
                const lineAngle = emitter.shapeData.angle || 0;
                const t = Math.random();
                particle.x = emitter.x + Math.cos(lineAngle) * length * t;
                particle.y = emitter.y + Math.sin(lineAngle) * length * t;
                break;
                
            default:
                particle.x = emitter.x;
                particle.y = emitter.y;
        }
    }
    
    /**
     * 设置粒子速度
     */
    setParticleVelocity(particle, config) {
        const speed = this.applyVariation(config.speed, config.speedVariation);
        const direction = config.direction + (Math.random() - 0.5) * config.spread;
        
        particle.vx = Math.cos(direction) * speed;
        particle.vy = Math.sin(direction) * speed;
        
        // 设置重力加速度
        particle.ax = config.gravity.x;
        particle.ay = config.gravity.y;
    }
    
    /**
     * 更新单个粒子
     */
    updateParticle(particle, dt) {
        // 更新年龄
        particle.age += dt * 1000;
        
        // 检查生命周期
        if (particle.age >= particle.life) {
            return false; // 粒子死亡
        }
        
        // 物理更新
        if (this.options.enablePhysics) {
            // 应用加速度
            particle.vx += particle.ax * dt;
            particle.vy += particle.ay * dt;
            
            // 应用全局力
            particle.vx += this.physics.wind.x * dt;
            particle.vy += this.physics.wind.y * dt;
            particle.vx += this.physics.gravity.x * dt;
            particle.vy += this.physics.gravity.y * dt;
            
            // 应用摩擦力
            particle.vx *= particle.friction;
            particle.vy *= particle.friction;
            
            // 更新位置
            particle.x += particle.vx * dt * 60; // 60fps基准
            particle.y += particle.vy * dt * 60;
        }
        
        // 动画更新
        particle.rotation += particle.rotationSpeed * dt;
        particle.scale += particle.scaleSpeed * dt;
        
        // 透明度衰减
        const lifeRatio = particle.age / particle.life;
        if (particle.fadeSpeed > 0) {
            particle.opacity = Math.max(0, 1 - lifeRatio * particle.fadeSpeed);
        } else {
            particle.opacity = 1 - lifeRatio;
        }
        
        return true; // 粒子仍然活跃
    }
    
    /**
     * 回收粒子
     */
    recycleParticle(particle, index) {
        particle.active = false;
        this.activeParticles.splice(index, 1);
        this.inactiveParticles.push(particle);
    }
    
    /**
     * 手动添加粒子
     */
    addParticle(particleConfig) {
        if (this.inactiveParticles.length === 0) return null;
        
        const particle = this.inactiveParticles.pop();
        
        // 应用配置
        Object.assign(particle, particleConfig);
        particle.active = true;
        particle.age = 0;
        
        this.activeParticles.push(particle);
        return particle;
    }
    
    /**
     * 清除所有粒子
     */
    clearParticles() {
        // 将所有活跃粒子回收
        this.activeParticles.forEach(particle => {
            particle.active = false;
            this.inactiveParticles.push(particle);
        });
        
        this.activeParticles = [];
    }
    
    /**
     * 应用变化值
     */
    applyVariation(base, variation) {
        if (variation === 0) return base;
        return base + (Math.random() - 0.5) * variation * 2;
    }
    
    /**
     * 应用颜色变化
     */
    applyColorVariation(baseColor, variation) {
        if (!variation) return baseColor;
        
        // 简单的颜色变化实现
        // 可以扩展为更复杂的HSV变化
        return baseColor;
    }
    
    /**
     * 获取活跃粒子
     */
    getActiveParticles() {
        return this.activeParticles;
    }
    
    /**
     * 获取系统统计
     */
    getStats() {
        return {
            activeParticles: this.activeParticles.length,
            inactiveParticles: this.inactiveParticles.length,
            totalParticles: this.maxParticles,
            emitters: this.emitters.length,
            utilization: (this.activeParticles.length / this.maxParticles * 100).toFixed(1) + '%'
        };
    }
    
    /**
     * 设置物理环境
     */
    setPhysics(physicsConfig) {
        Object.assign(this.physics, physicsConfig);
    }
    
    /**
     * 销毁粒子系统
     */
    destroy() {
        this.clearParticles();
        this.emitters = [];
        this.particles = [];
        this.activeParticles = [];
        this.inactiveParticles = [];
        
        console.log('ParticleSystem destroyed');
    }
}