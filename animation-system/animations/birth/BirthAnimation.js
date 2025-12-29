/**
 * 出生动画 - 游戏开始时的特殊动画序列
 * 三阶段动画：预备-诞生-显现
 * 包含生命诞生光芒和温暖特效
 */

export class BirthAnimation {
    constructor(context, config = {}) {
        this.ctx = context;
        this.config = {
            duration: 7000, // 7秒总时长
            phases: {
                prebirth: { start: 0, end: 2000 },      // 预备阶段 0-2秒
                birth: { start: 2000, end: 5000 },      // 诞生阶段 2-5秒
                appear: { start: 5000, end: 7000 }      // 显现阶段 5-7秒
            },
            ...config
        };
        
        // 动画状态
        this.currentTime = 0;
        this.currentPhase = 'prebirth';
        this.isComplete = false;
        
        // 特效系统
        this.particles = [];
        this.lights = [];
        this.characterOpacity = 0;
        this.characterScale = 0;
        this.characterPosition = { x: 400, y: 300 }; // 画面中央
        
        // 宇宙光芒效果
        this.cosmicLights = [];
        this.lifeEnergyParticles = [];
        this.warmthAura = { radius: 0, intensity: 0 };
        
        this.init();
    }
    
    /**
     * 初始化动画
     */
    init() {
        this.initCosmicLights();
        this.initLifeEnergyParticles();
        console.log('Birth animation initialized');
    }
    
    /**
     * 初始化宇宙光芒
     */
    initCosmicLights() {
        // 创建多个宇宙光芒源
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 300;
            this.cosmicLights.push({
                x: this.characterPosition.x + Math.cos(angle) * distance,
                y: this.characterPosition.y + Math.sin(angle) * distance,
                radius: 0,
                maxRadius: 150,
                intensity: 0,
                maxIntensity: 0.8,
                color: `hsl(${60 + i * 30}, 80%, 70%)`,
                angle: angle,
                pulsePeriod: 1000 + i * 200
            });
        }
    }
    
    /**
     * 初始化生命能量粒子
     */
    initLifeEnergyParticles() {
        // 创建生命能量粒子
        for (let i = 0; i < 50; i++) {
            this.lifeEnergyParticles.push({
                x: this.characterPosition.x + (Math.random() - 0.5) * 400,
                y: this.characterPosition.y + (Math.random() - 0.5) * 400,
                targetX: this.characterPosition.x,
                targetY: this.characterPosition.y,
                size: Math.random() * 8 + 2,
                color: `hsl(${Math.random() * 60 + 30}, 90%, ${Math.random() * 30 + 60}%)`,
                speed: Math.random() * 2 + 1,
                opacity: 0,
                maxOpacity: Math.random() * 0.8 + 0.2,
                life: 0,
                maxLife: 1
            });
        }
    }
    
    /**
     * 更新动画
     * @param {number} time - 当前时间
     * @param {number} deltaTime - 时间差
     */
    update(time, deltaTime) {
        this.currentTime = time;
        this.updatePhase();
        
        switch (this.currentPhase) {
            case 'prebirth':
                this.updatePrebirthPhase(deltaTime);
                break;
            case 'birth':
                this.updateBirthPhase(deltaTime);
                break;
            case 'appear':
                this.updateAppearPhase(deltaTime);
                break;
        }
        
        this.updateParticles(deltaTime);
        this.updateLights(deltaTime);
    }
    
    /**
     * 更新当前阶段
     */
    updatePhase() {
        const phases = this.config.phases;
        
        if (this.currentTime >= phases.appear.start) {
            this.currentPhase = 'appear';
        } else if (this.currentTime >= phases.birth.start) {
            this.currentPhase = 'birth';
        } else {
            this.currentPhase = 'prebirth';
        }
        
        if (this.currentTime >= this.config.duration) {
            this.isComplete = true;
        }
    }
    
    /**
     * 更新预备阶段
     */
    updatePrebirthPhase(deltaTime) {
        const phaseProgress = (this.currentTime - this.config.phases.prebirth.start) / 
                             (this.config.phases.prebirth.end - this.config.phases.prebirth.start);
        
        // 宇宙光芒逐渐出现
        this.cosmicLights.forEach((light, index) => {
            const pulseOffset = (this.currentTime / light.pulsePeriod) * Math.PI * 2;
            const pulse = (Math.sin(pulseOffset) + 1) / 2;
            
            light.radius = light.maxRadius * phaseProgress * (0.5 + pulse * 0.5);
            light.intensity = light.maxIntensity * phaseProgress * (0.3 + pulse * 0.7);
        });
        
        // 生命能量粒子开始激活
        this.lifeEnergyParticles.forEach(particle => {
            particle.opacity = particle.maxOpacity * phaseProgress * 0.3;
        });
    }
    
    /**
     * 更新诞生阶段
     */
    updateBirthPhase(deltaTime) {
        const phaseProgress = (this.currentTime - this.config.phases.birth.start) / 
                             (this.config.phases.birth.end - this.config.phases.birth.start);
        
        // 宇宙光芒达到最强
        this.cosmicLights.forEach(light => {
            const pulseOffset = (this.currentTime / light.pulsePeriod) * Math.PI * 2;
            const pulse = (Math.sin(pulseOffset) + 1) / 2;
            
            light.radius = light.maxRadius * (0.8 + pulse * 0.2);
            light.intensity = light.maxIntensity * (0.8 + pulse * 0.2);
        });
        
        // 生命能量粒子向中心汇聚
        this.lifeEnergyParticles.forEach(particle => {
            const dx = particle.targetX - particle.x;
            const dy = particle.targetY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                particle.x += (dx / distance) * particle.speed * deltaTime * 0.01;
                particle.y += (dy / distance) * particle.speed * deltaTime * 0.01;
            }
            
            particle.opacity = particle.maxOpacity * Math.min(1, phaseProgress * 2);
            particle.life = Math.min(1, phaseProgress * 1.5);
        });
        
        // 温暖光环开始形成
        this.warmthAura.radius = 100 * phaseProgress;
        this.warmthAura.intensity = 0.6 * phaseProgress;
    }
    
    /**
     * 更新显现阶段
     */
    updateAppearPhase(deltaTime) {
        const phaseProgress = (this.currentTime - this.config.phases.appear.start) / 
                             (this.config.phases.appear.end - this.config.phases.appear.start);
        
        // 角色逐渐显现
        this.characterOpacity = Math.min(1, phaseProgress * 2);
        this.characterScale = Math.min(1, phaseProgress * 1.5);
        
        // 宇宙光芒逐渐减弱
        this.cosmicLights.forEach(light => {
            light.intensity = light.maxIntensity * (1 - phaseProgress * 0.7);
            light.radius = light.maxRadius * (1 - phaseProgress * 0.3);
        });
        
        // 生命能量粒子逐渐消散
        this.lifeEnergyParticles.forEach(particle => {
            particle.opacity = particle.maxOpacity * (1 - phaseProgress);
        });
        
        // 温暖光环稳定
        this.warmthAura.radius = 100 * (1 - phaseProgress * 0.5);
        this.warmthAura.intensity = 0.6 * (1 - phaseProgress * 0.3);
    }
    
    /**
     * 更新粒子系统
     */
    updateParticles(deltaTime) {
        // 更新生命能量粒子
        this.lifeEnergyParticles.forEach(particle => {
            // 添加轻微的随机运动
            particle.x += (Math.random() - 0.5) * 0.5;
            particle.y += (Math.random() - 0.5) * 0.5;
            
            // 粒子大小随生命周期变化
            const lifeCycle = Math.sin(particle.life * Math.PI);
            particle.currentSize = particle.size * lifeCycle;
        });
    }
    
    /**
     * 更新光效系统
     */
    updateLights(deltaTime) {
        // 宇宙光芒的动态效果
        this.cosmicLights.forEach(light => {
            // 添加轻微的位置摆动
            const swayX = Math.sin(this.currentTime * 0.001 + light.angle) * 10;
            const swayY = Math.cos(this.currentTime * 0.001 + light.angle) * 10;
            
            light.currentX = light.x + swayX;
            light.currentY = light.y + swayY;
        });
    }
    
    /**
     * 渲染动画
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    render(ctx) {
        // 保存上下文状态
        ctx.save();
        
        // 设置混合模式为叠加
        ctx.globalCompositeOperation = 'screen';
        
        // 渲染宇宙光芒
        this.renderCosmicLights(ctx);
        
        // 渲染生命能量粒子
        this.renderLifeEnergyParticles(ctx);
        
        // 渲染温暖光环
        this.renderWarmthAura(ctx);
        
        // 恢复正常混合模式
        ctx.globalCompositeOperation = 'source-over';
        
        // 渲染角色（如果在显现阶段）
        if (this.currentPhase === 'appear' && this.characterOpacity > 0) {
            this.renderCharacter(ctx);
        }
        
        // 恢复上下文状态
        ctx.restore();
    }
    
    /**
     * 渲染宇宙光芒
     */
    renderCosmicLights(ctx) {
        this.cosmicLights.forEach(light => {
            if (light.intensity <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = light.intensity;
            
            // 创建径向渐变
            const gradient = ctx.createRadialGradient(
                light.currentX || light.x, 
                light.currentY || light.y, 
                0,
                light.currentX || light.x, 
                light.currentY || light.y, 
                light.radius
            );
            
            gradient.addColorStop(0, light.color);
            gradient.addColorStop(0.5, light.color.replace('70%', '40%'));
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                light.currentX || light.x, 
                light.currentY || light.y, 
                light.radius, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    /**
     * 渲染生命能量粒子
     */
    renderLifeEnergyParticles(ctx) {
        this.lifeEnergyParticles.forEach(particle => {
            if (particle.opacity <= 0 || !particle.currentSize) return;
            
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            
            // 添加发光效果
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = particle.currentSize * 2;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.currentSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    /**
     * 渲染温暖光环
     */
    renderWarmthAura(ctx) {
        if (this.warmthAura.intensity <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.warmthAura.intensity;
        
        // 创建温暖的径向渐变
        const gradient = ctx.createRadialGradient(
            this.characterPosition.x, 
            this.characterPosition.y, 
            0,
            this.characterPosition.x, 
            this.characterPosition.y, 
            this.warmthAura.radius
        );
        
        gradient.addColorStop(0, 'rgba(255, 220, 150, 0.8)');
        gradient.addColorStop(0.3, 'rgba(255, 180, 100, 0.6)');
        gradient.addColorStop(0.7, 'rgba(255, 140, 80, 0.3)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            this.characterPosition.x, 
            this.characterPosition.y, 
            this.warmthAura.radius, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * 渲染角色（婴儿形态）
     */
    renderCharacter(ctx) {
        ctx.save();
        
        ctx.globalAlpha = this.characterOpacity;
        ctx.translate(this.characterPosition.x, this.characterPosition.y);
        ctx.scale(this.characterScale, this.characterScale);
        
        // 绘制婴儿形态
        this.drawBabyCharacter(ctx);
        
        ctx.restore();
    }
    
    /**
     * 绘制婴儿角色
     */
    drawBabyCharacter(ctx) {
        // 婴儿身体（圆润的椭圆）
        ctx.fillStyle = '#FFE4C4'; // 肤色
        ctx.strokeStyle = '#D2B48C';
        ctx.lineWidth = 2;
        
        // 身体
        ctx.beginPath();
        ctx.ellipse(0, 10, 15, 20, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // 头部
        ctx.beginPath();
        ctx.arc(0, -15, 18, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // 眼睛
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-6, -18, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(6, -18, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // 瞳孔
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.arc(-6, -18, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(6, -18, 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // 嘴巴（微笑）
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -10, 6, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        
        // 头发
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(0, -25, 12, 0, Math.PI);
        ctx.fill();
        
        // 手臂
        ctx.strokeStyle = '#FFE4C4';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(-12, 5);
        ctx.lineTo(-20, 15);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(12, 5);
        ctx.lineTo(20, 15);
        ctx.stroke();
        
        // 腿
        ctx.beginPath();
        ctx.moveTo(-8, 25);
        ctx.lineTo(-8, 35);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(8, 25);
        ctx.lineTo(8, 35);
        ctx.stroke();
    }
    
    /**
     * 设置质量等级
     * @param {string} level - 质量等级
     */
    setQuality(level) {
        switch (level) {
            case 'low':
                this.lifeEnergyParticles = this.lifeEnergyParticles.slice(0, 20);
                this.cosmicLights = this.cosmicLights.slice(0, 4);
                break;
            case 'medium':
                this.lifeEnergyParticles = this.lifeEnergyParticles.slice(0, 35);
                this.cosmicLights = this.cosmicLights.slice(0, 6);
                break;
            case 'high':
            default:
                // 保持所有效果
                break;
        }
    }
    
    /**
     * 检查动画是否完成
     */
    isAnimationComplete() {
        return this.isComplete;
    }
    
    /**
     * 获取最终角色位置
     */
    getFinalCharacterPosition() {
        return { ...this.characterPosition };
    }
    
    /**
     * 清理资源
     */
    cleanup() {
        this.particles = [];
        this.lights = [];
        this.cosmicLights = [];
        this.lifeEnergyParticles = [];
        console.log('Birth animation cleaned up');
    }
}