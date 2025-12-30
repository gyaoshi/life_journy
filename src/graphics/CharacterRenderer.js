/**
 * 角色渲染器 - 负责渲染不同人生阶段的角色形态
 * 支持角色形态转换、情感表达和视觉替换
 * 使用RPG风格渲染器创建可爱抽象的角色形象
 */
class CharacterRenderer {
    constructor(context, options = {}) {
        this.context = context;
        this.currentStage = 'baby';
        this.currentPosition = { x: 0, y: 0 };
        this.currentEmotion = 'neutral';
        this.scale = options.scale || 1.0;
        this.isTransitioning = false;
        
        // 角色视觉资源
        this.characterAssets = new Map();
        this.transitionProgress = 0;
        this.transitionDuration = 1000; // 1秒转换时间
        
        // RPG风格渲染器
        this.rpgRenderer = null;
        if (options.canvas) {
            this.rpgRenderer = new RPGStyleRenderer(options.canvas);
        }
        
        // 初始化默认角色形态
        this.initializeCharacterForms();
    }

    /**
     * 初始化角色形态定义 - 使用可爱抽象的RPG风格
     */
    initializeCharacterForms() {
        // 婴儿形态 - 超级可爱、圆润、天真无邪
        this.characterAssets.set('baby', {
            size: { width: 192, height: 192 },
            proportions: { 
                head: 0.6,     // 婴儿头部超大，萌萌哒
                body: 0.4,
                limbs: 0.25    // 超短小的四肢
            },
            bodyShape: {
                headRadius: 96,
                bodyWidth: 72,
                bodyHeight: 96,
                limbThickness: 24
            },
            features: ['huge_sparkly_eyes', 'tiny_button_nose', 'chubby_cheeks', 'innocent_smile'],
            colors: { 
                skin: '#FFDBCB',     // 温暖肤色
                hair: '#F4E4BC',     // 浅金色头发
                eyes: '#87CEEB',     // 天空蓝眼睛
                clothes: '#FFB3E6',  // 粉嫩色衣服
                cheeks: '#FFB6C1'    // 粉色脸颊
            },
            posture: 'sitting_cute',
            characteristics: ['adorable', 'innocent', 'curious', 'tiny'],
            rpgStyle: {
                pixelSize: 6,
                cuteness: 'maximum',
                roundness: 'extreme'
            }
        });

        // 儿童形态 - 活泼可爱、精力充沛、充满好奇
        this.characterAssets.set('child', {
            size: { width: 240, height: 288 },
            proportions: { 
                head: 0.45,    // 仍然较大的头部
                body: 0.55,
                limbs: 0.35
            },
            bodyShape: {
                headRadius: 84,
                bodyWidth: 96,
                bodyHeight: 168,
                limbThickness: 36
            },
            features: ['bright_sparkling_eyes', 'cheerful_smile', 'rosy_cheeks', 'messy_hair'],
            colors: { 
                skin: '#FFDBCB', 
                hair: '#D2691E',     // 栗色头发
                eyes: '#32CD32',     // 明亮绿眼睛
                clothes: '#87CEEB',  // 天蓝色衣服
                accessories: '#FF6347' // 橙红色配饰
            },
            posture: 'bouncy_standing',
            characteristics: ['energetic', 'playful', 'curious', 'bouncy'],
            rpgStyle: {
                pixelSize: 6,
                cuteness: 'high',
                animation: 'bouncy'
            }
        });

        // 青少年形态 - 可爱中带着青春活力
        this.characterAssets.set('teen', {
            size: { width: 264, height: 336 },
            proportions: { 
                head: 0.35, 
                body: 0.65,
                limbs: 0.45
            },
            bodyShape: {
                headRadius: 24,
                bodyWidth: 36,
                bodyHeight: 76,
                limbThickness: 16
            },
            features: ['expressive_eyes', 'youthful_smile', 'stylish_hair', 'confident_posture'],
            colors: { 
                skin: '#FFDBCB', 
                hair: '#8B4513',     // 深棕色头发
                eyes: '#9370DB',     // 紫色眼睛
                clothes: '#DDA0DD',  // 淡紫色衣服
                accessories: '#FF69B4' // 粉色配饰
            },
            posture: 'confident_cute',
            characteristics: ['youthful', 'expressive', 'stylish', 'growing'],
            rpgStyle: {
                pixelSize: 2,
                cuteness: 'medium-high',
                style: 'trendy'
            }
        });

        // 成人形态 - 成熟可爱、温和稳重
        this.characterAssets.set('adult', {
            size: { width: 288, height: 360 },
            proportions: { 
                head: 0.3, 
                body: 0.7,
                limbs: 0.5
            },
            bodyShape: {
                headRadius: 44,
                bodyWidth: 80,
                bodyHeight: 176,
                limbThickness: 40
            },
            features: ['kind_eyes', 'gentle_smile', 'mature_features', 'warm_expression'],
            colors: { 
                skin: '#FFDBCB', 
                hair: '#8B4513', 
                eyes: '#4169E1',     // 深蓝色眼睛
                clothes: '#4682B4',  // 钢蓝色正装
                accessories: '#DAA520' // 金色配饰
            },
            posture: 'gentle_professional',
            characteristics: ['mature', 'kind', 'stable', 'caring'],
            rpgStyle: {
                pixelSize: 2,
                cuteness: 'medium',
                elegance: 'high'
            }
        });

        // 老人形态 - 慈祥可爱、智慧温和
        this.characterAssets.set('elder', {
            size: { width: 264, height: 336 },
            proportions: { 
                head: 0.35,    // 略大头部显示智慧
                body: 0.65,
                limbs: 0.4     
            },
            bodyShape: {
                headRadius: 52,
                bodyWidth: 72,
                bodyHeight: 160,
                limbThickness: 32
            },
            features: ['wise_twinkling_eyes', 'gentle_smile', 'silver_hair', 'kind_wrinkles'],
            colors: { 
                skin: '#F5DEB3',     // 温暖苍白肤色
                hair: '#E6E6FA',     // 淡紫银色头发
                eyes: '#4682B4',     // 深蓝智慧眼睛
                clothes: '#9ACD32',  // 温和绿色衣服
                accessories: '#CD853F' // 棕色配饰
            },
            posture: 'wise_gentle',
            characteristics: ['wise', 'gentle', 'peaceful', 'loving'],
            rpgStyle: {
                pixelSize: 2,
                cuteness: 'gentle',
                wisdom: 'high'
            }
        });
    }

    /**
     * 渲染角色 - 使用可爱的RPG风格
     * @param {string} stage - 人生阶段
     * @param {Object} position - 位置 {x, y}
     * @param {string} emotion - 情感状态
     */
    renderCharacter(stage, position, emotion = 'neutral') {
        if (!this.characterAssets.has(stage)) {
            console.warn(`Unknown character stage: ${stage}`);
            return;
        }

        this.currentStage = stage;
        this.currentPosition = position;
        this.currentEmotion = emotion;

        const characterData = this.characterAssets.get(stage);
        
        // 保存当前上下文状态
        this.context.save();
        
        // 应用位置和缩放
        this.context.translate(position.x, position.y);
        this.context.scale(this.scale, this.scale);
        
        // 使用RPG风格渲染或回退到传统渲染
        if (this.rpgRenderer) {
            this._drawRPGStyleCharacter(characterData, emotion);
        } else {
            this._drawTraditionalCharacter(characterData, emotion);
        }
        
        // 恢复上下文状态
        this.context.restore();
    }

    /**
     * 绘制RPG风格的可爱角色
     * @private
     */
    _drawRPGStyleCharacter(characterData, emotion) {
        const { size, colors, features, rpgStyle } = characterData;
        const pixelSize = rpgStyle.pixelSize || 2;
        
        // 禁用抗锯齿以获得像素风格
        this.context.imageSmoothingEnabled = false;
        
        // 绘制角色阴影
        this._drawCuteShadow(size, pixelSize);
        
        // 绘制身体
        this._drawCuteBody(characterData, pixelSize);
        
        // 绘制头部
        this._drawCuteHead(characterData, emotion, pixelSize);
        
        // 绘制面部特征
        this._drawCuteFacialFeatures(characterData, emotion, pixelSize);
        
        // 绘制服装和配饰
        this._drawCuteClothing(characterData, pixelSize);
        
        // 添加可爱特效
        this._addCutenessEffects(characterData, emotion, pixelSize);
        
        // 恢复抗锯齿设置
        this.context.imageSmoothingEnabled = true;
    }

    /**
     * 绘制可爱的阴影
     * @private
     */
    _drawCuteShadow(size, pixelSize) {
        this.context.fillStyle = 'rgba(0, 0, 0, 0.2)';
        const shadowWidth = size.width * 0.8;
        const shadowHeight = pixelSize * 3;
        
        this.context.fillRect(
            -shadowWidth / 2, 
            size.height * 0.4, 
            shadowWidth, 
            shadowHeight
        );
    }

    /**
     * 绘制可爱的身体
     * @private
     */
    _drawCuteBody(characterData, pixelSize) {
        const { bodyShape, colors, posture } = characterData;
        
        // 身体主色
        this.context.fillStyle = colors.clothes;
        
        // 根据姿态调整身体形状
        let bodyWidth = bodyShape.bodyWidth;
        let bodyHeight = bodyShape.bodyHeight;
        
        if (posture === 'sitting_cute') {
            bodyHeight *= 0.8; // 坐着时身体更矮
            bodyWidth *= 1.1;  // 但更宽
        }
        
        // 绘制圆润的身体
        this._drawRoundedRect(
            -bodyWidth / 2, 
            bodyHeight * 0.1, 
            bodyWidth, 
            bodyHeight * 0.7, 
            pixelSize * 2
        );
        
        // 绘制可爱的手臂
        this._drawCuteArms(bodyShape, colors, pixelSize);
        
        // 绘制可爱的腿部
        this._drawCuteLegs(bodyShape, colors, posture, pixelSize);
    }

    /**
     * 绘制可爱的头部
     * @private
     */
    _drawCuteHead(characterData, emotion, pixelSize) {
        const { bodyShape, colors } = characterData;
        const headRadius = bodyShape.headRadius;
        
        // 头部轮廓
        this.context.fillStyle = colors.skin;
        this.context.beginPath();
        this.context.arc(0, -bodyShape.bodyHeight * 0.3, headRadius, 0, 2 * Math.PI);
        this.context.fill();
        
        // 头部高光（增加立体感）
        this.context.fillStyle = this._lightenColor(colors.skin, 0.2);
        this.context.beginPath();
        this.context.arc(
            -headRadius * 0.3, 
            -bodyShape.bodyHeight * 0.3 - headRadius * 0.2, 
            headRadius * 0.4, 
            0, 2 * Math.PI
        );
        this.context.fill();
        
        // 绘制头发
        this._drawCuteHair(characterData, pixelSize);
    }

    /**
     * 绘制可爱的面部特征
     * @private
     */
    _drawCuteFacialFeatures(characterData, emotion, pixelSize) {
        const { bodyShape, colors, features } = characterData;
        const headRadius = bodyShape.headRadius;
        const faceY = -bodyShape.bodyHeight * 0.3;
        
        // 绘制超大可爱眼睛
        this._drawSparklyEyes(colors.eyes, emotion, headRadius, faceY, pixelSize);
        
        // 绘制小巧鼻子
        this._drawTinyNose(headRadius, faceY, pixelSize);
        
        // 绘制可爱嘴巴
        this._drawCuteMouth(emotion, headRadius, faceY, pixelSize);
        
        // 绘制粉嫩脸颊
        if (colors.cheeks) {
            this._drawRosyCheeks(colors.cheeks, headRadius, faceY, pixelSize);
        }
        
        // 根据特征添加额外细节
        this._addFacialDetails(features, headRadius, faceY, pixelSize);
    }

    /**
     * 绘制闪亮的大眼睛
     * @private
     */
    _drawSparklyEyes(eyeColor, emotion, headRadius, faceY, pixelSize) {
        const eyeSize = headRadius * 0.25; // 更大的眼睛
        const eyeY = faceY - headRadius * 0.1;
        
        // 眼白
        this.context.fillStyle = '#FFFFFF';
        this.context.beginPath();
        this.context.arc(-headRadius * 0.35, eyeY, eyeSize, 0, 2 * Math.PI);
        this.context.fill();
        this.context.beginPath();
        this.context.arc(headRadius * 0.35, eyeY, eyeSize, 0, 2 * Math.PI);
        this.context.fill();
        
        // 瞳孔
        this.context.fillStyle = eyeColor;
        const pupilSize = eyeSize * 0.7;
        
        // 根据情感调整瞳孔
        let pupilOffsetY = 0;
        let pupilScale = 1;
        
        switch (emotion) {
            case 'happy':
                pupilScale = 0.9; // 开心时瞳孔稍小
                break;
            case 'surprised':
                pupilScale = 1.2; // 惊讶时瞳孔更大
                break;
            case 'sleepy':
                pupilOffsetY = eyeSize * 0.3; // 困倦时瞳孔下移
                break;
        }
        
        this.context.beginPath();
        this.context.arc(-headRadius * 0.35, eyeY + pupilOffsetY, pupilSize * pupilScale, 0, 2 * Math.PI);
        this.context.fill();
        this.context.beginPath();
        this.context.arc(headRadius * 0.35, eyeY + pupilOffsetY, pupilSize * pupilScale, 0, 2 * Math.PI);
        this.context.fill();
        
        // 眼睛高光（让眼睛更有神）
        this.context.fillStyle = '#FFFFFF';
        const highlightSize = eyeSize * 0.3;
        this.context.beginPath();
        this.context.arc(-headRadius * 0.35 - eyeSize * 0.2, eyeY - eyeSize * 0.2, highlightSize, 0, 2 * Math.PI);
        this.context.fill();
        this.context.beginPath();
        this.context.arc(headRadius * 0.35 - eyeSize * 0.2, eyeY - eyeSize * 0.2, highlightSize, 0, 2 * Math.PI);
        this.context.fill();
        
        // 睫毛（增加可爱度）
        this._drawEyelashes(headRadius, eyeY, eyeSize, pixelSize);
    }

    /**
     * 绘制睫毛
     * @private
     */
    _drawEyelashes(headRadius, eyeY, eyeSize, pixelSize) {
        this.context.strokeStyle = '#8B4513';
        this.context.lineWidth = pixelSize;
        this.context.lineCap = 'round';
        
        // 左眼睫毛
        for (let i = 0; i < 3; i++) {
            const angle = -Math.PI * 0.7 + (i * Math.PI * 0.2);
            const startX = -headRadius * 0.35 + Math.cos(angle) * eyeSize;
            const startY = eyeY + Math.sin(angle) * eyeSize;
            const endX = startX + Math.cos(angle) * pixelSize * 3;
            const endY = startY + Math.sin(angle) * pixelSize * 3;
            
            this.context.beginPath();
            this.context.moveTo(startX, startY);
            this.context.lineTo(endX, endY);
            this.context.stroke();
        }
        
        // 右眼睫毛
        for (let i = 0; i < 3; i++) {
            const angle = -Math.PI * 0.3 + (i * Math.PI * 0.2);
            const startX = headRadius * 0.35 + Math.cos(angle) * eyeSize;
            const startY = eyeY + Math.sin(angle) * eyeSize;
            const endX = startX + Math.cos(angle) * pixelSize * 3;
            const endY = startY + Math.sin(angle) * pixelSize * 3;
            
            this.context.beginPath();
            this.context.moveTo(startX, startY);
            this.context.lineTo(endX, endY);
            this.context.stroke();
        }
    }

    /**
     * 绘制小巧鼻子
     * @private
     */
    _drawTinyNose(headRadius, faceY, pixelSize) {
        this.context.fillStyle = 'rgba(255, 182, 193, 0.6)';
        this.context.beginPath();
        this.context.arc(0, faceY + headRadius * 0.1, pixelSize * 1.5, 0, 2 * Math.PI);
        this.context.fill();
    }

    /**
     * 绘制可爱嘴巴
     * @private
     */
    _drawCuteMouth(emotion, headRadius, faceY, pixelSize) {
        const mouthY = faceY + headRadius * 0.3;
        const mouthWidth = headRadius * 0.3;
        
        this.context.strokeStyle = '#FF69B4';
        this.context.lineWidth = pixelSize;
        this.context.lineCap = 'round';
        
        this.context.beginPath();
        
        switch (emotion) {
            case 'happy':
                // 大大的笑容
                this.context.arc(0, mouthY - headRadius * 0.1, mouthWidth, 0.2 * Math.PI, 0.8 * Math.PI);
                break;
            case 'sad':
                // 小小的皱眉
                this.context.arc(0, mouthY + headRadius * 0.1, mouthWidth * 0.8, 1.2 * Math.PI, 1.8 * Math.PI);
                break;
            case 'surprised':
                // 圆圆的惊讶嘴
                this.context.arc(0, mouthY, mouthWidth * 0.4, 0, 2 * Math.PI);
                break;
            default:
                // 甜美的微笑
                this.context.arc(0, mouthY - headRadius * 0.05, mouthWidth * 0.8, 0.3 * Math.PI, 0.7 * Math.PI);
        }
        
        this.context.stroke();
    }

    /**
     * 绘制粉嫩脸颊
     * @private
     */
    _drawRosyCheeks(cheekColor, headRadius, faceY, pixelSize) {
        this.context.fillStyle = cheekColor;
        this.context.globalAlpha = 0.6;
        
        // 左脸颊
        this.context.beginPath();
        this.context.arc(-headRadius * 0.6, faceY + headRadius * 0.2, headRadius * 0.2, 0, 2 * Math.PI);
        this.context.fill();
        
        // 右脸颊
        this.context.beginPath();
        this.context.arc(headRadius * 0.6, faceY + headRadius * 0.2, headRadius * 0.2, 0, 2 * Math.PI);
        this.context.fill();
        
        this.context.globalAlpha = 1.0;
    }

    /**
     * 绘制可爱的头发
     * @private
     */
    _drawCuteHair(characterData, pixelSize) {
        const { bodyShape, colors } = characterData;
        const headRadius = bodyShape.headRadius;
        const faceY = -bodyShape.bodyHeight * 0.3;
        
        this.context.fillStyle = colors.hair;
        
        // 根据人生阶段绘制不同的发型
        switch (this.currentStage) {
            case 'baby':
                // 婴儿稀疏的头发
                this._drawBabyHair(headRadius, faceY, pixelSize);
                break;
            case 'child':
                // 儿童蓬松的头发
                this._drawChildHair(headRadius, faceY, pixelSize);
                break;
            case 'teen':
                // 青少年时尚发型
                this._drawTeenHair(headRadius, faceY, pixelSize);
                break;
            case 'adult':
                // 成人整齐发型
                this._drawAdultHair(headRadius, faceY, pixelSize);
                break;
            case 'elder':
                // 老人银发
                this._drawElderHair(headRadius, faceY, pixelSize);
                break;
        }
    }

    /**
     * 绘制婴儿头发
     * @private
     */
    _drawBabyHair(headRadius, faceY, pixelSize) {
        // 稀疏的小卷发
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * headRadius * 0.8;
            const y = faceY + Math.sin(angle) * headRadius * 0.6 - headRadius * 0.3;
            
            this.context.beginPath();
            this.context.arc(x, y, pixelSize * 2, 0, 2 * Math.PI);
            this.context.fill();
        }
    }

    /**
     * 绘制儿童头发
     * @private
     */
    _drawChildHair(headRadius, faceY, pixelSize) {
        // 蓬松凌乱的头发
        this.context.beginPath();
        this.context.arc(0, faceY - headRadius * 0.2, headRadius * 0.9, 0, Math.PI);
        this.context.fill();
        
        // 添加几根翘起的头发
        for (let i = 0; i < 5; i++) {
            const angle = Math.PI * 0.2 + (i * Math.PI * 0.15);
            const startX = Math.cos(angle) * headRadius * 0.8;
            const startY = faceY - headRadius * 0.8 + Math.sin(angle) * headRadius * 0.3;
            
            this.context.fillRect(startX - pixelSize, startY - pixelSize * 4, pixelSize * 2, pixelSize * 6);
        }
    }

    /**
     * 绘制青少年头发
     * @private
     */
    _drawTeenHair(headRadius, faceY, pixelSize) {
        // 时尚的发型
        this.context.beginPath();
        this.context.arc(0, faceY - headRadius * 0.1, headRadius * 0.95, 0, Math.PI);
        this.context.fill();
        
        // 侧分刘海
        this.context.fillRect(-headRadius * 0.7, faceY - headRadius * 0.8, headRadius * 0.6, pixelSize * 4);
    }

    /**
     * 绘制成人头发
     * @private
     */
    _drawAdultHair(headRadius, faceY, pixelSize) {
        // 整齐的发型
        this.context.beginPath();
        this.context.arc(0, faceY - headRadius * 0.05, headRadius * 0.9, 0, Math.PI);
        this.context.fill();
    }

    /**
     * 绘制老人头发
     * @private
     */
    _drawElderHair(headRadius, faceY, pixelSize) {
        // 银白色头发，稍微稀疏
        this.context.beginPath();
        this.context.arc(0, faceY - headRadius * 0.05, headRadius * 0.85, 0, Math.PI);
        this.context.fill();
        
        // 添加一些白色高光
        this.context.fillStyle = this._lightenColor(this.characterAssets.get(this.currentStage).colors.hair, 0.3);
        this.context.beginPath();
        this.context.arc(-headRadius * 0.3, faceY - headRadius * 0.4, headRadius * 0.2, 0, Math.PI);
        this.context.fill();
    }

    /**
     * 绘制可爱的手臂
     * @private
     */
    _drawCuteArms(bodyShape, colors, pixelSize) {
        this.context.fillStyle = colors.skin;
        this.context.lineCap = 'round';
        
        const armLength = bodyShape.bodyHeight * 0.4;
        const armY = bodyShape.bodyHeight * 0.2;
        const armThickness = bodyShape.limbThickness;
        
        // 左臂 - 圆润的形状
        this._drawRoundedRect(
            -bodyShape.bodyWidth/2 - armThickness, 
            armY, 
            armThickness, 
            armLength, 
            pixelSize
        );
        
        // 右臂
        this._drawRoundedRect(
            bodyShape.bodyWidth/2, 
            armY, 
            armThickness, 
            armLength, 
            pixelSize
        );
        
        // 可爱的小手
        this.context.beginPath();
        this.context.arc(-bodyShape.bodyWidth/2 - armThickness/2, armY + armLength, armThickness/2, 0, 2 * Math.PI);
        this.context.fill();
        
        this.context.beginPath();
        this.context.arc(bodyShape.bodyWidth/2 + armThickness/2, armY + armLength, armThickness/2, 0, 2 * Math.PI);
        this.context.fill();
    }

    /**
     * 绘制可爱的腿部
     * @private
     */
    _drawCuteLegs(bodyShape, colors, posture, pixelSize) {
        if (posture === 'sitting_cute') {
            // 婴儿坐姿 - 短短的腿
            this.context.fillStyle = colors.skin;
            
            const legWidth = bodyShape.limbThickness;
            const legLength = bodyShape.bodyHeight * 0.3;
            const legY = bodyShape.bodyHeight * 0.6;
            
            // 左腿
            this._drawRoundedRect(
                -bodyShape.bodyWidth/3 - legWidth/2, 
                legY, 
                legWidth, 
                legLength, 
                pixelSize
            );
            
            // 右腿
            this._drawRoundedRect(
                bodyShape.bodyWidth/3 - legWidth/2, 
                legY, 
                legWidth, 
                legLength, 
                pixelSize
            );
        } else {
            // 站立姿势的腿
            this.context.fillStyle = colors.clothes;
            
            const legWidth = bodyShape.limbThickness;
            const legLength = bodyShape.bodyHeight * 0.5;
            const legY = bodyShape.bodyHeight * 0.5;
            
            // 左腿
            this._drawRoundedRect(
                -bodyShape.bodyWidth/3 - legWidth/2, 
                legY, 
                legWidth, 
                legLength, 
                pixelSize
            );
            
            // 右腿
            this._drawRoundedRect(
                bodyShape.bodyWidth/3 - legWidth/2, 
                legY, 
                legWidth, 
                legLength, 
                pixelSize
            );
            
            // 可爱的小脚
            this.context.fillStyle = colors.skin;
            this.context.beginPath();
            this.context.arc(-bodyShape.bodyWidth/3, legY + legLength, legWidth/2, 0, 2 * Math.PI);
            this.context.fill();
            
            this.context.beginPath();
            this.context.arc(bodyShape.bodyWidth/3, legY + legLength, legWidth/2, 0, 2 * Math.PI);
            this.context.fill();
        }
    }

    /**
     * 绘制可爱的服装
     * @private
     */
    _drawCuteClothing(characterData, pixelSize) {
        const { colors, characteristics } = characterData;
        
        // 根据人生阶段添加特殊服装细节
        switch (this.currentStage) {
            case 'baby':
                this._drawBabyClothing(colors, pixelSize);
                break;
            case 'child':
                this._drawChildClothing(colors, pixelSize);
                break;
            case 'teen':
                this._drawTeenClothing(colors, pixelSize);
                break;
            case 'adult':
                this._drawAdultClothing(colors, pixelSize);
                break;
            case 'elder':
                this._drawElderClothing(colors, pixelSize);
                break;
        }
    }

    /**
     * 绘制婴儿服装
     * @private
     */
    _drawBabyClothing(colors, pixelSize) {
        // 可爱的小围嘴
        this.context.fillStyle = '#FFFFFF';
        this._drawRoundedRect(-6, 2, 12, 8, pixelSize);
        
        // 小纽扣
        this.context.fillStyle = colors.accessories || '#FFB6C1';
        this.context.beginPath();
        this.context.arc(0, 6, pixelSize, 0, 2 * Math.PI);
        this.context.fill();
    }

    /**
     * 绘制儿童服装
     * @private
     */
    _drawChildClothing(colors, pixelSize) {
        // 可爱的口袋
        this.context.fillStyle = colors.accessories || '#FF6347';
        this._drawRoundedRect(-8, 15, 6, 6, pixelSize);
        
        // 口袋上的小图案
        this.context.fillStyle = '#FFFFFF';
        this.context.beginPath();
        this.context.arc(-5, 18, pixelSize, 0, 2 * Math.PI);
        this.context.fill();
    }

    /**
     * 绘制青少年服装
     * @private
     */
    _drawTeenClothing(colors, pixelSize) {
        // 时尚的装饰条纹
        this.context.fillStyle = colors.accessories || '#FF69B4';
        this.context.fillRect(-10, 10, 20, pixelSize);
        this.context.fillRect(-10, 15, 20, pixelSize);
    }

    /**
     * 绘制成人服装
     * @private
     */
    _drawAdultClothing(colors, pixelSize) {
        // 正式的领带或项链
        this.context.fillStyle = colors.accessories || '#DAA520';
        this._drawRoundedRect(-2, 5, 4, 15, pixelSize);
    }

    /**
     * 绘制老人服装
     * @private
     */
    _drawElderClothing(colors, pixelSize) {
        // 温暖的围巾
        this.context.fillStyle = colors.accessories || '#CD853F';
        this._drawRoundedRect(-12, 0, 24, 4, pixelSize);
    }

    /**
     * 添加可爱特效
     * @private
     */
    _addCutenessEffects(characterData, emotion, pixelSize) {
        // 根据情感添加特殊效果
        switch (emotion) {
            case 'happy':
                this._addHappySparkles(pixelSize);
                break;
            case 'excited':
                this._addExcitementBurst(pixelSize);
                break;
            case 'love':
                this._addLoveHearts(pixelSize);
                break;
        }
        
        // 添加阶段特定的可爱效果
        if (this.currentStage === 'baby') {
            this._addBabyGlow(pixelSize);
        }
    }

    /**
     * 添加快乐闪光效果
     * @private
     */
    _addHappySparkles(pixelSize) {
        this.context.fillStyle = '#FFD700';
        
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const distance = 25 + Math.sin(Date.now() * 0.01 + i) * 5;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            // 绘制星形闪光
            this._drawStar(x, y, pixelSize * 2, 4);
        }
    }

    /**
     * 添加兴奋爆发效果
     * @private
     */
    _addExcitementBurst(pixelSize) {
        this.context.strokeStyle = '#FF6347';
        this.context.lineWidth = pixelSize;
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const length = 15 + Math.sin(Date.now() * 0.02 + i) * 5;
            
            this.context.beginPath();
            this.context.moveTo(0, 0);
            this.context.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
            this.context.stroke();
        }
    }

    /**
     * 添加爱心效果
     * @private
     */
    _addLoveHearts(pixelSize) {
        this.context.fillStyle = '#FF69B4';
        
        for (let i = 0; i < 3; i++) {
            const x = (i - 1) * 15;
            const y = -30 - i * 5 + Math.sin(Date.now() * 0.01 + i) * 3;
            this._drawHeart(x, y, pixelSize * 3);
        }
    }

    /**
     * 添加婴儿光晕
     * @private
     */
    _addBabyGlow(pixelSize) {
        this.context.save();
        this.context.globalAlpha = 0.3;
        this.context.fillStyle = '#FFE4E1';
        
        this.context.beginPath();
        this.context.arc(0, 0, 35, 0, 2 * Math.PI);
        this.context.fill();
        
        this.context.restore();
    }

    /**
     * 绘制圆角矩形
     * @private
     */
    _drawRoundedRect(x, y, width, height, radius) {
        this.context.beginPath();
        this.context.moveTo(x + radius, y);
        this.context.lineTo(x + width - radius, y);
        this.context.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.context.lineTo(x + width, y + height - radius);
        this.context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.context.lineTo(x + radius, y + height);
        this.context.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.context.lineTo(x, y + radius);
        this.context.quadraticCurveTo(x, y, x + radius, y);
        this.context.closePath();
        this.context.fill();
    }

    /**
     * 绘制星形
     * @private
     */
    _drawStar(x, y, size, points) {
        this.context.save();
        this.context.translate(x, y);
        
        this.context.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? size : size * 0.5;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            
            if (i === 0) {
                this.context.moveTo(px, py);
            } else {
                this.context.lineTo(px, py);
            }
        }
        this.context.closePath();
        this.context.fill();
        
        this.context.restore();
    }

    /**
     * 绘制爱心
     * @private
     */
    _drawHeart(x, y, size) {
        this.context.save();
        this.context.translate(x, y);
        this.context.scale(size / 10, size / 10);
        
        this.context.beginPath();
        this.context.moveTo(0, 3);
        this.context.bezierCurveTo(-5, -2, -10, 1, -5, 8);
        this.context.bezierCurveTo(0, 12, 0, 12, 0, 12);
        this.context.bezierCurveTo(0, 12, 0, 12, 5, 8);
        this.context.bezierCurveTo(10, 1, 5, -2, 0, 3);
        this.context.closePath();
        this.context.fill();
        
        this.context.restore();
    }

    /**
     * 颜色变亮函数
     * @private
     */
    _lightenColor(color, amount) {
        // 简化的颜色变亮函数
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.floor(255 * amount));
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.floor(255 * amount));
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.floor(255 * amount));
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * 传统角色绘制方法（回退选项）
     * @private
     */
    _drawTraditionalCharacter(characterData, emotion) {
        // 保留原有的绘制方法作为回退
        this._drawCharacterBody(characterData, emotion);
        this._drawCharacterFace(characterData, emotion);
        this._drawCharacterDetails(characterData, emotion);
    }

    /**
     * 角色形态转换
     * @param {string} fromStage - 起始阶段
     * @param {string} toStage - 目标阶段
     * @param {number} duration - 转换持续时间
     */
    transitionToStage(fromStage, toStage, duration = 1000) {
        if (this.isTransitioning) {
            return Promise.reject(new Error('Transition already in progress'));
        }

        this.isTransitioning = true;
        this.transitionDuration = duration;
        this.transitionProgress = 0;
        this.transitionEffects = this._createTransitionEffects(fromStage, toStage);

        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                this.transitionProgress = Math.min(elapsed / duration, 1);
                
                // 使用缓动函数
                const easeProgress = this._easeInOutCubic(this.transitionProgress);
                
                // 渲染转换中的角色
                this._renderTransition(fromStage, toStage, easeProgress);
                
                // 渲染成长变化特效
                this._renderGrowthEffects(easeProgress);
                
                if (this.transitionProgress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.isTransitioning = false;
                    this.currentStage = toStage;
                    this.transitionEffects = null;
                    resolve();
                }
            };
            
            animate();
        });
    }

    /**
     * 创建转换特效
     * @private
     */
    _createTransitionEffects(fromStage, toStage) {
        const effects = {
            particles: [],
            lights: [],
            growthRings: []
        };

        // 创建成长光环
        for (let i = 0; i < 3; i++) {
            effects.growthRings.push({
                radius: 30 + i * 20,
                opacity: 0,
                maxOpacity: 0.6 - i * 0.2,
                color: `hsl(${120 + i * 30}, 70%, 60%)`,
                speed: 1 + i * 0.5
            });
        }

        // 创建成长粒子
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            effects.particles.push({
                x: Math.cos(angle) * 50,
                y: Math.sin(angle) * 50,
                targetX: Math.cos(angle) * 80,
                targetY: Math.sin(angle) * 80,
                size: Math.random() * 4 + 2,
                color: `hsl(${Math.random() * 60 + 60}, 80%, 70%)`,
                opacity: 0,
                maxOpacity: 0.8,
                life: 0
            });
        }

        return effects;
    }

    /**
     * 渲染成长特效
     * @private
     */
    _renderGrowthEffects(progress) {
        if (!this.transitionEffects) return;

        this.context.save();
        this.context.translate(this.currentPosition.x, this.currentPosition.y);

        // 渲染成长光环
        this.transitionEffects.growthRings.forEach((ring, index) => {
            const ringProgress = Math.max(0, Math.min(1, (progress - index * 0.2) * 2));
            ring.opacity = ring.maxOpacity * Math.sin(ringProgress * Math.PI);
            
            if (ring.opacity > 0) {
                this.context.globalAlpha = ring.opacity;
                this.context.strokeStyle = ring.color;
                this.context.lineWidth = 3;
                this.context.beginPath();
                this.context.arc(0, 0, ring.radius * (1 + ringProgress * 0.5), 0, 2 * Math.PI);
                this.context.stroke();
            }
        });

        // 渲染成长粒子
        this.transitionEffects.particles.forEach(particle => {
            const particleProgress = Math.max(0, Math.min(1, progress * 1.5));
            particle.opacity = particle.maxOpacity * Math.sin(particleProgress * Math.PI);
            
            if (particle.opacity > 0) {
                // 粒子向外扩散
                const currentX = particle.x + (particle.targetX - particle.x) * particleProgress;
                const currentY = particle.y + (particle.targetY - particle.y) * particleProgress;
                
                this.context.globalAlpha = particle.opacity;
                this.context.fillStyle = particle.color;
                this.context.beginPath();
                this.context.arc(currentX, currentY, particle.size, 0, 2 * Math.PI);
                this.context.fill();
            }
        });

        this.context.restore();
    }

    /**
     * 更新角色形态
     * @param {string} stage - 新的人生阶段
     */
    updateCharacterForm(stage) {
        if (this.characterAssets.has(stage)) {
            this.currentStage = stage;
        }
    }

    /**
     * 设置角色情感
     * @param {string} emotion - 情感状态
     */
    setCharacterEmotion(emotion) {
        this.currentEmotion = emotion;
    }

    /**
     * 替换角色视觉资源
     * @param {Object} newVisualAssets - 新的视觉资源
     */
    replaceCharacterVisual(newVisualAssets) {
        if (newVisualAssets && typeof newVisualAssets === 'object') {
            // 合并新的视觉资源
            for (const [stage, assets] of Object.entries(newVisualAssets)) {
                if (this.characterAssets.has(stage)) {
                    const currentAssets = this.characterAssets.get(stage);
                    this.characterAssets.set(stage, { ...currentAssets, ...assets });
                }
            }
        }
    }

    /**
     * 获取角色边界
     * @returns {Object} 边界信息
     */
    getCharacterBounds() {
        const characterData = this.characterAssets.get(this.currentStage);
        if (!characterData) return null;

        return {
            x: this.currentPosition.x - (characterData.size.width * this.scale) / 2,
            y: this.currentPosition.y - (characterData.size.height * this.scale) / 2,
            width: characterData.size.width * this.scale,
            height: characterData.size.height * this.scale
        };
    }

    /**
     * 绘制角色身体
     * @private
     */
    _drawCharacterBody(characterData, emotion) {
        const { bodyShape, colors, posture } = characterData;
        
        this.context.fillStyle = colors.skin;
        this.context.strokeStyle = '#D2B48C';
        this.context.lineWidth = 2;
        
        // 绘制身体（使用详细的身体形状数据）
        this.context.beginPath();
        this.context.ellipse(0, bodyShape.bodyHeight/4, 
                           bodyShape.bodyWidth/2, bodyShape.bodyHeight/2, 
                           0, 0, 2 * Math.PI);
        this.context.fill();
        this.context.stroke();
        
        // 绘制四肢
        this._drawLimbs(bodyShape, colors);
        
        // 根据姿态调整身体形状
        this._adjustPosture(posture, bodyShape);
    }

    /**
     * 绘制四肢
     * @private
     */
    _drawLimbs(bodyShape, colors) {
        this.context.strokeStyle = colors.skin;
        this.context.lineWidth = bodyShape.limbThickness;
        this.context.lineCap = 'round';
        
        // 手臂
        const armLength = bodyShape.bodyHeight * 0.6;
        const armY = bodyShape.bodyHeight * 0.1;
        
        // 左臂
        this.context.beginPath();
        this.context.moveTo(-bodyShape.bodyWidth/2, armY);
        this.context.lineTo(-bodyShape.bodyWidth/2 - armLength * 0.4, armY + armLength * 0.3);
        this.context.stroke();
        
        // 右臂
        this.context.beginPath();
        this.context.moveTo(bodyShape.bodyWidth/2, armY);
        this.context.lineTo(bodyShape.bodyWidth/2 + armLength * 0.4, armY + armLength * 0.3);
        this.context.stroke();
        
        // 腿部
        const legLength = bodyShape.bodyHeight * 0.8;
        const legY = bodyShape.bodyHeight/2;
        
        // 左腿
        this.context.beginPath();
        this.context.moveTo(-bodyShape.bodyWidth/3, legY);
        this.context.lineTo(-bodyShape.bodyWidth/3, legY + legLength);
        this.context.stroke();
        
        // 右腿
        this.context.beginPath();
        this.context.moveTo(bodyShape.bodyWidth/3, legY);
        this.context.lineTo(bodyShape.bodyWidth/3, legY + legLength);
        this.context.stroke();
    }

    /**
     * 绘制角色面部
     * @private
     */
    _drawCharacterFace(characterData, emotion) {
        const { bodyShape, colors, features } = characterData;
        const headRadius = bodyShape.headRadius;
        
        // 绘制头部
        this.context.fillStyle = colors.skin;
        this.context.strokeStyle = '#D2B48C';
        this.context.lineWidth = 2;
        
        this.context.beginPath();
        this.context.arc(0, -bodyShape.bodyHeight/3, headRadius, 0, 2 * Math.PI);
        this.context.fill();
        this.context.stroke();
        
        // 绘制眼睛
        this._drawEyes(colors.eyes, emotion, headRadius);
        
        // 绘制嘴巴
        this._drawMouth(emotion, headRadius);
        
        // 绘制头发
        this._drawHair(colors.hair, headRadius);
        
        // 绘制特殊特征
        this._drawSpecialFeatures(features, headRadius, colors);
    }

    /**
     * 绘制特殊特征
     * @private
     */
    _drawSpecialFeatures(features, headRadius, colors) {
        const faceY = -headRadius;
        
        features.forEach(feature => {
            switch (feature) {
                case 'chubby_cheeks':
                    // 婴儿胖嘟嘟的脸颊
                    this.context.fillStyle = 'rgba(255, 182, 193, 0.3)';
                    this.context.beginPath();
                    this.context.arc(-headRadius * 0.6, faceY + headRadius * 0.2, headRadius * 0.2, 0, 2 * Math.PI);
                    this.context.fill();
                    this.context.beginPath();
                    this.context.arc(headRadius * 0.6, faceY + headRadius * 0.2, headRadius * 0.2, 0, 2 * Math.PI);
                    this.context.fill();
                    break;
                    
                case 'weathered_features':
                    // 老人的皱纹
                    this.context.strokeStyle = 'rgba(139, 69, 19, 0.3)';
                    this.context.lineWidth = 1;
                    // 眼角皱纹
                    this.context.beginPath();
                    this.context.moveTo(headRadius * 0.5, faceY - headRadius * 0.1);
                    this.context.lineTo(headRadius * 0.7, faceY - headRadius * 0.2);
                    this.context.stroke();
                    this.context.beginPath();
                    this.context.moveTo(-headRadius * 0.5, faceY - headRadius * 0.1);
                    this.context.lineTo(-headRadius * 0.7, faceY - headRadius * 0.2);
                    this.context.stroke();
                    break;
                    
                case 'defined_features':
                    // 成人的轮廓分明
                    this.context.strokeStyle = 'rgba(139, 69, 19, 0.2)';
                    this.context.lineWidth = 1;
                    this.context.beginPath();
                    this.context.arc(0, faceY, headRadius * 0.9, 0.1 * Math.PI, 0.9 * Math.PI);
                    this.context.stroke();
                    break;
            }
        });
    }

    /**
     * 绘制角色细节
     * @private
     */
    _drawCharacterDetails(characterData, emotion) {
        // 根据情感状态添加特殊效果
        if (emotion === 'happy') {
            this._addHappyEffects();
        } else if (emotion === 'sad') {
            this._addSadEffects();
        } else if (emotion === 'excited') {
            this._addExcitedEffects();
        }
    }

    /**
     * 绘制眼睛
     * @private
     */
    _drawEyes(eyeColor, emotion, headRadius) {
        const eyeY = -headRadius * 0.3;
        const eyeSize = headRadius * 0.15;
        
        // 左眼
        this.context.fillStyle = 'white';
        this.context.beginPath();
        this.context.arc(-headRadius * 0.3, eyeY, eyeSize, 0, 2 * Math.PI);
        this.context.fill();
        this.context.stroke();
        
        // 右眼
        this.context.beginPath();
        this.context.arc(headRadius * 0.3, eyeY, eyeSize, 0, 2 * Math.PI);
        this.context.fill();
        this.context.stroke();
        
        // 瞳孔
        this.context.fillStyle = eyeColor;
        const pupilSize = eyeSize * 0.6;
        
        // 根据情感调整瞳孔
        let pupilOffset = 0;
        if (emotion === 'surprised') pupilSize *= 1.2;
        if (emotion === 'sleepy') pupilOffset = eyeSize * 0.3;
        
        this.context.beginPath();
        this.context.arc(-headRadius * 0.3, eyeY + pupilOffset, pupilSize, 0, 2 * Math.PI);
        this.context.fill();
        
        this.context.beginPath();
        this.context.arc(headRadius * 0.3, eyeY + pupilOffset, pupilSize, 0, 2 * Math.PI);
        this.context.fill();
    }

    /**
     * 绘制嘴巴
     * @private
     */
    _drawMouth(emotion, headRadius) {
        const mouthY = headRadius * 0.2;
        const mouthWidth = headRadius * 0.4;
        
        this.context.strokeStyle = '#8B4513';
        this.context.lineWidth = 3;
        this.context.lineCap = 'round';
        
        this.context.beginPath();
        
        switch (emotion) {
            case 'happy':
                // 微笑
                this.context.arc(0, mouthY - headRadius * 0.1, mouthWidth, 0.2 * Math.PI, 0.8 * Math.PI);
                break;
            case 'sad':
                // 皱眉
                this.context.arc(0, mouthY + headRadius * 0.1, mouthWidth, 1.2 * Math.PI, 1.8 * Math.PI);
                break;
            case 'surprised':
                // 张嘴
                this.context.arc(0, mouthY, mouthWidth * 0.3, 0, 2 * Math.PI);
                break;
            default:
                // 中性表情
                this.context.moveTo(-mouthWidth/2, mouthY);
                this.context.lineTo(mouthWidth/2, mouthY);
        }
        
        this.context.stroke();
    }

    /**
     * 绘制头发
     * @private
     */
    _drawHair(hairColor, headRadius) {
        this.context.fillStyle = hairColor;
        this.context.strokeStyle = hairColor;
        this.context.lineWidth = 2;
        
        // 简化的头发绘制
        this.context.beginPath();
        this.context.arc(0, -headRadius * 1.2, headRadius * 0.8, 0, Math.PI);
        this.context.fill();
    }

    /**
     * 调整姿态
     * @private
     */
    _adjustPosture(posture, bodyShape) {
        // 根据不同姿态调整角色的整体形状和位置
        switch (posture) {
            case 'sitting':
                // 婴儿坐姿 - 身体略微下沉
                this.context.translate(0, bodyShape.bodyHeight * 0.15);
                this.context.scale(1, 0.9); // 略微压扁
                break;
            case 'standing':
                // 儿童站姿 - 挺直身体
                this.context.translate(0, -bodyShape.bodyHeight * 0.05);
                break;
            case 'confident':
                // 青少年自信姿态 - 略微挺胸
                this.context.translate(0, -bodyShape.bodyHeight * 0.08);
                this.context.scale(1, 1.05); // 略微拉长
                break;
            case 'professional':
                // 成人职业姿态 - 端正挺拔
                this.context.translate(0, -bodyShape.bodyHeight * 0.1);
                this.context.scale(0.98, 1.08); // 略微收窄拉长
                break;
            case 'gentle':
                // 老人温和姿态 - 略微弯腰
                this.context.translate(0, bodyShape.bodyHeight * 0.08);
                this.context.scale(1.02, 0.95); // 略微宽一点矮一点
                break;
        }
    }

    /**
     * 添加快乐效果
     * @private
     */
    _addHappyEffects() {
        // 可以添加闪光或其他快乐的视觉效果
        this.context.fillStyle = 'rgba(255, 255, 0, 0.3)';
        this.context.beginPath();
        this.context.arc(0, 0, 50, 0, 2 * Math.PI);
        this.context.fill();
    }

    /**
     * 添加悲伤效果
     * @private
     */
    _addSadEffects() {
        // 可以添加眼泪或其他悲伤的视觉效果
        this.context.fillStyle = 'rgba(0, 100, 255, 0.6)';
        this.context.beginPath();
        this.context.arc(-15, -10, 3, 0, 2 * Math.PI);
        this.context.fill();
    }

    /**
     * 添加兴奋效果
     * @private
     */
    _addExcitedEffects() {
        // 可以添加能量波或其他兴奋的视觉效果
        this.context.strokeStyle = 'rgba(255, 100, 0, 0.5)';
        this.context.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            this.context.beginPath();
            this.context.arc(0, 0, 30 + i * 10, 0, 2 * Math.PI);
            this.context.stroke();
        }
    }

    /**
     * 渲染转换动画
     * @private
     */
    _renderTransition(fromStage, toStage, progress) {
        const fromData = this.characterAssets.get(fromStage);
        const toData = this.characterAssets.get(toStage);
        
        if (!fromData || !toData) return;
        
        // 插值计算转换中的属性
        const transitionData = this._interpolateCharacterData(fromData, toData, progress);
        
        // 渲染转换中的角色
        this.context.save();
        this.context.translate(this.currentPosition.x, this.currentPosition.y);
        this.context.scale(this.scale, this.scale);
        
        this._drawCharacterBody(transitionData, this.currentEmotion);
        this._drawCharacterFace(transitionData, this.currentEmotion);
        this._drawCharacterDetails(transitionData, this.currentEmotion);
        
        this.context.restore();
    }

    /**
     * 插值计算角色数据
     * @private
     */
    _interpolateCharacterData(fromData, toData, progress) {
        return {
            size: {
                width: this._lerp(fromData.size.width, toData.size.width, progress),
                height: this._lerp(fromData.size.height, toData.size.height, progress)
            },
            proportions: {
                head: this._lerp(fromData.proportions.head, toData.proportions.head, progress),
                body: this._lerp(fromData.proportions.body, toData.proportions.body, progress),
                limbs: this._lerp(fromData.proportions.limbs, toData.proportions.limbs, progress)
            },
            bodyShape: {
                headRadius: this._lerp(fromData.bodyShape.headRadius, toData.bodyShape.headRadius, progress),
                bodyWidth: this._lerp(fromData.bodyShape.bodyWidth, toData.bodyShape.bodyWidth, progress),
                bodyHeight: this._lerp(fromData.bodyShape.bodyHeight, toData.bodyShape.bodyHeight, progress),
                limbThickness: this._lerp(fromData.bodyShape.limbThickness, toData.bodyShape.limbThickness, progress)
            },
            colors: this._interpolateColors(fromData.colors, toData.colors, progress),
            features: progress < 0.5 ? fromData.features : toData.features,
            posture: progress < 0.5 ? fromData.posture : toData.posture,
            characteristics: progress < 0.5 ? fromData.characteristics : toData.characteristics
        };
    }

    /**
     * 插值计算颜色
     * @private
     */
    _interpolateColors(fromColors, toColors, progress) {
        const result = {};
        
        for (const key in fromColors) {
            if (toColors[key]) {
                result[key] = this._interpolateColor(fromColors[key], toColors[key], progress);
            } else {
                result[key] = fromColors[key];
            }
        }
        
        return result;
    }

    /**
     * 插值计算单个颜色
     * @private
     */
    _interpolateColor(color1, color2, progress) {
        // 简化的颜色插值，实际应用中可以使用更复杂的颜色空间插值
        if (progress < 0.5) {
            return color1;
        } else {
            return color2;
        }
    }

    /**
     * 线性插值
     * @private
     */
    _lerp(start, end, progress) {
        return start + (end - start) * progress;
    }

    /**
     * 缓动函数
     * @private
     */
    _easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterRenderer;
} else if (typeof window !== 'undefined') {
    window.CharacterRenderer = CharacterRenderer;
}