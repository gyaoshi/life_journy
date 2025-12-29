/**
 * LifeStage - 人生阶段数据模型
 * 定义人生阶段的属性和行为
 */
class LifeStage {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.duration = config.duration; // 持续时间(毫秒)
        this.difficulty = config.difficulty; // 难度系数(1-5)
        this.startTime = config.startTime; // 开始时间(毫秒)
        this.events = config.events || []; // 该阶段可能的事件
        this.scene = config.scene || null; // 场景配置
        
        // 阶段特性
        this.characteristics = config.characteristics || {};
        this.eventFrequency = config.eventFrequency || 3000; // 事件生成频率(毫秒)
        this.maxConcurrentEvents = config.maxConcurrentEvents || 2; // 最大并发事件数
        
        console.log(`LifeStage created: ${this.name}`);
    }
    
    /**
     * 获取阶段结束时间
     */
    getEndTime() {
        return this.startTime + this.duration;
    }
    
    /**
     * 检查指定时间是否在此阶段内
     */
    isTimeInStage(gameTime) {
        return gameTime >= this.startTime && gameTime < this.getEndTime();
    }
    
    /**
     * 获取阶段内的进度(0-1)
     */
    getProgressInStage(gameTime) {
        if (!this.isTimeInStage(gameTime)) {
            return gameTime < this.startTime ? 0 : 1;
        }
        
        const elapsed = gameTime - this.startTime;
        return elapsed / this.duration;
    }
    
    /**
     * 获取阶段剩余时间
     */
    getRemainingTime(gameTime) {
        if (gameTime < this.startTime) {
            return this.duration;
        }
        
        const elapsed = gameTime - this.startTime;
        return Math.max(0, this.duration - elapsed);
    }
    
    /**
     * 获取适合此阶段的事件类型
     */
    getAvailableEventTypes() {
        const stageEventTypes = {
            'baby': ['simple_click'],
            'child': ['simple_click', 'drag_target'],
            'teen': ['simple_click', 'drag_target', 'rapid_click'],
            'adult': ['simple_click', 'drag_target', 'rapid_click', 'moving_object'],
            'elder': ['simple_click', 'moving_object']
        };
        
        return stageEventTypes[this.id] || ['simple_click'];
    }
    
    /**
     * 获取阶段的视觉主题
     */
    getVisualTheme() {
        const themes = {
            'baby': {
                backgroundColor: '#ffb3ba',
                primaryColor: '#ff9999',
                secondaryColor: '#ffcccc',
                fontColor: '#333333'
            },
            'child': {
                backgroundColor: '#bae1ff',
                primaryColor: '#87ceeb',
                secondaryColor: '#add8e6',
                fontColor: '#2c3e50'
            },
            'teen': {
                backgroundColor: '#baffc9',
                primaryColor: '#90ee90',
                secondaryColor: '#98fb98',
                fontColor: '#2d5016'
            },
            'adult': {
                backgroundColor: '#ffffba',
                primaryColor: '#ffff99',
                secondaryColor: '#ffffe0',
                fontColor: '#8b7d3a'
            },
            'elder': {
                backgroundColor: '#ffdfba',
                primaryColor: '#deb887',
                secondaryColor: '#f5deb3',
                fontColor: '#8b4513'
            }
        };
        
        return themes[this.id] || themes['adult'];
    }
    
    /**
     * 获取阶段描述文本
     */
    getDescription() {
        const descriptions = {
            'baby': '刚来到这个世界，一切都是新奇的',
            'child': '无忧无虑的童年时光，充满好奇心',
            'teen': '青春年少，对未来充满憧憬',
            'adult': '承担责任，为理想而奋斗',
            'elder': '回望人生，珍惜剩余的时光'
        };
        
        return descriptions[this.id] || '人生的一个阶段';
    }
    
    /**
     * 获取阶段的典型事件名称
     */
    getTypicalEvents() {
        const typicalEvents = {
            'baby': ['第一次微笑', '学会翻身', '开始爬行', '第一次站立'],
            'child': ['上幼儿园', '学会骑车', '交到朋友', '第一次表演'],
            'teen': ['中学入学', '初恋体验', '选择专业', '高考冲刺'],
            'adult': ['找到工作', '结婚成家', '买房置业', '升职加薪'],
            'elder': ['退休生活', '含饴弄孙', '回忆往昔', '安享晚年']
        };
        
        return typicalEvents[this.id] || ['人生事件'];
    }
    
    /**
     * 计算基于阶段的事件难度调整
     */
    calculateEventDifficulty(baseEventType) {
        const difficultyModifiers = {
            'baby': 0.5,
            'child': 0.8,
            'teen': 1.0,
            'adult': 1.3,
            'elder': 1.1
        };
        
        const modifier = difficultyModifiers[this.id] || 1.0;
        return this.difficulty * modifier;
    }
    
    /**
     * 获取阶段的音效配置
     */
    getAudioConfig() {
        return {
            backgroundMusicTempo: this.characteristics.musicTempo || 'normal',
            voicePitch: this.characteristics.voicePitch || 'normal',
            soundEffectStyle: this.characteristics.soundStyle || 'default'
        };
    }
    
    /**
     * 检查是否为最后阶段
     */
    isLastStage() {
        return this.id === 'elder';
    }
    
    /**
     * 检查是否为第一阶段
     */
    isFirstStage() {
        return this.id === 'baby';
    }
    
    /**
     * 序列化阶段数据
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            duration: this.duration,
            difficulty: this.difficulty,
            startTime: this.startTime,
            events: this.events,
            scene: this.scene,
            characteristics: this.characteristics,
            eventFrequency: this.eventFrequency,
            maxConcurrentEvents: this.maxConcurrentEvents
        };
    }
    
    /**
     * 从序列化数据创建阶段
     */
    static deserialize(data) {
        return new LifeStage(data);
    }
    
    /**
     * 创建默认的人生阶段集合
     */
    static createDefaultStages() {
        return [
            new LifeStage({
                id: 'baby',
                name: '婴儿期',
                duration: 15000,
                difficulty: 1,
                startTime: 0,
                characteristics: {
                    musicTempo: 'slow',
                    voicePitch: 'high',
                    soundStyle: 'soft'
                }
            }),
            new LifeStage({
                id: 'child',
                name: '儿童期',
                duration: 20000,
                difficulty: 2,
                startTime: 15000,
                characteristics: {
                    musicTempo: 'moderate',
                    voicePitch: 'high',
                    soundStyle: 'playful'
                }
            }),
            new LifeStage({
                id: 'teen',
                name: '青少年期',
                duration: 20000,
                difficulty: 3,
                startTime: 35000,
                characteristics: {
                    musicTempo: 'fast',
                    voicePitch: 'normal',
                    soundStyle: 'energetic'
                }
            }),
            new LifeStage({
                id: 'adult',
                name: '成年期',
                duration: 30000,
                difficulty: 4,
                startTime: 55000,
                characteristics: {
                    musicTempo: 'very_fast',
                    voicePitch: 'normal',
                    soundStyle: 'intense'
                }
            }),
            new LifeStage({
                id: 'elder',
                name: '老年期',
                duration: 15000,
                difficulty: 3,
                startTime: 85000,
                characteristics: {
                    musicTempo: 'slow',
                    voicePitch: 'low',
                    soundStyle: 'gentle'
                }
            })
        ];
    }
}