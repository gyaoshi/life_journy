/**
 * 游戏角色类 - 增强版本
 */
class Character {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 角色属性
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.targetX = this.x;
        this.targetY = this.y;
        this.size = 40;
        this.stage = 'baby';
        this.animation = 'idle';
        this.animationFrame = 0;
        this.animationSpeed = 500;
        this.lastAnimationTime = 0;
        this.isMoving = false;
        this.emotion = 'neutral';
        
        // 动作系统
        this.actions = {
            idle: { frames: 2, speed: 800 },
            walking: { frames: 4, speed: 200 },
            jumping: { frames: 3, speed: 150 },
            dancing: { frames: 4, speed: 250 },
            working: { frames: 2, speed: 600 },
            playing: { frames: 3, speed: 300 },
            thinking: { frames: 2, speed: 1000 }
        };
        
        // 颜色配置
        this.colors = {
            baby: '#ffb3ba',
            child: '#87ceeb', 
            teen: '#90ee90',
            adult: '#ffff99',
            elder: '#deb887'
        };
        
        console.log('Enhanced Character created');
    }
    
    /**
     * 更新角色
     */
    update(deltaTime) {
        // 更新动画帧
        const currentAction = this.actions[this.animation] || this.actions.idle;
        this.lastAnimationTime += deltaTime;
        
        if (this.lastAnimationTime >= currentAction.speed) {
            this.animationFrame = (this.animationFrame + 1) % currentAction.frames;
            this.lastAnimationTime = 0;
        }
        
        // 移动到目标位置
        if (this.isMoving) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 3) {
                this.x += dx * 0.08;
                this.y += dy * 0.08;
                if (this.animation === 'idle') {
                    this.animation = 'walking';
                }
            } else {
                this.isMoving = false;
                if (this.animation === 'walking') {
                    this.animation = 'idle';
                }
            }
        }
    }
    
    /**
     * 渲染角色
     */
    render() {
        const ctx = this.ctx;
        const color = this.colors[this.stage] || '#ffffff';
        
        // 保存上下文
        ctx.save();
        
        // 移动到角色位置
        ctx.translate(this.x, this.y);
        
        // 绘制阴影
        this.renderShadow(ctx);
        
        // 渲染角色身体
        this.renderBody(ctx, color);
        
        // 渲染角色头部
        this.renderHead(ctx, color);
        
        // 渲染角色表情
        this.renderFace(ctx);
        
        // 渲染角色装饰（根据阶段）
        this.renderStageSpecific(ctx, color);
        
        // 渲染动作效果
        this.renderActionEffects(ctx);
        
        // 恢复上下文
        ctx.restore();
    }
    
    /**
     * 渲染阴影
     */
    renderShadow(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, this.size/2 + 5, this.size/2.5, this.size/8, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * 渲染身体
     */
    renderBody(ctx, color) {
        // 使用强对比色
        const characterColor = '#1a1a1a'; // 深黑色
        const outlineColor = '#ffffff';   // 白色边框
        
        // 动画偏移
        let bodyOffset = 0;
        let armOffset = 0;
        let legOffset = 0;
        
        switch (this.animation) {
            case 'walking':
                bodyOffset = Math.sin(this.animationFrame * Math.PI) * 2;
                armOffset = Math.sin(this.animationFrame * Math.PI) * 8;
                legOffset = Math.sin(this.animationFrame * Math.PI) * 5;
                break;
            case 'jumping':
                bodyOffset = -Math.abs(Math.sin(this.animationFrame * Math.PI)) * 15;
                break;
            case 'dancing':
                bodyOffset = Math.sin(this.animationFrame * Math.PI * 0.5) * 5;
                armOffset = Math.sin(this.animationFrame * Math.PI) * 12;
                break;
            case 'working':
                armOffset = Math.sin(this.animationFrame * Math.PI) * 3;
                break;
            case 'playing':
                bodyOffset = Math.sin(this.animationFrame * Math.PI * 0.7) * 3;
                armOffset = Math.sin(this.animationFrame * Math.PI * 1.2) * 10;
                break;
        }
        
        // 身体
        ctx.fillStyle = characterColor;
        ctx.fillRect(-this.size/3, -this.size/4 + bodyOffset, this.size*2/3, this.size/2);
        
        // 身体边框
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.size/3, -this.size/4 + bodyOffset, this.size*2/3, this.size/2);
        
        // 手臂（带动画）
        ctx.fillStyle = characterColor;
        ctx.fillRect(-this.size/2, -this.size/6 + armOffset, this.size/4, this.size/4);
        ctx.strokeRect(-this.size/2, -this.size/6 + armOffset, this.size/4, this.size/4);
        ctx.fillRect(this.size/4, -this.size/6 - armOffset, this.size/4, this.size/4);
        ctx.strokeRect(this.size/4, -this.size/6 - armOffset, this.size/4, this.size/4);
        
        // 腿部（带动画）
        ctx.fillStyle = characterColor;
        ctx.fillRect(-this.size/6, this.size/4 + bodyOffset, this.size/8, this.size/3 + legOffset);
        ctx.strokeRect(-this.size/6, this.size/4 + bodyOffset, this.size/8, this.size/3 + legOffset);
        ctx.fillRect(this.size/12, this.size/4 + bodyOffset, this.size/8, this.size/3 - legOffset);
        ctx.strokeRect(this.size/12, this.size/4 + bodyOffset, this.size/8, this.size/3 - legOffset);
    }
    
    /**
     * 渲染头部
     */
    renderHead(ctx, color) {
        const characterColor = '#1a1a1a'; // 深黑色
        const outlineColor = '#ffffff';   // 白色边框
        
        // 头部摇摆动画
        let headOffset = 0;
        if (this.animation === 'dancing') {
            headOffset = Math.sin(this.animationFrame * Math.PI * 0.8) * 3;
        } else if (this.animation === 'thinking') {
            headOffset = Math.sin(this.animationFrame * Math.PI * 0.3) * 2;
        }
        
        // 头部
        ctx.fillStyle = characterColor;
        ctx.beginPath();
        ctx.arc(headOffset, -this.size/2, this.size/3, 0, Math.PI * 2);
        ctx.fill();
        
        // 头部边框
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 头发（根据阶段）
        if (this.stage !== 'elder') {
            ctx.fillStyle = this.stage === 'baby' ? '#ffd700' : '#8B4513';
            ctx.beginPath();
            ctx.arc(headOffset, -this.size/2 - 5, this.size/4, 0, Math.PI);
            ctx.fill();
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    
    /**
     * 渲染表情
     */
    renderFace(ctx) {
        const outlineColor = '#ffffff';
        
        // 眼睛 - 更大更明显
        ctx.fillStyle = outlineColor;
        
        // 根据情绪调整眼睛
        if (this.emotion === 'happy' || this.emotion === 'excited') {
            // 眯眼笑
            ctx.fillRect(-10, -this.size/2 - 1, 4, 2);
            ctx.fillRect(6, -this.size/2 - 1, 4, 2);
        } else if (this.emotion === 'sad') {
            // 正常眼睛
            ctx.fillRect(-10, -this.size/2 - 3, 4, 4);
            ctx.fillRect(6, -this.size/2 - 3, 4, 4);
        } else {
            // 正常眼睛
            ctx.fillRect(-10, -this.size/2 - 3, 4, 4);
            ctx.fillRect(6, -this.size/2 - 3, 4, 4);
        }
        
        // 嘴巴根据情绪变化
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        if (this.emotion === 'happy' || this.emotion === 'excited') {
            // 笑脸
            ctx.arc(0, -this.size/2 + 8, 8, 0, Math.PI);
        } else if (this.emotion === 'sad') {
            // 难过
            ctx.arc(0, -this.size/2 + 15, 6, Math.PI, 0);
        } else if (this.emotion === 'surprised') {
            // 惊讶
            ctx.arc(0, -this.size/2 + 10, 4, 0, Math.PI * 2);
        } else {
            // 普通表情
            ctx.moveTo(-4, -this.size/2 + 8);
            ctx.lineTo(4, -this.size/2 + 8);
        }
        ctx.stroke();
    }
    
    /**
     * 渲染阶段特定装饰
     */
    renderStageSpecific(ctx, color) {
        const accentColor = '#ff6b6b';
        const outlineColor = '#ffffff';
        
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 2;
        
        switch (this.stage) {
            case 'baby':
                // 奶瓶 - 更明显
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(this.size/3, -this.size/8, 10, 18);
                ctx.strokeRect(this.size/3, -this.size/8, 10, 18);
                ctx.fillStyle = accentColor;
                ctx.beginPath();
                ctx.arc(this.size/3 + 5, -this.size/8 - 3, 4, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'child':
                // 书包 - 更明显
                ctx.fillStyle = accentColor;
                ctx.fillRect(-this.size/2 - 8, -this.size/4, 12, 18);
                ctx.strokeRect(-this.size/2 - 8, -this.size/4, 12, 18);
                // 玩具球
                if (this.animation === 'playing') {
                    ctx.fillStyle = '#4ecdc4';
                    ctx.beginPath();
                    ctx.arc(this.size/2 + 10, this.size/4, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'teen':
                // 耳机 - 更明显
                ctx.strokeStyle = '#333333';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(0, -this.size/2, this.size/2.2, -Math.PI/3, -2*Math.PI/3, true);
                ctx.stroke();
                // 耳机垫
                ctx.fillStyle = '#333333';
                ctx.beginPath();
                ctx.arc(-this.size/3, -this.size/2 - 5, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.size/3, -this.size/2 - 5, 6, 0, Math.PI * 2);
                ctx.fill();
                // 书本
                if (this.animation === 'working') {
                    ctx.fillStyle = '#4ecdc4';
                    ctx.fillRect(-this.size/4, this.size/3, this.size/2, this.size/8);
                    ctx.strokeRect(-this.size/4, this.size/3, this.size/2, this.size/8);
                }
                break;
                
            case 'adult':
                // 领带 - 更明显
                ctx.fillStyle = accentColor;
                ctx.fillRect(-4, -this.size/4, 8, this.size/2);
                ctx.strokeRect(-4, -this.size/4, 8, this.size/2);
                // 公文包
                if (this.animation === 'working') {
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(this.size/3, this.size/6, this.size/4, this.size/5);
                    ctx.strokeRect(this.size/3, this.size/6, this.size/4, this.size/5);
                }
                break;
                
            case 'elder':
                // 拐杖 - 更明显
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(this.size/2, this.size/4);
                ctx.lineTo(this.size/2, this.size);
                ctx.stroke();
                // 拐杖头
                ctx.beginPath();
                ctx.arc(this.size/2, this.size/4 - 5, 5, 0, Math.PI);
                ctx.stroke();
                // 眼镜
                ctx.strokeStyle = '#333333';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(-8, -this.size/2 - 2, 6, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(8, -this.size/2 - 2, 6, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }
    }
    
    /**
     * 渲染动作效果
     */
    renderActionEffects(ctx) {
        switch (this.animation) {
            case 'jumping':
                // 跳跃时的速度线
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(-this.size/2 + i * 5, this.size/2 + 10);
                    ctx.lineTo(-this.size/2 + i * 5 - 10, this.size/2 + 15);
                    ctx.stroke();
                }
                break;
                
            case 'dancing':
                // 跳舞时的音符
                if (this.animationFrame % 2 === 0) {
                    ctx.fillStyle = '#ffe66d';
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('♪', this.size/2, -this.size/2);
                    ctx.fillText('♫', -this.size/2, -this.size/3);
                }
                break;
                
            case 'thinking':
                // 思考时的问号
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('?', this.size/3, -this.size/2 - 10);
                break;
        }
    }
    
    /**
     * 移动到指定位置
     */
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.isMoving = true;
    }
    
    /**
     * 执行动作
     */
    performAction(action, duration = 2000) {
        this.animation = action;
        setTimeout(() => {
            if (this.animation === action) {
                this.animation = 'idle';
            }
        }, duration);
    }
    
    /**
     * 设置情绪
     */
    setEmotion(emotion, duration = 3000) {
        this.emotion = emotion;
        setTimeout(() => {
            if (this.emotion === emotion) {
                this.emotion = 'neutral';
            }
        }, duration);
    }
    
    /**
     * 设置角色阶段
     */
    setStage(stage) {
        this.stage = stage;
        this.setEmotion('excited', 2000);
        this.performAction('dancing', 2000);
        console.log('Character stage changed to:', stage);
    }
    
    /**
     * 设置动画
     */
    setAnimation(animation) {
        this.animation = animation;
    }
    
    /**
     * 设置位置
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
    }
}

// Export for Node.js (testing) and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character;
}