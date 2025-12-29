/**
 * LifeEventsData 单元测试
 * 测试人生事件数据的完整性和有效性
 */

// 模拟 LifeEventsData 类
const LifeEventsData = require('../../src/data/LifeEventsData.js');

describe('LifeEventsData', () => {
    describe('getAllEventTemplates', () => {
        test('should return event templates for all life stages', () => {
            const templates = LifeEventsData.getAllEventTemplates();
            
            expect(templates).toBeDefined();
            expect(typeof templates).toBe('object');
            
            // 验证所有人生阶段都有事件
            const expectedStages = ['baby', 'child', 'teen', 'adult', 'elder'];
            expectedStages.forEach(stage => {
                expect(templates[stage]).toBeDefined();
                expect(Array.isArray(templates[stage])).toBe(true);
                expect(templates[stage].length).toBeGreaterThan(0);
            });
        });
        
        test('should have valid event structure for each stage', () => {
            const templates = LifeEventsData.getAllEventTemplates();
            
            Object.keys(templates).forEach(stageId => {
                const events = templates[stageId];
                
                events.forEach((event, index) => {
                    // 验证必需字段
                    expect(event.name).toBeDefined();
                    expect(typeof event.name).toBe('string');
                    expect(event.name.length).toBeGreaterThan(0);
                    
                    expect(event.description).toBeDefined();
                    expect(typeof event.description).toBe('string');
                    
                    expect(event.type).toBeDefined();
                    expect(typeof event.type).toBe('string');
                    
                    expect(event.difficulty).toBeDefined();
                    expect(typeof event.difficulty).toBe('number');
                    expect(event.difficulty).toBeGreaterThanOrEqual(1);
                    expect(event.difficulty).toBeLessThanOrEqual(5);
                    
                    expect(event.timeLimit).toBeDefined();
                    expect(typeof event.timeLimit).toBe('number');
                    expect(event.timeLimit).toBeGreaterThan(0);
                    
                    expect(event.points).toBeDefined();
                    expect(typeof event.points).toBe('number');
                    expect(event.points).toBeGreaterThan(0);
                    
                    expect(event.target).toBeDefined();
                    expect(typeof event.target).toBe('object');
                    
                    // 验证可选字段
                    if (event.icon) {
                        expect(typeof event.icon).toBe('string');
                    }
                    
                    if (event.color) {
                        expect(typeof event.color).toBe('string');
                        expect(event.color).toMatch(/^#[0-9a-fA-F]{6}$/);
                    }
                });
            });
        });
        
        test('should have appropriate difficulty progression across stages', () => {
            const templates = LifeEventsData.getAllEventTemplates();
            
            // 婴儿期应该是最简单的
            const babyEvents = templates.baby;
            babyEvents.forEach(event => {
                expect(event.difficulty).toBeLessThanOrEqual(2);
            });
            
            // 成年期应该是最困难的
            const adultEvents = templates.adult;
            adultEvents.forEach(event => {
                expect(event.difficulty).toBeGreaterThanOrEqual(3);
            });
        });
    });
    
    describe('getRandomEventForStage', () => {
        test('should return a valid event for existing stages', () => {
            const stages = ['baby', 'child', 'teen', 'adult', 'elder'];
            
            stages.forEach(stageId => {
                const event = LifeEventsData.getRandomEventForStage(stageId);
                
                expect(event).toBeDefined();
                expect(event.name).toBeDefined();
                expect(event.type).toBeDefined();
                expect(event.difficulty).toBeDefined();
                expect(event.timeLimit).toBeDefined();
                expect(event.points).toBeDefined();
                expect(event.target).toBeDefined();
            });
        });
        
        test('should return null for non-existent stages', () => {
            const event = LifeEventsData.getRandomEventForStage('nonexistent');
            expect(event).toBeNull();
        });
        
        test('should return different events on multiple calls', () => {
            const events = [];
            for (let i = 0; i < 10; i++) {
                const event = LifeEventsData.getRandomEventForStage('adult');
                events.push(event.name);
            }
            
            // 应该有一些变化（不是所有事件都相同）
            const uniqueEvents = new Set(events);
            expect(uniqueEvents.size).toBeGreaterThan(1);
        });
    });
    
    describe('getEventStatistics', () => {
        test('should return valid statistics', () => {
            const stats = LifeEventsData.getEventStatistics();
            
            expect(stats).toBeDefined();
            expect(stats.totalEvents).toBeGreaterThan(0);
            expect(stats.totalPoints).toBeGreaterThan(0);
            expect(stats.averagePointsPerEvent).toBeGreaterThan(0);
            expect(stats.stageStats).toBeDefined();
            
            // 验证每个阶段的统计
            Object.keys(stats.stageStats).forEach(stageId => {
                const stageStat = stats.stageStats[stageId];
                
                expect(stageStat.eventCount).toBeGreaterThan(0);
                expect(stageStat.totalPoints).toBeGreaterThan(0);
                expect(stageStat.averagePoints).toBeGreaterThan(0);
                expect(stageStat.averageDifficulty).toBeGreaterThanOrEqual(1);
                expect(stageStat.averageDifficulty).toBeLessThanOrEqual(5);
            });
        });
        
        test('should have consistent totals', () => {
            const stats = LifeEventsData.getEventStatistics();
            const templates = LifeEventsData.getAllEventTemplates();
            
            // 计算预期总数
            let expectedTotalEvents = 0;
            let expectedTotalPoints = 0;
            
            Object.keys(templates).forEach(stageId => {
                const events = templates[stageId];
                expectedTotalEvents += events.length;
                expectedTotalPoints += events.reduce((sum, event) => sum + event.points, 0);
            });
            
            expect(stats.totalEvents).toBe(expectedTotalEvents);
            expect(stats.totalPoints).toBe(expectedTotalPoints);
        });
    });
    
    describe('validateEventData', () => {
        test('should validate all event data successfully', () => {
            const validation = LifeEventsData.validateEventData();
            
            expect(validation).toBeDefined();
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toBeDefined();
            expect(Array.isArray(validation.errors)).toBe(true);
            expect(validation.errors.length).toBe(0);
        });
        
        test('should detect missing required fields', () => {
            // 创建一个有缺陷的事件数据进行测试
            const originalGetAllEventTemplates = LifeEventsData.getAllEventTemplates;
            
            // 模拟有缺陷的数据
            LifeEventsData.getAllEventTemplates = () => ({
                test: [{
                    name: 'Test Event',
                    // 缺少 type 字段
                    difficulty: 1,
                    timeLimit: 1000,
                    points: 10,
                    target: { type: 'button' }
                }]
            });
            
            const validation = LifeEventsData.validateEventData();
            
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
            expect(validation.errors[0]).toContain('Missing required field');
            
            // 恢复原始方法
            LifeEventsData.getAllEventTemplates = originalGetAllEventTemplates;
        });
        
        test('should detect invalid difficulty values', () => {
            const originalGetAllEventTemplates = LifeEventsData.getAllEventTemplates;
            
            // 模拟有无效难度的数据
            LifeEventsData.getAllEventTemplates = () => ({
                test: [{
                    name: 'Test Event',
                    type: 'button',
                    difficulty: 10, // 无效难度
                    timeLimit: 1000,
                    points: 10,
                    target: { type: 'button' }
                }]
            });
            
            const validation = LifeEventsData.validateEventData();
            
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
            expect(validation.errors[0]).toContain('Difficulty must be between 1-5');
            
            // 恢复原始方法
            LifeEventsData.getAllEventTemplates = originalGetAllEventTemplates;
        });
    });
    
    describe('Event Content Quality', () => {
        test('should have meaningful event names', () => {
            const templates = LifeEventsData.getAllEventTemplates();
            
            Object.keys(templates).forEach(stageId => {
                const events = templates[stageId];
                
                events.forEach(event => {
                    // 事件名称应该有意义且不为空
                    expect(event.name.trim().length).toBeGreaterThan(2);
                    
                    // 事件名称应该是中文
                    expect(event.name).toMatch(/[\u4e00-\u9fa5]/);
                });
            });
        });
        
        test('should have appropriate time limits for difficulty', () => {
            const templates = LifeEventsData.getAllEventTemplates();
            
            Object.keys(templates).forEach(stageId => {
                const events = templates[stageId];
                
                events.forEach(event => {
                    // 高难度事件应该有更短的时间限制
                    if (event.difficulty >= 4) {
                        expect(event.timeLimit).toBeLessThanOrEqual(3000);
                    }
                    
                    // 低难度事件应该有更长的时间限制
                    if (event.difficulty <= 2) {
                        expect(event.timeLimit).toBeGreaterThanOrEqual(3000);
                    }
                });
            });
        });
        
        test('should have appropriate point values for difficulty', () => {
            const templates = LifeEventsData.getAllEventTemplates();
            
            Object.keys(templates).forEach(stageId => {
                const events = templates[stageId];
                
                events.forEach(event => {
                    // 高难度事件应该给更多分数
                    const expectedMinPoints = event.difficulty * 15;
                    expect(event.points).toBeGreaterThanOrEqual(expectedMinPoints);
                });
            });
        });
        
        test('should have diverse interaction types across stages', () => {
            const templates = LifeEventsData.getAllEventTemplates();
            
            Object.keys(templates).forEach(stageId => {
                const events = templates[stageId];
                const interactionTypes = new Set(events.map(event => event.type));
                
                // 每个阶段应该有多种交互类型（除了婴儿期可能较少）
                if (stageId !== 'baby') {
                    expect(interactionTypes.size).toBeGreaterThan(1);
                }
            });
        });
        
        test('should have visual effects only for birth event', () => {
            const templates = LifeEventsData.getAllEventTemplates();
            
            Object.keys(templates).forEach(stageId => {
                const events = templates[stageId];
                
                events.forEach(event => {
                    if (event.visualEffects) {
                        // 只有孩子出生事件应该有视觉效果
                        expect(event.name).toBe('孩子出生');
                        expect(event.visualEffects.particles).toBeDefined();
                        expect(event.visualEffects.animation).toBeDefined();
                        expect(event.visualEffects.sound).toBeDefined();
                    }
                });
            });
        });
    });
    
    describe('Stage-specific Content', () => {
        test('baby stage should have appropriate content', () => {
            const babyEvents = LifeEventsData.getAllEventTemplates().baby;
            
            babyEvents.forEach(event => {
                // 婴儿期事件应该简单
                expect(event.difficulty).toBeLessThanOrEqual(2);
                
                // 应该有足够的时间
                expect(event.timeLimit).toBeGreaterThanOrEqual(3000);
                
                // 事件名称应该与婴儿期相关
                const babyKeywords = ['微笑', '翻身', '爬行', '站立', '妈妈'];
                const hasRelevantKeyword = babyKeywords.some(keyword => 
                    event.name.includes(keyword) || event.description.includes(keyword)
                );
                expect(hasRelevantKeyword).toBe(true);
            });
        });
        
        test('adult stage should have appropriate content', () => {
            const adultEvents = LifeEventsData.getAllEventTemplates().adult;
            
            adultEvents.forEach(event => {
                // 成年期事件应该更困难
                expect(event.difficulty).toBeGreaterThanOrEqual(3);
                
                // 应该有更高的分数
                expect(event.points).toBeGreaterThanOrEqual(80);
                
                // 事件名称应该与成年期相关
                const adultKeywords = ['工作', '结婚', '买房', '孩子', '升职', '创业'];
                const hasRelevantKeyword = adultKeywords.some(keyword => 
                    event.name.includes(keyword) || event.description.includes(keyword)
                );
                expect(hasRelevantKeyword).toBe(true);
            });
        });
        
        test('elder stage should have appropriate content', () => {
            const elderEvents = LifeEventsData.getAllEventTemplates().elder;
            
            elderEvents.forEach(event => {
                // 老年期事件应该相对简单
                expect(event.difficulty).toBeLessThanOrEqual(3);
                
                // 应该有足够的时间
                expect(event.timeLimit).toBeGreaterThanOrEqual(3000);
                
                // 事件名称应该与老年期相关
                const elderKeywords = ['退休', '含饴弄孙', '回忆', '智慧', '安享'];
                const hasRelevantKeyword = elderKeywords.some(keyword => 
                    event.name.includes(keyword) || event.description.includes(keyword)
                );
                expect(hasRelevantKeyword).toBe(true);
            });
        });
    });
});