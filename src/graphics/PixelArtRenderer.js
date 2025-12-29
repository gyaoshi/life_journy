/**
 * PixelArtRenderer - 像素艺术渲染器
 * 实现miniature像素风格的角色和场景渲染
 */
class PixelArtRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pixelSize = 3; // 基础像素大小
        
        // 禁用抗锯齿以获得像素风格
        this.ctx.imageSmoothingEnabled = false;
        
        // 角色精灵数据
        this.characterSprites = this.initializeCharacterSprites();
        
        // 场景元素数据
        this.sceneElements = this.initializeSceneElements();
        
        console.log('PixelArtRenderer initialized');
    }
    
    /**
     * 初始化角色精灵数据
     */
    initializeCharacterSprites() {
        return {
            baby: {
                idle: [
                    [
                        '  ●●●  ',
                        ' ●●●●● ',
                        '●●●●●●●',
                        '●●●●●●●',
                        ' ●●●●● ',
                        '  ●●●  ',
                        '   ●   ',
                        '  ●●●  '
                    ]
                ],
                happy: [
                    [
                        '  ●●●  ',
                        ' ●●●●● ',
                        '●●○●○●●',
                        '●●●●●●●',
                        ' ●●○●● ',
                        '  ●●●  ',
                        '   ●   ',
                        '  ●●●  '
                    ]
                ]
            },
            child: {
                idle: [
                    [
                        '  ●●●  ',
                        ' ●●●●● ',
                        '●●●●●●●',
                        '●●●●●●●',
                        ' ●●●●● ',
                        '  ●●●  ',
                        '   ●   ',
                        '  ●●●  ',
                        '  ● ●  ',
                        '  ● ●  '
                    ]
                ],
                walking: [
                    [
                        '  ●●●  ',
                        ' ●●●●● ',
                        '●●●●●●●',
                        '●●●●●●●',
                        ' ●●●●● ',
                        '  ●●●  ',
                        '   ●   ',
                        '  ●●●  ',
                        ' ●  ●  ',
                        '●   ●  '
                    ],
                    [
                        '  ●●●  ',
                        ' ●●●●● ',
                        '●●●●●●●',
                        '●●●●●●●',
                        ' ●●●●● ',
                        '  ●●●  ',
                        '   ●   ',
                        '  ●●●  ',
                        '  ●  ● ',
                        '  ●   ●'
                    ]
                ]
            },
            teen: {
                idle: [
                    [
                        '  ●●●  ',
                        ' ●●●●● ',
                        '●●●●●●●',
                        '●●●●●●●',
                        ' ●●●●● ',
                        '  ●●●  ',
                        '   ●   ',
                        '  ●●●  ',
                        '  ●●●  ',
                        '  ● ●  ',
                        '  ● ●  '
                    ]
                ],
                excited: [
                    [
                        '  ●●●  ',
                        ' ●●●●● ',
                        '●●○●○●●',
                        '●●●●●●●',
                        ' ●●○●● ',
                        '  ●●●  ',
                        '  \\●/  ',
                        '  ●●●  ',
                        '  ●●●  ',
                        '  ● ●  ',
                        '  ● ●  '
                    ]
                ]
            },
            adult: {
                idle: [
                    [
                        '  ●●●  ',
                        ' ●●●●● ',
                        '●●●●●●●',
                        '●●●●●●●',
                        ' ●●●●● ',
                        '  ●●●  ',
                        '   ●   ',
                        '  ●●●  ',
                        '  ●●●  ',
                        '  ●●●  ',
                        '  ● ●  ',
                        '  ● ●  '
                    ]
                ],
                working: [
                    [
                        '  ●●●  ',
                        ' ●●●●● ',
                        '●●●●●●●',
                        '●●●●●●●',
                        ' ●●●●● ',
                        '  ●●●  ',
                        '  /●\\  ',
                        '  ●●●  ',
                        '  ●●●  ',
                        '  ●●●  ',
                        '  ● ●  ',
                        '  ● ●  '
                    ]
                ]
            },
            elder: {
                idle: [
                    [
                        '  ●●●  ',
                        ' ●●●●● ',
                        '●●●●●●●',
                        '●●●●●●●',
                        ' ●●●●● ',
                        '  ●●●  ',
                        '   ●   ',
                        '  ●●●  ',
                        '  ●●●  ',
                        '  ●●●  ',
                        '  ● ●  ',
                        '  ● ●  ',
                        '  ═══  '
                    ]
                ],
                peaceful: [
                    [
                        '  ●●●  ',
                        ' ●●●●● ',
                        '●●─●─●●',
                        '●●●●●●●',
                        ' ●●∪●● ',
                        '  ●●●  ',
                        '   ●   ',
                        '  ●●●  ',
                        '  ●●●  ',
                        '  ●●●  ',
                        '  ● ●  ',
                        '  ● ●  ',
                        '  ═══  '
                    ]
                ]
            }
        };
    }
    
    /**
     * 初始化场景元素数据
     */
    initializeSceneElements() {
        return {
            baby: {
                crib: [
                    '████████████',
                    '█          █',
                    '█   ●●●    █',
                    '█  ●●●●●   █',
                    '█ ●●●●●●●  █',
                    '█  ●●●●●   █',
                    '█   ●●●    █',
                    '█          █',
                    '████████████'
                ],
                toys: [
                    '  ○  ',
                    ' ○○○ ',
                    '○○○○○',
                    ' ○○○ ',
                    '  ○  '
                ]
            },
            child: {
                playground: [
                    '     /\\     ',
                    '    /  \\    ',
                    '   /____\\   ',
                    '   |    |   ',
                    '   |    |   ',
                    '   |    |   ',
                    '___________'
                ],
                school: [
                    '████████████',
                    '█ □ □ □ □  █',
                    '█          █',
                    '█ ████████ █',
                    '█ █      █ █',
                    '█ █  ●●  █ █',
                    '█ █      █ █',
                    '█ ████████ █',
                    '████████████'
                ]
            },
            teen: {
                classroom: [
                    '████████████████',
                    '█ ┌─┐ ┌─┐ ┌─┐ █',
                    '█ │ │ │ │ │ │ █',
                    '█ └─┘ └─┘ └─┘ █',
                    '█              █',
                    '█ ████████████ █',
                    '█ █          █ █',
                    '█ █    ●●    █ █',
                    '█ █          █ █',
                    '████████████████'
                ],
                heart: [
                    '  ●● ●●  ',
                    ' ●●●●●●● ',
                    '●●●●●●●●●',
                    ' ●●●●●●● ',
                    '  ●●●●●  ',
                    '   ●●●   ',
                    '    ●    '
                ]
            },
            adult: {
                office: [
                    '████████████████',
                    '█ ┌────────────┐█',
                    '█ │ ████████   ││',
                    '█ │ █      █   ││',
                    '█ │ █  ●●  █   ││',
                    '█ │ █      █   ││',
                    '█ │ ████████   ││',
                    '█ │            ││',
                    '█ └────────────┘█',
                    '████████████████'
                ],
                house: [
                    '    /\\    ',
                    '   /  \\   ',
                    '  /____\\  ',
                    '  |    |  ',
                    '  | ●● |  ',
                    '  |    |  ',
                    '  |____|  ',
                    '__________'
                ]
            },
            elder: {
                garden: [
                    '   ♠   ♠   ♠   ',
                    '  ♠♠♠ ♠♠♠ ♠♠♠  ',
                    ' ♠♠♠♠♠♠♠♠♠♠♠♠♠ ',
                    '_______________',
                    '               ',
                    '   ●●●   ●●●   ',
                    '  ●●●●● ●●●●●  ',
                    ' ●●●●●●●●●●●●● '
                ],
                rocking_chair: [
                    '  ┌─┐  ',
                    '  │ │  ',
                    '┌─┘ └─┐',
                    '│  ●  │',
                    '│     │',
                    '└─────┘',
                    ' ∪∪∪∪∪ '
                ]
            }
        };
    }
    
    /**
     * 渲染角色
     */
    renderCharacter(stageId, animation = 'idle', frame = 0, x, y, scale = 1) {
        const character = this.characterSprites[stageId];
        if (!character || !character[animation]) return;
        
        const sprite = character[animation][frame % character[animation].length];
        if (!sprite) return;
        
        this.renderPixelSprite(sprite, x, y, scale, this.getStageColor(stageId));
    }
    
    /**
     * 渲染场景元素
     */
    renderSceneElement(stageId, elementType, x, y, scale = 1) {
        const elements = this.sceneElements[stageId];
        if (!elements || !elements[elementType]) return;
        
        const element = elements[elementType];
        this.renderPixelSprite(element, x, y, scale, this.getElementColor(elementType));
    }
    
    /**
     * 渲染像素精灵
     */
    renderPixelSprite(sprite, x, y, scale = 1, primaryColor = '#ffffff') {
        const pixelSize = this.pixelSize * scale;
        
        sprite.forEach((row, rowIndex) => {
            for (let colIndex = 0; colIndex < row.length; colIndex++) {
                const char = row[colIndex];
                if (char === ' ') continue;
                
                const pixelX = x + colIndex * pixelSize;
                const pixelY = y + rowIndex * pixelSize;
                
                this.ctx.fillStyle = this.getPixelColor(char, primaryColor);
                this.ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
            }
        });
    }
    
    /**
     * 获取像素颜色
     */
    getPixelColor(char, primaryColor) {
        const colorMap = {
            '●': primaryColor,           // 主要颜色
            '○': '#ffffff',              // 白色
            '█': '#333333',              // 深灰色
            '┌': '#666666',              // 中灰色
            '┐': '#666666',
            '└': '#666666',
            '┘': '#666666',
            '─': '#666666',
            '│': '#666666',
            '□': '#cccccc',              // 浅灰色
            '♠': '#228B22',              // 绿色
            '♥': '#ff69b4',              // 粉色
            '/': '#8B4513',              // 棕色
            '\\': '#8B4513',
            '_': '#8B4513',
            '|': '#8B4513',
            '∪': '#8B4513',
            '═': '#8B4513'
        };
        
        return colorMap[char] || primaryColor;
    }
    
    /**
     * 获取阶段主色调
     */
    getStageColor(stageId) {
        const colors = {
            'baby': '#ffb3ba',
            'child': '#87ceeb',
            'teen': '#90ee90',
            'adult': '#ffff99',
            'elder': '#deb887'
        };
        
        return colors[stageId] || '#ffffff';
    }
    
    /**
     * 获取元素颜色
     */
    getElementColor(elementType) {
        const colors = {
            'crib': '#8B4513',
            'toys': '#ff69b4',
            'playground': '#32CD32',
            'school': '#4169E1',
            'classroom': '#2F4F4F',
            'heart': '#ff1493',
            'office': '#708090',
            'house': '#CD853F',
            'garden': '#228B22',
            'rocking_chair': '#8B4513'
        };
        
        return colors[elementType] || '#666666';
    }
    
    /**
     * 渲染背景场景
     */
    renderBackground(stageId, scale = 1) {
        const canvas = this.canvas;
        const gradient = this.ctx.createLinearGradient(0, 0, 0, canvas.height);
        
        // 根据人生阶段设置背景渐变
        switch (stageId) {
            case 'baby':
                gradient.addColorStop(0, '#ffb3ba');
                gradient.addColorStop(1, '#ffc9c9');
                break;
            case 'child':
                gradient.addColorStop(0, '#bae1ff');
                gradient.addColorStop(1, '#87ceeb');
                break;
            case 'teen':
                gradient.addColorStop(0, '#baffc9');
                gradient.addColorStop(1, '#90ee90');
                break;
            case 'adult':
                gradient.addColorStop(0, '#ffffba');
                gradient.addColorStop(1, '#ffff99');
                break;
            case 'elder':
                gradient.addColorStop(0, '#ffdfba');
                gradient.addColorStop(1, '#deb887');
                break;
            default:
                gradient.addColorStop(0, '#1a1a2e');
                gradient.addColorStop(1, '#16213e');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 添加像素化纹理
        this.addPixelTexture(stageId, scale);
    }
    
    /**
     * 添加像素化纹理
     */
    addPixelTexture(stageId, scale) {
        const canvas = this.canvas;
        const pixelSize = this.pixelSize * scale;
        
        // 创建随机像素点作为纹理
        for (let x = 0; x < canvas.width; x += pixelSize * 4) {
            for (let y = 0; y < canvas.height; y += pixelSize * 4) {
                if (Math.random() < 0.1) {
                    this.ctx.fillStyle = this.getTextureColor(stageId);
                    this.ctx.globalAlpha = 0.3;
                    this.ctx.fillRect(x, y, pixelSize, pixelSize);
                    this.ctx.globalAlpha = 1;
                }
            }
        }
    }
    
    /**
     * 获取纹理颜色
     */
    getTextureColor(stageId) {
        const colors = {
            'baby': '#ffffff',
            'child': '#ffffff',
            'teen': '#ffffff',
            'adult': '#ffffff',
            'elder': '#8B4513'
        };
        
        return colors[stageId] || '#ffffff';
    }
    
    /**
     * 渲染像素化事件图标
     */
    renderEventIcon(event, x, y, scale = 1) {
        const iconSize = 32 * scale;
        const pixelSize = this.pixelSize * scale;
        
        // 背景圆形
        this.drawPixelCircle(x, y, iconSize / 2, event.color || '#ffffff', scale);
        
        // 图标文字
        if (event.icon) {
            this.ctx.font = `${iconSize * 0.6}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#000000';
            this.ctx.fillText(event.icon, x, y);
        }
        
        // 像素化边框
        this.drawPixelBorder(x - iconSize/2, y - iconSize/2, iconSize, iconSize, '#333333', scale);
    }
    
    /**
     * 绘制像素化圆形
     */
    drawPixelCircle(centerX, centerY, radius, color, scale = 1) {
        this.ctx.fillStyle = color;
        const pixelSize = this.pixelSize * scale;
        
        for (let x = -radius; x <= radius; x += pixelSize) {
            for (let y = -radius; y <= radius; y += pixelSize) {
                if (x * x + y * y <= radius * radius) {
                    this.ctx.fillRect(
                        centerX + x - pixelSize/2,
                        centerY + y - pixelSize/2,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }
    }
    
    /**
     * 绘制像素化边框
     */
    drawPixelBorder(x, y, width, height, color, scale = 1) {
        this.ctx.fillStyle = color;
        const pixelSize = this.pixelSize * scale;
        
        // 顶部和底部边框
        for (let px = x; px < x + width; px += pixelSize) {
            this.ctx.fillRect(px, y, pixelSize, pixelSize);
            this.ctx.fillRect(px, y + height - pixelSize, pixelSize, pixelSize);
        }
        
        // 左侧和右侧边框
        for (let py = y; py < y + height; py += pixelSize) {
            this.ctx.fillRect(x, py, pixelSize, pixelSize);
            this.ctx.fillRect(x + width - pixelSize, py, pixelSize, pixelSize);
        }
    }
    
    /**
     * 渲染像素化进度条
     */
    renderPixelProgressBar(x, y, width, height, progress, scale = 1) {
        const pixelSize = this.pixelSize * scale;
        
        // 背景
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(x, y, width, height);
        
        // 进度
        const progressWidth = width * progress;
        this.ctx.fillStyle = '#4ecdc4';
        
        // 像素化进度填充
        for (let px = 0; px < progressWidth; px += pixelSize) {
            for (let py = 0; py < height; py += pixelSize) {
                this.ctx.fillRect(x + px, y + py, pixelSize, pixelSize);
            }
        }
        
        // 边框
        this.drawPixelBorder(x, y, width, height, '#666666', scale);
    }
    
    /**
     * 渲染像素化文字
     */
    renderPixelText(text, x, y, size, color, scale = 1) {
        this.ctx.font = `${size * scale}px monospace`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 添加像素化效果的文字阴影
        this.ctx.fillStyle = '#000000';
        this.ctx.fillText(text, x + scale, y + scale);
        
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }
    
    /**
     * 获取精灵尺寸
     */
    getSpriteSize(sprite) {
        if (!sprite || sprite.length === 0) return { width: 0, height: 0 };
        
        return {
            width: sprite[0].length * this.pixelSize,
            height: sprite.length * this.pixelSize
        };
    }
    
    /**
     * 重置渲染器
     */
    reset() {
        // 重新启用像素化设置
        this.ctx.imageSmoothingEnabled = false;
        console.log('PixelArtRenderer reset');
    }
}

// Export for Node.js (testing) and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PixelArtRenderer;
}