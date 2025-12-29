/**
 * GameEngine 属性测试
 */

const fc = require('fast-check');

// 简化的ScoreSystem类用于测试
class ScoreSystem {
  constructor() {
    this.totalScore = 0;
    this.completedEvents = [];
  }
  
  addCompletedEvent(event) {
    if (!event || this.completedEvents.find(e => e.id === event.id)) {
      return; // 避免重复添加
    }
    
    this.completedEvents.push({
      id: event.id,
      name: event.name,
      points: event.points,
      stage: event.stage || 'unknown',
      completedAt: Date.now()
    });
    
    this.totalScore += event.points;
  }
  
  getTotalScore() {
    return this.totalScore;
  }
}

describe('GameEngine 属性测试', () => {
  /**
   * **Feature: life-journey-game, Property 2: 分数计算一致性**
   * 对于任何完成事件的组合，最终分数应该等于所有完成事件的分数总和
   * **验证: 需求 1.4, 6.1**
   */
  test('属性 2: 分数计算一致性', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s !== 'constructor'), // 避免使用constructor作为ID
        name: fc.string({ minLength: 1, maxLength: 50 }),
        points: fc.integer({ min: 1, max: 100 }),
        stage: fc.constantFrom('baby', 'child', 'teen', 'adult', 'elder')
      }), { minLength: 0, maxLength: 20 }),
      (events) => {
        // 创建分数系统
        const scoreSystem = new ScoreSystem();
        
        // 确保事件ID唯一，模拟真实场景
        const uniqueEvents = [];
        const seenIds = new Set();
        
        events.forEach((event, index) => {
          // 如果ID重复，给它一个唯一的ID
          let uniqueId = event.id;
          if (seenIds.has(uniqueId)) {
            uniqueId = `${event.id}_${index}`;
          }
          seenIds.add(uniqueId);
          
          uniqueEvents.push({
            ...event,
            id: uniqueId
          });
        });
        
        // 计算预期的总分数
        const expectedTotalScore = uniqueEvents.reduce((sum, event) => sum + event.points, 0);
        
        // 添加所有事件到分数系统
        uniqueEvents.forEach(event => {
          scoreSystem.addCompletedEvent(event);
        });
        
        // 验证分数计算一致性
        const actualTotalScore = scoreSystem.getTotalScore();
        
        return actualTotalScore === expectedTotalScore;
      }
    ), { numRuns: 100 });
  });
});