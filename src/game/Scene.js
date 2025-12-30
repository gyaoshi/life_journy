/**
 * 游戏场景类 - 简化版本
 */
class Scene {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.currentStage = 'baby';
        
        // 场景配置
        this.scenes = {
            baby: {
                background: '#ffb3ba',
                elements: [
                    { type: 'crib', x: 0.7, y: 0.6, size: 120 },
                    { type: 'toys', x: 0.3, y: 0.8, size: 60 }
                ]
            },
            child: {
                background: '#87ceeb',
                elements: [
                    { type: 'playground', x: 0.2, y: 0.7, size: 160 },
                    { type: 'school', x: 0.8, y: 0.5, size: 140 }
                ]
            },
            teen: {
                background: '#90ee90',
                elements: [
                    { type: 'classroom', x: 0.7, y: 0.6, size: 180 },
                    { type: 'friends', x: 0.3, y: 0.7, size: 80 }
                ]
            },
            adult: {
                background: '#ffff99',
                elements: [
                    { type: 'office', x: 0.2, y: 0.5, size: 200 },
                    { type: 'house', x: 0.8, y: 0.7, size: 160 }
                ]
            },
            elder: {
                background: '#deb887',
                elements: [
                    { type: 'garden', x: 0.3, y: 0.8, size: 140 },
                    { type: 'chair', x: 0.7, y: 0.6, size: 100 }
                ]
            }
        };
        
        console.log('Scene created');
    }
    
    /**
     * 设置当前阶段
     */
    setStage(stage) {
        this.currentStage = stage;
        console.log('Scene stage changed to:', stage);
    }
    
    /**
     * 渲染场景
     */
    render() {
        const scene = this.scenes[this.currentStage];
        if (!scene) return;
        
        // 渲染背景
        this.renderBackground(scene.background);
        
        // 渲染场景元素
        scene.elements.forEach(element => {
            this.renderElement(element);
        });
    }
    
    /**
     * 渲染背景
     */
    renderBackground(color) {
        const ctx = this.ctx;
        
        // 使用更柔和的背景色，确保角色清晰可见
        const softColor = this.lightenColor(color, 0.6); // 更亮的背景
        
        // 渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, softColor);
        gradient.addColorStop(1, this.darkenColor(softColor, 0.2));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * 渲染场景元素
     */
    renderElement(element) {
        const ctx = this.ctx;
        const x = element.x * this.canvas.width;
        const y = element.y * this.canvas.height;
        const size = element.size;
        
        ctx.save();
        ctx.translate(x, y);
        
        switch (element.type) {
            case 'crib':
                this.renderCrib(ctx, size);
                break;
            case 'toys':
                this.renderToys(ctx, size);
                break;
            case 'playground':
                this.renderPlayground(ctx, size);
                break;
            case 'school':
                this.renderSchool(ctx, size);
                break;
            case 'classroom':
                this.renderClassroom(ctx, size);
                break;
            case 'friends':
                this.renderFriends(ctx, size);
                break;
            case 'office':
                this.renderOffice(ctx, size);
                break;
            case 'house':
                this.renderHouse(ctx, size);
                break;
            case 'garden':
                this.renderGarden(ctx, size);
                break;
            case 'chair':
                this.renderChair(ctx, size);
                break;
        }
        
        ctx.restore();
    }
    
    /**
     * 渲染婴儿床
     */
    renderCrib(ctx, size) {
        // 床框
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-size/2, -size/3, size, size/2);
        
        // 床栏
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        for (let i = -size/2; i < size/2; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, -size/3);
            ctx.lineTo(i, -size/6);
            ctx.stroke();
        }
    }
    
    /**
     * 渲染玩具
     */
    renderToys(ctx, size) {
        // 积木
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(-size/4, -size/4, size/2, size/2);
        
        // 球
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.arc(size/3, 0, size/4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * 渲染游乐场
     */
    renderPlayground(ctx, size) {
        // 滑梯
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.moveTo(-size/2, size/3);
        ctx.lineTo(0, -size/3);
        ctx.lineTo(size/4, -size/3);
        ctx.lineTo(size/2, size/3);
        ctx.fill();
        
        // 秋千
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-size/3, -size/2);
        ctx.lineTo(-size/3, size/4);
        ctx.stroke();
    }
    
    /**
     * 渲染学校
     */
    renderSchool(ctx, size) {
        // 建筑
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(-size/2, -size/3, size, size/2);
        
        // 屋顶
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(-size/2, -size/3);
        ctx.lineTo(0, -size/2);
        ctx.lineTo(size/2, -size/3);
        ctx.fill();
        
        // 门
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-size/8, -size/6, size/4, size/3);
    }
    
    /**
     * 渲染教室
     */
    renderClassroom(ctx, size) {
        // 黑板
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(-size/2, -size/4, size, size/3);
        
        // 桌子
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-size/3, size/6, size/2, size/8);
    }
    
    /**
     * 渲染朋友
     */
    renderFriends(ctx, size) {
        // 简单的人形
        for (let i = 0; i < 3; i++) {
            const x = (i - 1) * size/3;
            ctx.fillStyle = ['#ff6b6b', '#4ecdc4', '#ffe66d'][i];
            ctx.beginPath();
            ctx.arc(x, 0, size/6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillRect(x - size/12, size/6, size/6, size/4);
        }
    }
    
    /**
     * 渲染办公室
     */
    renderOffice(ctx, size) {
        // 办公桌
        ctx.fillStyle = '#708090';
        ctx.fillRect(-size/2, -size/6, size, size/3);
        
        // 电脑
        ctx.fillStyle = '#000000';
        ctx.fillRect(-size/6, -size/4, size/3, size/5);
        
        // 椅子
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-size/8, size/6, size/4, size/6);
    }
    
    /**
     * 渲染房子
     */
    renderHouse(ctx, size) {
        // 房子主体
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(-size/2, -size/4, size, size/2);
        
        // 屋顶
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(-size/2, -size/4);
        ctx.lineTo(0, -size/2);
        ctx.lineTo(size/2, -size/4);
        ctx.fill();
        
        // 窗户
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(-size/4, -size/6, size/6, size/6);
        ctx.fillRect(size/8, -size/6, size/6, size/6);
    }
    
    /**
     * 渲染花园
     */
    renderGarden(ctx, size) {
        // 花朵
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9ff3'];
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const x = Math.cos(angle) * size/3;
            const y = Math.sin(angle) * size/3;
            
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.arc(x, y, size/8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * 渲染椅子
     */
    renderChair(ctx, size) {
        // 椅子座位
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-size/3, -size/8, size/1.5, size/4);
        
        // 椅子靠背
        ctx.fillRect(-size/3, -size/2, size/8, size/2);
        
        // 扶手
        ctx.fillRect(size/4, -size/3, size/8, size/6);
    }
    
    /**
     * 颜色工具函数
     */
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor));
        
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
    
    lightenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) * (1 + factor));
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) * (1 + factor));
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) * (1 + factor));
        
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
}

// Export for Node.js (testing) and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Scene;
}