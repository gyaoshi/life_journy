/**
 * 角色渲染器 - 负责渲染不同人生阶段的角色形态
 * 支持角色形态转换、情感表达和视觉替换
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
        
        // 初始化默认角色形态
        this.initializeCharacterForms();
    }

    /**
     * 初始化角色形态定义
     */
    initializeCharacterForms() {
        // 婴儿形态
        this.characterAssets.set('baby', {
            size: { width: 40, height: 40 },
            proportions: { head: 0.4, body: 0.6 },
            features: ['round_face', 'big_eyes', 'small_nose'],
            colors: { skin: '#FFE4C4', hair: '#8B4513', eyes: '#4169E1' },
            posture: 'sitting'
        });

        // 儿童形态
        this.characterAssets.set('child', {
            size: { width: 50, height: 60 },
            proportions: { head: 0.35, body: 0.65 },
            features: ['curious_eyes', 'playful_smile', 'energetic'],
            colors: { skin: '#FFE4C4', hair: '#8B4513', eyes: '#4169E1' },
            posture: 'standing'
        });

        // 青少年形态
        this.characterAssets.set('teen', {
            size: { width: 55, height: 75 },
            proportions: { head: 0.3, body: 0.7 },
            features: ['expressive_eyes', 'youthful_face', 'growing'],
            colors: { skin: '#FFE4C4', hair: '#8B4513', eyes: '#4169E1' },
            posture: 'confident'
        });

        // 成人形态
        this.characterAssets.set('adult', {
            size: { width: 60, height: 80 },
            proportions: { head: 0.25, body: 0.75 },
            features: ['mature_face', 'confident_eyes', 'stable'],
            colors: { skin: '#FFE4C4', hair: '#8B4513', eyes: '#4169E1' },
            posture: 'professional'
        });

        // 老人形态
        this.characterAssets.set('elder', {
            size: { width: 55, height: 75 },
            proportions: { head: 0.28, body: 0.72 },
            features: ['wise_eyes', 'gentle_smile', 'experienced'],
            colors: { skin: '#F5DEB3', hair: '#C0C0C0', eyes: '#4169E1' },
            posture: 'gentle'
        });
    }

    /**
     * 渲染角色
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
        
        // 渲染角色
        this._drawCharacterBody(characterData, emotion);
        this._drawCharacterFace(characterData, emotion);
        this._drawCharacterDetails(characterData, emotion);
        
        // 恢复上下文状态
        this.context.restore();
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

        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                this.transitionProgress = Math.min(elapsed / duration, 1);
                
                // 使用缓动函数
                const easeProgress = this._easeInOutCubic(this.transitionProgress);
                
                // 渲染转换中的角色
                this._renderTransition(fromStage, toStage, easeProgress);
                
                if (this.transitionProgress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.isTransitioning = false;
                    this.currentStage = toStage;
                    resolve();
                }
            };
            
            animate();
        });
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
        const { size, colors, posture } = characterData;
        
        this.context.fillStyle = colors.skin;
        this.context.strokeStyle = '#8B4513';
        this.context.lineWidth = 2;
        
        // 绘制身体（简化的椭圆形）
        const bodyWidth = size.width * 0.6;
        const bodyHeight = size.height * characterData.proportions.body;
        
        this.context.beginPath();
        this.context.ellipse(0, bodyHeight/4, bodyWidth/2, bodyHeight/2, 0, 0, 2 * Math.PI);
        this.context.fill();
        this.context.stroke();
        
        // 根据姿态调整身体形状
        this._adjustPosture(posture, size);
    }

    /**
     * 绘制角色面部
     * @private
     */
    _drawCharacterFace(characterData, emotion) {
        const { size, colors, features } = characterData;
        const headRadius = (size.width * characterData.proportions.head) / 2;
        
        // 绘制头部
        this.context.fillStyle = colors.skin;
        this.context.strokeStyle = '#8B4513';
        this.context.lineWidth = 2;
        
        this.context.beginPath();
        this.context.arc(0, -size.height/3, headRadius, 0, 2 * Math.PI);
        this.context.fill();
        this.context.stroke();
        
        // 绘制眼睛
        this._drawEyes(colors.eyes, emotion, headRadius);
        
        // 绘制嘴巴
        this._drawMouth(emotion, headRadius);
        
        // 绘制头发
        this._drawHair(colors.hair, headRadius);
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
    _adjustPosture(posture, size) {
        // 根据不同姿态调整角色的整体形状
        switch (posture) {
            case 'sitting':
                this.context.translate(0, size.height * 0.1);
                break;
            case 'confident':
                this.context.translate(0, -size.height * 0.05);
                break;
            case 'gentle':
                this.context.translate(0, size.height * 0.05);
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
                body: this._lerp(fromData.proportions.body, toData.proportions.body, progress)
            },
            colors: fromData.colors, // 颜色暂时不插值
            features: progress < 0.5 ? fromData.features : toData.features,
            posture: progress < 0.5 ? fromData.posture : toData.posture
        };
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