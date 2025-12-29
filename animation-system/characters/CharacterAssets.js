/**
 * 角色视觉资源管理器
 * 负责管理和加载不同人生阶段的角色视觉资源
 * 替换原有的简单笑脸为详细的人物形象
 */
class CharacterAssets {
    constructor() {
        this.assets = new Map();
        this.loadedAssets = new Map();
        this.isLoading = false;
        
        // 初始化资源配置
        this.initializeAssetConfigs();
    }

    /**
     * 初始化资源配置
     */
    initializeAssetConfigs() {
        // 婴儿期资源配置
        this.assets.set('baby', {
            sprites: {
                idle: this._generateBabyIdleFrames(),
                walk: this._generateBabyWalkFrames(),
                emotions: {
                    happy: this._generateBabyHappyFrames(),
                    sad: this._generateBabySadFrames(),
                    surprised: this._generateBabySurprisedFrames(),
                    sleepy: this._generateBabySleepyFrames()
                }
            },
            dimensions: {
                width: 40,
                height: 40,
                scale: 1.0
            },
            animations: {
                frameRate: 8,
                looping: true,
                transitions: {
                    idle_to_walk: 200,
                    walk_to_idle: 200,
                    emotion_change: 300
                }
            },
            characteristics: {
                headSize: 'large',
                bodyProportions: 'chubby',
                features: ['big_eyes', 'small_nose', 'round_cheeks'],
                colors: {
                    skin: '#FFE4C4',
                    hair: '#D2B48C',
                    eyes: '#4169E1',
                    clothes: '#FFB6C1'
                }
            }
        });

        // 儿童期资源配置
        this.assets.set('child', {
            sprites: {
                idle: this._generateChildIdleFrames(),
                walk: this._generateChildWalkFrames(),
                run: this._generateChildRunFrames(),
                emotions: {
                    happy: this._generateChildHappyFrames(),
                    excited: this._generateChildExcitedFrames(),
                    curious: this._generateChildCuriousFrames(),
                    playful: this._generateChildPlayfulFrames()
                }
            },
            dimensions: {
                width: 50,
                height: 60,
                scale: 1.0
            },
            animations: {
                frameRate: 12,
                looping: true,
                transitions: {
                    idle_to_walk: 150,
                    walk_to_run: 100,
                    emotion_change: 250
                }
            },
            characteristics: {
                headSize: 'medium',
                bodyProportions: 'energetic',
                features: ['bright_eyes', 'playful_smile', 'active_posture'],
                colors: {
                    skin: '#FFE4C4',
                    hair: '#8B4513',
                    eyes: '#32CD32',
                    clothes: '#87CEEB'
                }
            }
        });

        // 青少年期资源配置
        this.assets.set('teen', {
            sprites: {
                idle: this._generateTeenIdleFrames(),
                walk: this._generateTeenWalkFrames(),
                emotions: {
                    confident: this._generateTeenConfidentFrames(),
                    shy: this._generateTeenShyFrames(),
                    determined: this._generateTeenDeterminedFrames(),
                    romantic: this._generateTeenRomanticFrames()
                }
            },
            dimensions: {
                width: 55,
                height: 75,
                scale: 1.0
            },
            animations: {
                frameRate: 10,
                looping: true,
                transitions: {
                    idle_to_walk: 180,
                    emotion_change: 400
                }
            },
            characteristics: {
                headSize: 'proportional',
                bodyProportions: 'growing',
                features: ['expressive_eyes', 'youthful_face', 'dynamic_posture'],
                colors: {
                    skin: '#FFE4C4',
                    hair: '#654321',
                    eyes: '#8B4513',
                    clothes: '#DDA0DD'
                }
            }
        });

        // 成年期资源配置
        this.assets.set('adult', {
            sprites: {
                idle: this._generateAdultIdleFrames(),
                walk: this._generateAdultWalkFrames(),
                professional: this._generateAdultProfessionalFrames(),
                emotions: {
                    confident: this._generateAdultConfidentFrames(),
                    focused: this._generateAdultFocusedFrames(),
                    caring: this._generateAdultCaringFrames(),
                    proud: this._generateAdultProudFrames()
                }
            },
            dimensions: {
                width: 60,
                height: 80,
                scale: 1.0
            },
            animations: {
                frameRate: 8,
                looping: true,
                transitions: {
                    idle_to_walk: 200,
                    emotion_change: 350
                }
            },
            characteristics: {
                headSize: 'mature',
                bodyProportions: 'stable',
                features: ['mature_eyes', 'confident_smile', 'professional_posture'],
                colors: {
                    skin: '#FFE4C4',
                    hair: '#8B4513',
                    eyes: '#4169E1',
                    clothes: '#2F4F4F'
                }
            }
        });

        // 老年期资源配置
        this.assets.set('elder', {
            sprites: {
                idle: this._generateElderIdleFrames(),
                walk: this._generateElderWalkFrames(),
                emotions: {
                    wise: this._generateElderWiseFrames(),
                    gentle: this._generateElderGentleFrames(),
                    peaceful: this._generateElderPeacefulFrames(),
                    nostalgic: this._generateElderNostalgicFrames()
                }
            },
            dimensions: {
                width: 55,
                height: 75,
                scale: 1.0
            },
            animations: {
                frameRate: 6,
                looping: true,
                transitions: {
                    idle_to_walk: 300,
                    emotion_change: 500
                }
            },
            characteristics: {
                headSize: 'wise',
                bodyProportions: 'gentle',
                features: ['kind_eyes', 'gentle_smile', 'calm_posture'],
                colors: {
                    skin: '#F5DEB3',
                    hair: '#C0C0C0',
                    eyes: '#4682B4',
                    clothes: '#8FBC8F'
                }
            }
        });
    }

    /**
     * 获取指定阶段的资源配置
     * @param {string} stage - 人生阶段
     * @returns {Object} 资源配置
     */
    getAssetConfig(stage) {
        return this.assets.get(stage);
    }

    /**
     * 获取所有可用的人生阶段
     * @returns {Array} 阶段列表
     */
    getAvailableStages() {
        return Array.from(this.assets.keys());
    }

    /**
     * 预加载指定阶段的资源
     * @param {string} stage - 人生阶段
     * @returns {Promise} 加载完成的Promise
     */
    async preloadStageAssets(stage) {
        if (this.loadedAssets.has(stage)) {
            return this.loadedAssets.get(stage);
        }

        const config = this.assets.get(stage);
        if (!config) {
            throw new Error(`Unknown stage: ${stage}`);
        }

        // 模拟资源加载过程
        const loadedData = await this._loadAssetData(config);
        this.loadedAssets.set(stage, loadedData);
        
        return loadedData;
    }

    /**
     * 预加载所有阶段的资源
     * @returns {Promise} 所有资源加载完成的Promise
     */
    async preloadAllAssets() {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        
        try {
            const stages = this.getAvailableStages();
            const loadPromises = stages.map(stage => this.preloadStageAssets(stage));
            await Promise.all(loadPromises);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 获取角色精灵帧
     * @param {string} stage - 人生阶段
     * @param {string} animation - 动画类型
     * @param {string} emotion - 情感状态（可选）
     * @returns {Array} 精灵帧数组
     */
    getSpriteFrames(stage, animation, emotion = null) {
        const config = this.assets.get(stage);
        if (!config) return [];

        if (emotion && config.sprites.emotions && config.sprites.emotions[emotion]) {
            return config.sprites.emotions[emotion];
        }

        return config.sprites[animation] || [];
    }

    /**
     * 获取角色特征
     * @param {string} stage - 人生阶段
     * @returns {Object} 角色特征
     */
    getCharacteristics(stage) {
        const config = this.assets.get(stage);
        return config ? config.characteristics : null;
    }

    /**
     * 更新角色资源
     * @param {string} stage - 人生阶段
     * @param {Object} newAssets - 新的资源配置
     */
    updateAssets(stage, newAssets) {
        if (this.assets.has(stage)) {
            const currentAssets = this.assets.get(stage);
            this.assets.set(stage, { ...currentAssets, ...newAssets });
            
            // 清除已加载的缓存，强制重新加载
            if (this.loadedAssets.has(stage)) {
                this.loadedAssets.delete(stage);
            }
        }
    }

    // 以下是生成各个阶段动画帧的私有方法
    // 这些方法返回描述性的帧数据，实际实现中可以是图像数据或绘制指令

    _generateBabyIdleFrames() {
        return [
            { type: 'baby_idle', frame: 0, description: '婴儿安静坐着，眼睛眨动' },
            { type: 'baby_idle', frame: 1, description: '婴儿轻微摇摆，表情天真' },
            { type: 'baby_idle', frame: 2, description: '婴儿回到中心位置，微笑' }
        ];
    }

    _generateBabyWalkFrames() {
        return [
            { type: 'baby_crawl', frame: 0, description: '婴儿准备爬行' },
            { type: 'baby_crawl', frame: 1, description: '婴儿向前爬行' },
            { type: 'baby_crawl', frame: 2, description: '婴儿继续爬行动作' }
        ];
    }

    _generateBabyHappyFrames() {
        return [
            { type: 'baby_happy', frame: 0, description: '婴儿开心笑容，眼睛弯成月牙' },
            { type: 'baby_happy', frame: 1, description: '婴儿拍手，表情兴奋' }
        ];
    }

    _generateBabySadFrames() {
        return [
            { type: 'baby_sad', frame: 0, description: '婴儿皱眉，嘴角下垂' },
            { type: 'baby_sad', frame: 1, description: '婴儿眼中含泪' }
        ];
    }

    _generateBabySurprisedFrames() {
        return [
            { type: 'baby_surprised', frame: 0, description: '婴儿眼睛睁大，嘴巴张开' }
        ];
    }

    _generateBabySleepyFrames() {
        return [
            { type: 'baby_sleepy', frame: 0, description: '婴儿眼睛半闭，打哈欠' }
        ];
    }

    _generateChildIdleFrames() {
        return [
            { type: 'child_idle', frame: 0, description: '儿童站立，好奇地环顾四周' },
            { type: 'child_idle', frame: 1, description: '儿童轻微跳跃，充满活力' },
            { type: 'child_idle', frame: 2, description: '儿童回到站立姿势，微笑' }
        ];
    }

    _generateChildWalkFrames() {
        return [
            { type: 'child_walk', frame: 0, description: '儿童抬起左脚' },
            { type: 'child_walk', frame: 1, description: '儿童向前迈步' },
            { type: 'child_walk', frame: 2, description: '儿童抬起右脚' },
            { type: 'child_walk', frame: 3, description: '儿童完成步伐' }
        ];
    }

    _generateChildRunFrames() {
        return [
            { type: 'child_run', frame: 0, description: '儿童准备奔跑' },
            { type: 'child_run', frame: 1, description: '儿童快速奔跑，头发飞扬' },
            { type: 'child_run', frame: 2, description: '儿童继续奔跑动作' }
        ];
    }

    _generateChildHappyFrames() {
        return [
            { type: 'child_happy', frame: 0, description: '儿童开心跳跃' },
            { type: 'child_happy', frame: 1, description: '儿童举起双手庆祝' }
        ];
    }

    _generateChildExcitedFrames() {
        return [
            { type: 'child_excited', frame: 0, description: '儿童兴奋地挥舞双臂' }
        ];
    }

    _generateChildCuriousFrames() {
        return [
            { type: 'child_curious', frame: 0, description: '儿童歪头思考，手指放在嘴边' }
        ];
    }

    _generateChildPlayfulFrames() {
        return [
            { type: 'child_playful', frame: 0, description: '儿童做鬼脸，调皮表情' }
        ];
    }

    // 青少年、成人、老人的帧生成方法类似...
    // 为了简洁，这里只展示几个关键的

    _generateTeenIdleFrames() {
        return [
            { type: 'teen_idle', frame: 0, description: '青少年自信站立，略显青涩' },
            { type: 'teen_idle', frame: 1, description: '青少年整理头发，展现青春活力' }
        ];
    }

    _generateTeenWalkFrames() {
        return [
            { type: 'teen_walk', frame: 0, description: '青少年步伐轻快' },
            { type: 'teen_walk', frame: 1, description: '青少年走路带有青春的朝气' }
        ];
    }

    _generateAdultIdleFrames() {
        return [
            { type: 'adult_idle', frame: 0, description: '成人稳重站立，姿态专业' },
            { type: 'adult_idle', frame: 1, description: '成人略微调整姿势，保持自信' }
        ];
    }

    _generateElderIdleFrames() {
        return [
            { type: 'elder_idle', frame: 0, description: '老人慈祥站立，散发智慧' },
            { type: 'elder_idle', frame: 1, description: '老人温和微笑，眼中有故事' }
        ];
    }

    // 其他情感帧生成方法...
    _generateTeenConfidentFrames() {
        return [{ type: 'teen_confident', frame: 0, description: '青少年挺胸抬头，自信满满' }];
    }

    _generateTeenShyFrames() {
        return [{ type: 'teen_shy', frame: 0, description: '青少年低头害羞，脸颊微红' }];
    }

    _generateTeenDeterminedFrames() {
        return [{ type: 'teen_determined', frame: 0, description: '青少年眼神坚定，握拳决心' }];
    }

    _generateTeenRomanticFrames() {
        return [{ type: 'teen_romantic', frame: 0, description: '青少年眼中有爱意，表情温柔' }];
    }

    _generateAdultConfidentFrames() {
        return [{ type: 'adult_confident', frame: 0, description: '成人展现成熟自信' }];
    }

    _generateAdultFocusedFrames() {
        return [{ type: 'adult_focused', frame: 0, description: '成人专注工作，眉头微皱' }];
    }

    _generateAdultCaringFrames() {
        return [{ type: 'adult_caring', frame: 0, description: '成人温柔关怀，眼神慈爱' }];
    }

    _generateAdultProudFrames() {
        return [{ type: 'adult_proud', frame: 0, description: '成人骄傲微笑，成就感满满' }];
    }

    _generateAdultProfessionalFrames() {
        return [{ type: 'adult_professional', frame: 0, description: '成人职业装扮，专业姿态' }];
    }

    _generateElderWiseFrames() {
        return [{ type: 'elder_wise', frame: 0, description: '老人智慧的眼神，深邃而温和' }];
    }

    _generateElderGentleFrames() {
        return [{ type: 'elder_gentle', frame: 0, description: '老人温柔慈祥，如春风般和煦' }];
    }

    _generateElderPeacefulFrames() {
        return [{ type: 'elder_peaceful', frame: 0, description: '老人内心平静，表情安详' }];
    }

    _generateElderNostalgicFrames() {
        return [{ type: 'elder_nostalgic', frame: 0, description: '老人回忆往昔，眼中有怀念' }];
    }

    _generateElderWalkFrames() {
        return [
            { type: 'elder_walk', frame: 0, description: '老人缓慢而稳重地行走' },
            { type: 'elder_walk', frame: 1, description: '老人每一步都很踏实' }
        ];
    }

    /**
     * 模拟资源加载
     * @private
     */
    async _loadAssetData(config) {
        // 模拟异步加载过程
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    ...config,
                    loaded: true,
                    loadTime: Date.now()
                });
            }, 100); // 模拟100ms加载时间
        });
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterAssets;
} else if (typeof window !== 'undefined') {
    window.CharacterAssets = CharacterAssets;
}