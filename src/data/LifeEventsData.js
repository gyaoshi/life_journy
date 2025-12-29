/**
 * LifeEventsData - 丰富的人生事件内容数据
 * 为每个人生阶段定义具体的事件和交互任务
 */
class LifeEventsData {
    /**
     * 获取所有人生事件数据
     */
    static getAllEventTemplates() {
        return {
            'baby': this.getBabyEvents(),
            'child': this.getChildEvents(),
            'teen': this.getTeenEvents(),
            'adult': this.getAdultEvents(),
            'elder': this.getElderEvents()
        };
    }
    
    /**
     * 婴儿期事件 (0-15秒) - 3个事件，每5秒一个
     */
    static getBabyEvents() {
        return [
            {
                name: '第一次微笑',
                description: '对着妈妈露出人生第一个微笑',
                type: 'simple_click',
                difficulty: 1,
                timeLimit: 4000,
                points: 10,
                icon: '😊',
                color: '#ffb3ba',
                target: {
                    type: 'button',
                    size: { width: 120, height: 80 },
                    requiredClicks: 1
                }
            },
            {
                name: '学会翻身',
                description: '从仰卧翻到俯卧的重要里程碑',
                type: 'drag_target',
                difficulty: 1,
                timeLimit: 5000,
                points: 15,
                icon: '🔄',
                color: '#ffc9c9',
                target: {
                    type: 'drag_target',
                    size: { width: 100, height: 100 },
                    dragDistance: 60
                }
            },
            {
                name: '第一次爬行',
                description: '开始探索世界的第一步',
                type: 'rapid_click',
                difficulty: 1,
                timeLimit: 4500,
                points: 20,
                icon: '🚼',
                color: '#ffdddd',
                target: {
                    type: 'button',
                    size: { width: 110, height: 70 },
                    requiredClicks: 3
                }
            },
            {
                name: '认出妈妈',
                description: '第一次认出最重要的人',
                type: 'simple_click',
                difficulty: 1,
                timeLimit: 3500,
                points: 25,
                icon: '👶',
                color: '#ffe0e0',
                target: {
                    type: 'button',
                    size: { width: 130, height: 85 },
                    requiredClicks: 1
                }
            },
            {
                name: '第一次站立',
                description: '扶着东西勇敢地站起来',
                type: 'moving_object',
                difficulty: 1,
                timeLimit: 4000,
                points: 30,
                icon: '🧍',
                color: '#fff0f0',
                target: {
                    type: 'moving_object',
                    size: { width: 80, height: 80 },
                    speed: 40
                }
            },
            {
                name: '第一次叫妈妈',
                description: '说出人生第一个词语',
                type: 'simple_click',
                difficulty: 1,
                timeLimit: 3000,
                points: 35,
                icon: '👄',
                color: '#ffb3d1',
                target: {
                    type: 'button',
                    size: { width: 115, height: 75 },
                    requiredClicks: 1
                }
            }
        ];
    }
    
    /**
     * 儿童期事件 (15-35秒) - 4个事件，每5秒一个
     */
    static getChildEvents() {
        return [
            {
                name: '学会走路',
                description: '摇摇摆摆迈出人生第一步',
                type: 'rapid_click',
                difficulty: 2,
                timeLimit: 3500,
                points: 35,
                icon: '👣',
                color: '#bae1ff',
                target: {
                    type: 'button',
                    size: { width: 100, height: 60 },
                    requiredClicks: 4
                }
            },
            {
                name: '第一天上幼儿园',
                description: '离开家庭进入社会的第一步',
                type: 'moving_object',
                difficulty: 2,
                timeLimit: 3000,
                points: 40,
                icon: '🏫',
                color: '#87ceeb',
                target: {
                    type: 'moving_object',
                    size: { width: 70, height: 70 },
                    speed: 60
                }
            },
            {
                name: '学会骑自行车',
                description: '掌握平衡的重要技能',
                type: 'drag_target',
                difficulty: 2,
                timeLimit: 4000,
                points: 45,
                icon: '🚲',
                color: '#add8e6',
                target: {
                    type: 'drag_target',
                    size: { width: 90, height: 90 },
                    dragDistance: 80
                }
            },
            {
                name: '交到第一个朋友',
                description: '友谊的种子开始萌芽',
                type: 'simple_click',
                difficulty: 2,
                timeLimit: 3000,
                points: 50,
                icon: '👫',
                color: '#b0e0e6',
                target: {
                    type: 'button',
                    size: { width: 110, height: 75 },
                    requiredClicks: 1
                }
            },
            {
                name: '学会游泳',
                description: '克服对水的恐惧',
                type: 'rapid_click',
                difficulty: 2,
                timeLimit: 3500,
                points: 40,
                icon: '🏊',
                color: '#87cefa',
                target: {
                    type: 'button',
                    size: { width: 95, height: 65 },
                    requiredClicks: 5
                }
            },
            {
                name: '第一次表演',
                description: '在舞台上展示自己',
                type: 'moving_object',
                difficulty: 2,
                timeLimit: 2800,
                points: 55,
                icon: '🎭',
                color: '#b0c4de',
                target: {
                    type: 'moving_object',
                    size: { width: 65, height: 65 },
                    speed: 70
                }
            },
            {
                name: '学会写字',
                description: '掌握文字的神奇力量',
                type: 'drag_target',
                difficulty: 2,
                timeLimit: 3800,
                points: 35,
                icon: '✏️',
                color: '#98d8e8',
                target: {
                    type: 'drag_target',
                    size: { width: 85, height: 85 },
                    dragDistance: 70
                }
            },
            {
                name: '第一次比赛获奖',
                description: '努力得到了回报',
                type: 'rapid_click',
                difficulty: 2,
                timeLimit: 3200,
                points: 60,
                icon: '🏆',
                color: '#ffd700',
                target: {
                    type: 'button',
                    size: { width: 90, height: 60 },
                    requiredClicks: 4
                }
            }
        ];
    }
    
    /**
     * 青少年期事件 (35-55秒) - 4个事件，每5秒一个
     */
    static getTeenEvents() {
        return [
            {
                name: '中学入学考试',
                description: '人生第一次重要考试',
                type: 'rapid_click',
                difficulty: 3,
                timeLimit: 3000,
                points: 60,
                icon: '📝',
                color: '#baffc9',
                target: {
                    type: 'button',
                    size: { width: 85, height: 55 },
                    requiredClicks: 6
                }
            },
            {
                name: '初恋告白',
                description: '青春期最美好的回忆',
                type: 'moving_object',
                difficulty: 3,
                timeLimit: 2500,
                points: 70,
                icon: '💕',
                color: '#90ee90',
                target: {
                    type: 'moving_object',
                    size: { width: 55, height: 55 },
                    speed: 90
                }
            },
            {
                name: '参加社团活动',
                description: '发现自己的兴趣爱好',
                type: 'drag_target',
                difficulty: 3,
                timeLimit: 3500,
                points: 55,
                icon: '🎨',
                color: '#98fb98',
                target: {
                    type: 'drag_target',
                    size: { width: 80, height: 80 },
                    dragDistance: 100
                }
            },
            {
                name: '选择专业方向',
                description: '决定未来人生道路',
                type: 'simple_click',
                difficulty: 3,
                timeLimit: 4000,
                points: 80,
                icon: '🎓',
                color: '#90ee90',
                target: {
                    type: 'button',
                    size: { width: 100, height: 70 },
                    requiredClicks: 1
                }
            },
            {
                name: '高考冲刺',
                description: '为梦想拼搏的关键时刻',
                type: 'rapid_click',
                difficulty: 3,
                timeLimit: 2000,
                points: 90,
                icon: '📚',
                color: '#7fffd4',
                target: {
                    type: 'button',
                    size: { width: 75, height: 50 },
                    requiredClicks: 8
                }
            },
            {
                name: '获得奖学金',
                description: '努力得到认可的时刻',
                type: 'moving_object',
                difficulty: 3,
                timeLimit: 2200,
                points: 85,
                icon: '🏆',
                color: '#98fb98',
                target: {
                    type: 'moving_object',
                    size: { width: 50, height: 50 },
                    speed: 100
                }
            },
            {
                name: '第一次打工',
                description: '体验赚钱的不易',
                type: 'drag_target',
                difficulty: 3,
                timeLimit: 3200,
                points: 65,
                icon: '💼',
                color: '#90ee90',
                target: {
                    type: 'drag_target',
                    size: { width: 75, height: 75 },
                    dragDistance: 90
                }
            },
            {
                name: '毕业典礼',
                description: '告别青春迎接未来',
                type: 'simple_click',
                difficulty: 3,
                timeLimit: 3500,
                points: 75,
                icon: '🎓',
                color: '#32cd32',
                target: {
                    type: 'button',
                    size: { width: 95, height: 65 },
                    requiredClicks: 1
                }
            }
        ];
    }
    
    /**
     * 成年期事件 (55-85秒) - 6个事件，每5秒一个
     */
    static getAdultEvents() {
        return [
            {
                name: '找到第一份工作',
                description: '踏入社会的重要一步',
                type: 'drag_target',
                difficulty: 4,
                timeLimit: 2500,
                points: 100,
                icon: '💼',
                color: '#ffffba',
                target: {
                    type: 'drag_target',
                    size: { width: 70, height: 70 },
                    dragDistance: 120
                }
            },
            {
                name: '结婚典礼',
                description: '人生最重要的承诺',
                type: 'rapid_click',
                difficulty: 4,
                timeLimit: 2000,
                points: 120,
                icon: '💒',
                color: '#ffff99',
                target: {
                    type: 'button',
                    size: { width: 80, height: 50 },
                    requiredClicks: 7
                }
            },
            {
                name: '买房置业',
                description: '拥有属于自己的家',
                type: 'moving_object',
                difficulty: 4,
                timeLimit: 1800,
                points: 110,
                icon: '🏠',
                color: '#ffffe0',
                target: {
                    type: 'moving_object',
                    size: { width: 45, height: 45 },
                    speed: 130
                }
            },
            {
                name: '孩子出生',
                description: '生命的延续和希望',
                type: 'simple_click',
                difficulty: 4,
                timeLimit: 3000,
                points: 150,
                icon: '👶',
                color: '#fffacd',
                target: {
                    type: 'button',
                    size: { width: 90, height: 65 },
                    requiredClicks: 1
                },
                visualEffects: {
                    particles: 'new_life_glow',
                    animation: 'gentle_cradle',
                    sound: 'baby_first_cry'
                }
            },
            {
                name: '升职加薪',
                description: '职业生涯的重要突破',
                type: 'rapid_click',
                difficulty: 4,
                timeLimit: 1500,
                points: 130,
                icon: '📈',
                color: '#f0e68c',
                target: {
                    type: 'button',
                    size: { width: 70, height: 45 },
                    requiredClicks: 9
                }
            },
            {
                name: '创业成功',
                description: '实现自己的商业梦想',
                type: 'moving_object',
                difficulty: 4,
                timeLimit: 1200,
                points: 140,
                icon: '🚀',
                color: '#daa520',
                target: {
                    type: 'moving_object',
                    size: { width: 40, height: 40 },
                    speed: 160
                }
            },
            {
                name: '孩子毕业',
                description: '看着下一代成长的骄傲',
                type: 'drag_target',
                difficulty: 4,
                timeLimit: 2200,
                points: 125,
                icon: '🎓',
                color: '#bdb76b',
                target: {
                    type: 'drag_target',
                    size: { width: 75, height: 75 },
                    dragDistance: 110
                }
            },
            {
                name: '买车实现梦想',
                description: '拥有人生第一辆车',
                type: 'rapid_click',
                difficulty: 4,
                timeLimit: 1800,
                points: 115,
                icon: '🚗',
                color: '#f4a460',
                target: {
                    type: 'button',
                    size: { width: 75, height: 50 },
                    requiredClicks: 6
                }
            },
            {
                name: '投资理财成功',
                description: '财务自由的重要一步',
                type: 'moving_object',
                difficulty: 4,
                timeLimit: 1600,
                points: 135,
                icon: '💰',
                color: '#ffd700',
                target: {
                    type: 'moving_object',
                    size: { width: 50, height: 50 },
                    speed: 140
                }
            },
            {
                name: '照顾年迈父母',
                description: '反哺养育之恩',
                type: 'drag_target',
                difficulty: 4,
                timeLimit: 2500,
                points: 120,
                icon: '👴',
                color: '#deb887',
                target: {
                    type: 'drag_target',
                    size: { width: 80, height: 80 },
                    dragDistance: 100
                }
            }
        ];
    }
    
    /**
     * 老年期事件 (85-100秒) - 3个事件，每5秒一个
     */
    static getElderEvents() {
        return [
            {
                name: '退休庆典',
                description: '结束职业生涯的里程碑',
                type: 'simple_click',
                difficulty: 2,
                timeLimit: 4000,
                points: 80,
                icon: '🎉',
                color: '#ffdfba',
                target: {
                    type: 'button',
                    size: { width: 110, height: 75 },
                    requiredClicks: 1
                }
            },
            {
                name: '含饴弄孙',
                description: '享受天伦之乐的温馨时光',
                type: 'drag_target',
                difficulty: 2,
                timeLimit: 4500,
                points: 90,
                icon: '👴',
                color: '#deb887',
                target: {
                    type: 'drag_target',
                    size: { width: 85, height: 85 },
                    dragDistance: 70
                }
            },
            {
                name: '回忆往昔',
                description: '翻看人生的珍贵相册',
                type: 'moving_object',
                difficulty: 2,
                timeLimit: 3500,
                points: 70,
                icon: '📸',
                color: '#f5deb3',
                target: {
                    type: 'moving_object',
                    size: { width: 60, height: 60 },
                    speed: 50
                }
            },
            {
                name: '传授人生智慧',
                description: '将经验传递给年轻人',
                type: 'rapid_click',
                difficulty: 2,
                timeLimit: 3000,
                points: 100,
                icon: '📖',
                color: '#d2b48c',
                target: {
                    type: 'button',
                    size: { width: 95, height: 65 },
                    requiredClicks: 4
                }
            },
            {
                name: '安享晚年',
                description: '在平静中感受生命的美好',
                type: 'simple_click',
                difficulty: 1,
                timeLimit: 5000,
                points: 120,
                icon: '🌅',
                color: '#f4a460',
                target: {
                    type: 'button',
                    size: { width: 120, height: 80 },
                    requiredClicks: 1
                }
            },
            {
                name: '写回忆录',
                description: '记录人生的点点滴滴',
                type: 'drag_target',
                difficulty: 2,
                timeLimit: 4000,
                points: 85,
                icon: '📝',
                color: '#daa520',
                target: {
                    type: 'drag_target',
                    size: { width: 90, height: 90 },
                    dragDistance: 80
                }
            }
        ];
    }
    
    /**
     * 获取特定阶段的随机事件
     */
    static getRandomEventForStage(stageId) {
        const stageEvents = this.getAllEventTemplates()[stageId];
        if (!stageEvents || stageEvents.length === 0) return null;
        
        return stageEvents[Math.floor(Math.random() * stageEvents.length)];
    }
    
    /**
     * 获取所有事件的统计信息
     */
    static getEventStatistics() {
        const allTemplates = this.getAllEventTemplates();
        let totalEvents = 0;
        let totalPoints = 0;
        const stageStats = {};
        
        Object.keys(allTemplates).forEach(stageId => {
            const events = allTemplates[stageId];
            const stagePoints = events.reduce((sum, event) => sum + event.points, 0);
            
            stageStats[stageId] = {
                eventCount: events.length,
                totalPoints: stagePoints,
                averagePoints: Math.round(stagePoints / events.length),
                averageDifficulty: Math.round(events.reduce((sum, event) => sum + event.difficulty, 0) / events.length)
            };
            
            totalEvents += events.length;
            totalPoints += stagePoints;
        });
        
        return {
            totalEvents,
            totalPoints,
            averagePointsPerEvent: Math.round(totalPoints / totalEvents),
            stageStats
        };
    }
    
    /**
     * 验证事件数据的完整性
     */
    static validateEventData() {
        const allTemplates = this.getAllEventTemplates();
        const errors = [];
        
        Object.keys(allTemplates).forEach(stageId => {
            const events = allTemplates[stageId];
            
            events.forEach((event, index) => {
                // 检查必需字段
                const requiredFields = ['name', 'type', 'difficulty', 'timeLimit', 'points', 'target'];
                requiredFields.forEach(field => {
                    if (!event[field]) {
                        errors.push(`${stageId}[${index}]: Missing required field '${field}'`);
                    }
                });
                
                // 检查数值范围
                if (event.difficulty < 1 || event.difficulty > 5) {
                    errors.push(`${stageId}[${index}]: Difficulty must be between 1-5`);
                }
                
                if (event.timeLimit < 1000) {
                    errors.push(`${stageId}[${index}]: TimeLimit should be at least 1000ms`);
                }
                
                if (event.points < 0) {
                    errors.push(`${stageId}[${index}]: Points cannot be negative`);
                }
            });
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Export for Node.js (testing) and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LifeEventsData;
}