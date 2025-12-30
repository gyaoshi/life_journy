/**
 * RPGStyleRenderer - 16位RPG风格渲染器
 * 实现经典16位RPG游戏的视觉风格，包括草地、树木、角色等
 */
class RPGStyleRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 禁用抗锯齿以获得像素风格
        this.ctx.imageSmoothingEnabled = false;
        
        // 16位风格的调色板
        this.palette = {
            // 草地绿色系
            grassLight: '#9ACD32',
            grassMedium: '#7CB342', 
            grassDark: '#689F38',
            grassShadow: '#558B2F',
            
            // 树木绿色系
            treeLight: '#4CAF50',
            treeMedium: '#388E3C',
            treeDark: '#2E7D32',
            
            // 土地棕色系
            dirtLight: '#D7CCC8',
            dirtMedium: '#A1887F',
            dirtDark: '#795548',
            
            // 角色颜色
            skinTone: '#FFDBCB',
            hairBrown: '#8D6E63',
            clotheBlue: '#2196F3',
            clotheRed: '#F44336',
            clotheGreen: '#4CAF50',
            
            // 物品颜色
            wood: '#8D6E63',
            metal: '#9E9E9E',
            fabric: '#FF9800'
        };
        
        // 瓦片大小
        this.tileSize = 16;
        
        console.log('RPGStyleRenderer initialized');
    }
    
    /**
     * 渲染16位风格的草地背景
     */
    renderGrassBackground(scale = 1) {
        const tileSize = this.tileSize * scale;
        const canvas = this.canvas;
        
        // 创建草地纹理模式
        for (let x = 0; x < canvas.width; x += tileSize) {
            for (let y = 0; y < canvas.height; y += tileSize) {
                this.renderGrassTile(x, y, tileSize);
            }
        }
        
        // 添加随机的草地细节
        this.addGrassDetails(scale);
    }
    
    /**
     * 渲染单个草地瓦片
     */
    renderGrassTile(x, y, size) {
        // 基础草地颜色
        this.ctx.fillStyle = this.palette.grassMedium;
        this.ctx.fillRect(x, y, size, size);
        
        // 添加固定变化（避免闪烁）
        const variation = (x + y) % 100 / 100;
        if (variation < 0.3) {
            this.ctx.fillStyle = this.palette.grassLight;
            this.ctx.fillRect(x + size * 0.2, y + size * 0.2, size * 0.6, size * 0.6);
        } else if (variation < 0.6) {
            this.ctx.fillStyle = this.palette.grassDark;
            this.ctx.fillRect(x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.8);
        }
        
        // 添加固定草地纹理点
        for (let i = 0; i < 3; i++) {
            const px = x + (i * 5) % size;
            const py = y + (i * 7) % size;
            this.ctx.fillStyle = (x + y + i) % 2 === 0 ? this.palette.grassLight : this.palette.grassDark;
            this.ctx.fillRect(px, py, 2, 2);
        }
    }
    
    /**
     * 添加草地细节
     */
    addGrassDetails(scale) {
        const canvas = this.canvas;
        const detailSize = 4 * scale;
        
        // 随机添加小草丛
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            
            this.ctx.fillStyle = this.palette.grassDark;
            this.ctx.fillRect(x, y, detailSize, detailSize * 2);
            this.ctx.fillRect(x - detailSize, y + detailSize, detailSize * 3, detailSize);
        }
    }
    
    /**
     * 渲染树木边框
     */
    renderTreeBorder(scale = 1) {
        const canvas = this.canvas;
        const treeSize = this.tileSize * 2 * scale;
        const borderWidth = treeSize * 3;
        
        // 顶部树木边框
        for (let x = 0; x < canvas.width; x += treeSize) {
            this.renderTree(x, 0, treeSize);
            if (Math.random() < 0.7) {
                this.renderTree(x, treeSize, treeSize);
            }
        }
        
        // 底部树木边框
        for (let x = 0; x < canvas.width; x += treeSize) {
            this.renderTree(x, canvas.height - treeSize * 2, treeSize);
            if (Math.random() < 0.7) {
                this.renderTree(x, canvas.height - treeSize, treeSize);
            }
        }
        
        // 左侧树木边框
        for (let y = 0; y < canvas.height; y += treeSize) {
            this.renderTree(0, y, treeSize);
            if (Math.random() < 0.7) {
                this.renderTree(treeSize, y, treeSize);
            }
        }
        
        // 右侧树木边框
        for (let y = 0; y < canvas.height; y += treeSize) {
            this.renderTree(canvas.width - treeSize * 2, y, treeSize);
            if (Math.random() < 0.7) {
                this.renderTree(canvas.width - treeSize, y, treeSize);
            }
        }
        
        // 添加随机的内部树木
        this.addRandomTrees(scale);
    }
    
    /**
     * 渲染单棵树
     */
    renderTree(x, y, size) {
        // 树冠 - 深绿色圆形
        this.ctx.fillStyle = this.palette.treeDark;
        this.ctx.fillRect(x, y, size, size);
        
        // 树冠高光
        this.ctx.fillStyle = this.palette.treeLight;
        this.ctx.fillRect(x + size * 0.2, y + size * 0.2, size * 0.3, size * 0.3);
        
        // 树冠阴影
        this.ctx.fillStyle = this.palette.treeMedium;
        this.ctx.fillRect(x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.8);
        
        // 树干
        const trunkWidth = size * 0.3;
        const trunkHeight = size * 0.4;
        this.ctx.fillStyle = this.palette.wood;
        this.ctx.fillRect(
            x + (size - trunkWidth) / 2, 
            y + size - trunkHeight, 
            trunkWidth, 
            trunkHeight
        );
    }
    
    /**
     * 添加随机树木
     */
    addRandomTrees(scale) {
        const canvas = this.canvas;
        const treeSize = this.tileSize * 2 * scale;
        const centerArea = {
            x: canvas.width * 0.2,
            y: canvas.height * 0.2,
            width: canvas.width * 0.6,
            height: canvas.height * 0.6
        };
        
        // 在中央区域外添加一些随机树木
        for (let i = 0; i < 8; i++) {
            let x, y;
            do {
                x = Math.random() * (canvas.width - treeSize);
                y = Math.random() * (canvas.height - treeSize);
            } while (
                x > centerArea.x && x < centerArea.x + centerArea.width &&
                y > centerArea.y && y < centerArea.y + centerArea.height
            );
            
            this.renderTree(x, y, treeSize);
        }
    }
    
    /**
     * 渲染16位风格的角色
     */
    renderRPGCharacter(stageId, x, y, scale = 1, facing = 'down') {
        const size = this.tileSize * scale;
        
        // 根据人生阶段调整角色大小
        const sizeMultiplier = this.getCharacterSizeMultiplier(stageId);
        const charSize = size * sizeMultiplier;
        
        // 渲染角色阴影
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x - charSize * 0.4, y + charSize * 0.8, charSize * 0.8, charSize * 0.2);
        
        // 渲染角色主体
        this.renderCharacterBody(x, y, charSize, stageId, facing);
    }
    
    /**
     * 获取角色大小倍数
     */
    getCharacterSizeMultiplier(stageId) {
        const multipliers = {
            'baby': 1.2,  // 放大2倍
            'child': 1.6,  // 放大2倍
            'teen': 1.8,  // 放大2倍
            'adult': 2.0,  // 放大2倍
            'elder': 1.9   // 放大2倍
        };
        return multipliers[stageId] || 1.0;
    }
    
    /**
     * 渲染角色身体
     */
    renderCharacterBody(x, y, size, stageId, facing) {
        const pixelSize = size / 16; // 16x16像素角色
        
        // 头部
        this.ctx.fillStyle = this.palette.skinTone;
        this.ctx.fillRect(x - size * 0.25, y - size * 0.4, size * 0.5, size * 0.4);
        
        // 头发
        this.ctx.fillStyle = this.getHairColor(stageId);
        this.ctx.fillRect(x - size * 0.3, y - size * 0.5, size * 0.6, size * 0.2);
        
        // 眼睛
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x - size * 0.15, y - size * 0.3, pixelSize * 2, pixelSize);
        this.ctx.fillRect(x + size * 0.05, y - size * 0.3, pixelSize * 2, pixelSize);
        
        // 身体
        this.ctx.fillStyle = this.getClothingColor(stageId);
        this.ctx.fillRect(x - size * 0.3, y - size * 0.1, size * 0.6, size * 0.6);
        
        // 手臂
        this.ctx.fillStyle = this.palette.skinTone;
        this.ctx.fillRect(x - size * 0.4, y - size * 0.05, size * 0.15, size * 0.4);
        this.ctx.fillRect(x + size * 0.25, y - size * 0.05, size * 0.15, size * 0.4);
        
        // 腿部
        this.ctx.fillStyle = this.getClothingColor(stageId);
        this.ctx.fillRect(x - size * 0.2, y + size * 0.5, size * 0.15, size * 0.3);
        this.ctx.fillRect(x + size * 0.05, y + size * 0.5, size * 0.15, size * 0.3);
        
        // 特殊装饰（根据年龄阶段）
        this.addCharacterDetails(x, y, size, stageId);
    }
    
    /**
     * 获取头发颜色
     */
    getHairColor(stageId) {
        const colors = {
            'baby': '#FFE0B2',  // 浅色
            'child': this.palette.hairBrown,
            'teen': this.palette.hairBrown,
            'adult': this.palette.hairBrown,
            'elder': '#E0E0E0'  // 灰白色
        };
        return colors[stageId] || this.palette.hairBrown;
    }
    
    /**
     * 获取服装颜色
     */
    getClothingColor(stageId) {
        const colors = {
            'baby': '#FFB3E6',  // 粉色
            'child': this.palette.clotheBlue,
            'teen': this.palette.clotheGreen,
            'adult': this.palette.clotheRed,
            'elder': '#8D6E63'  // 棕色
        };
        return colors[stageId] || this.palette.clotheBlue;
    }
    
    /**
     * 添加角色细节
     */
    addCharacterDetails(x, y, size, stageId) {
        const pixelSize = size / 16;
        
        switch (stageId) {
            case 'baby':
                // 奶瓶
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(x + size * 0.3, y, pixelSize * 3, pixelSize * 6);
                break;
                
            case 'child':
                // 书包
                this.ctx.fillStyle = '#FF5722';
                this.ctx.fillRect(x - size * 0.45, y, pixelSize * 4, pixelSize * 8);
                break;
                
            case 'teen':
                // 背包
                this.ctx.fillStyle = '#9C27B0';
                this.ctx.fillRect(x - size * 0.5, y - size * 0.1, pixelSize * 5, pixelSize * 10);
                break;
                
            case 'adult':
                // 公文包
                this.ctx.fillStyle = '#795548';
                this.ctx.fillRect(x + size * 0.3, y + size * 0.2, pixelSize * 6, pixelSize * 4);
                break;
                
            case 'elder':
                // 拐杖
                this.ctx.fillStyle = this.palette.wood;
                this.ctx.fillRect(x + size * 0.4, y - size * 0.2, pixelSize * 2, size * 0.8);
                this.ctx.fillRect(x + size * 0.35, y - size * 0.2, pixelSize * 4, pixelSize * 2);
                break;
        }
    }
    
    /**
     * 渲染RPG风格的物品
     */
    renderRPGItem(itemType, x, y, scale = 1) {
        const size = this.tileSize * scale;
        
        switch (itemType) {
            case 'tent':
                this.renderTent(x, y, size);
                break;
            case 'wagon':
                this.renderWagon(x, y, size);
                break;
            case 'campfire':
                this.renderCampfire(x, y, size);
                break;
            case 'chest':
                this.renderChest(x, y, size);
                break;
        }
    }
    
    /**
     * 渲染帐篷
     */
    renderTent(x, y, size) {
        // 帐篷主体 - 三角形
        this.ctx.fillStyle = '#2196F3';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size * 0.5);
        this.ctx.lineTo(x - size * 0.6, y + size * 0.3);
        this.ctx.lineTo(x + size * 0.6, y + size * 0.3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 帐篷入口
        this.ctx.fillStyle = '#1976D2';
        this.ctx.fillRect(x - size * 0.2, y, size * 0.4, size * 0.3);
        
        // 帐篷绳索
        this.ctx.strokeStyle = '#795548';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x - size * 0.6, y + size * 0.3);
        this.ctx.lineTo(x - size * 0.8, y + size * 0.5);
        this.ctx.moveTo(x + size * 0.6, y + size * 0.3);
        this.ctx.lineTo(x + size * 0.8, y + size * 0.5);
        this.ctx.stroke();
    }
    
    /**
     * 渲染马车
     */
    renderWagon(x, y, size) {
        // 马车车身
        this.ctx.fillStyle = this.palette.wood;
        this.ctx.fillRect(x - size * 0.6, y - size * 0.2, size * 1.2, size * 0.6);
        
        // 车轮
        this.ctx.fillStyle = '#795548';
        this.ctx.beginPath();
        this.ctx.arc(x - size * 0.4, y + size * 0.3, size * 0.2, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.4, y + size * 0.3, size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 车轮辐条
        this.ctx.strokeStyle = '#5D4037';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x - size * 0.4, y + size * 0.3);
            this.ctx.lineTo(
                x - size * 0.4 + Math.cos(angle) * size * 0.15,
                y + size * 0.3 + Math.sin(angle) * size * 0.15
            );
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(x + size * 0.4, y + size * 0.3);
            this.ctx.lineTo(
                x + size * 0.4 + Math.cos(angle) * size * 0.15,
                y + size * 0.3 + Math.sin(angle) * size * 0.15
            );
            this.ctx.stroke();
        }
        
        // 车篷
        this.ctx.fillStyle = '#F5F5F5';
        this.ctx.beginPath();
        this.ctx.arc(x, y - size * 0.2, size * 0.7, Math.PI, 0);
        this.ctx.fill();
    }
    
    /**
     * 渲染篝火
     */
    renderCampfire(x, y, size) {
        // 火焰基座 - 石头圈
        this.ctx.fillStyle = '#616161';
        this.ctx.beginPath();
        this.ctx.arc(x, y + size * 0.2, size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 木柴
        this.ctx.fillStyle = this.palette.wood;
        this.ctx.fillRect(x - size * 0.3, y, size * 0.6, size * 0.1);
        this.ctx.fillRect(x - size * 0.1, y - size * 0.2, size * 0.2, size * 0.4);
        
        // 火焰 - 动态效果
        const flameHeight = size * 0.6 + Math.sin(Date.now() * 0.01) * size * 0.1;
        this.ctx.fillStyle = '#FF5722';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - flameHeight);
        this.ctx.lineTo(x - size * 0.2, y);
        this.ctx.lineTo(x + size * 0.2, y);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 内部火焰
        this.ctx.fillStyle = '#FFC107';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - flameHeight * 0.7);
        this.ctx.lineTo(x - size * 0.1, y - size * 0.1);
        this.ctx.lineTo(x + size * 0.1, y - size * 0.1);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * 渲染宝箱
     */
    renderChest(x, y, size) {
        // 宝箱主体
        this.ctx.fillStyle = this.palette.wood;
        this.ctx.fillRect(x - size * 0.4, y - size * 0.2, size * 0.8, size * 0.6);
        
        // 宝箱盖子
        this.ctx.fillStyle = '#8D6E63';
        this.ctx.fillRect(x - size * 0.4, y - size * 0.4, size * 0.8, size * 0.2);
        
        // 金属装饰
        this.ctx.fillStyle = this.palette.metal;
        this.ctx.fillRect(x - size * 0.35, y - size * 0.1, size * 0.7, size * 0.05);
        this.ctx.fillRect(x - size * 0.05, y - size * 0.3, size * 0.1, size * 0.2);
        
        // 锁
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(x, y - size * 0.15, size * 0.08, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * 渲染完整的RPG场景
     */
    renderRPGScene(stageId, characterX, characterY, scale = 1) {
        // 1. 渲染草地背景
        this.renderGrassBackground(scale);
        
        // 2. 渲染树木边框
        this.renderTreeBorder(scale);
        
        // 3. 根据人生阶段添加特定物品
        this.addStageSpecificItems(stageId, scale);
        
        // 4. 渲染主角色
        this.renderRPGCharacter(stageId, characterX, characterY, scale);
        
        // 5. 添加环境细节
        this.addEnvironmentDetails(stageId, scale);
    }
    
    /**
     * 根据人生阶段添加特定物品
     */
    addStageSpecificItems(stageId, scale) {
        const canvas = this.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        switch (stageId) {
            case 'baby':
                // 婴儿期 - 摇篮和玩具
                this.renderRPGItem('chest', centerX - 100 * scale, centerY - 50 * scale, scale * 0.8);
                break;
                
            case 'child':
                // 儿童期 - 游乐设施
                this.renderRPGItem('wagon', centerX - 120 * scale, centerY + 60 * scale, scale);
                break;
                
            case 'teen':
                // 青少年期 - 学习用品
                this.renderRPGItem('tent', centerX + 100 * scale, centerY - 80 * scale, scale);
                break;
                
            case 'adult':
                // 成年期 - 工作和家庭物品
                this.renderRPGItem('wagon', centerX - 150 * scale, centerY + 40 * scale, scale * 1.2);
                this.renderRPGItem('chest', centerX + 120 * scale, centerY - 60 * scale, scale);
                break;
                
            case 'elder':
                // 老年期 - 休闲物品
                this.renderRPGItem('campfire', centerX + 80 * scale, centerY + 80 * scale, scale);
                break;
        }
    }
    
    /**
     * 添加环境细节
     */
    addEnvironmentDetails(stageId, scale) {
        // 添加小花朵
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.canvas.width * 0.6 + this.canvas.width * 0.2;
            const y = Math.random() * this.canvas.height * 0.6 + this.canvas.height * 0.2;
            this.renderFlower(x, y, scale * 0.5);
        }
        
        // 添加小石头
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * this.canvas.width * 0.8 + this.canvas.width * 0.1;
            const y = Math.random() * this.canvas.height * 0.8 + this.canvas.height * 0.1;
            this.renderRock(x, y, scale * 0.6);
        }
    }
    
    /**
     * 渲染小花朵
     */
    renderFlower(x, y, scale) {
        const size = this.tileSize * scale * 0.3;
        
        // 花瓣
        this.ctx.fillStyle = '#E91E63';
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const petalX = x + Math.cos(angle) * size * 0.5;
            const petalY = y + Math.sin(angle) * size * 0.5;
            this.ctx.beginPath();
            this.ctx.arc(petalX, petalY, size * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 花心
        this.ctx.fillStyle = '#FFC107';
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * 渲染小石头
     */
    renderRock(x, y, scale) {
        const size = this.tileSize * scale * 0.4;
        
        this.ctx.fillStyle = '#9E9E9E';
        this.ctx.fillRect(x - size * 0.5, y - size * 0.3, size, size * 0.6);
        
        // 高光
        this.ctx.fillStyle = '#E0E0E0';
        this.ctx.fillRect(x - size * 0.3, y - size * 0.2, size * 0.3, size * 0.2);
    }
    
    /**
     * 重置渲染器
     */
    reset() {
        this.ctx.imageSmoothingEnabled = false;
        console.log('RPGStyleRenderer reset');
    }
}

// Export for Node.js (testing) and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RPGStyleRenderer;
}