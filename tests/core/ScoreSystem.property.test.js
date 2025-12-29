/**
 * ScoreSystem 属性测试
 */

const fc = require('fast-check');

// 导入 ScoreSystem 类
const ScoreSystem = require('../../src/core/ScoreSystem.js');

describe('ScoreSystem 属性测试', () => {
  /**
   * **Feature: life-journey-game, Property 17: 评价系统一致性**
   * 对于任何最终分数百分比，显示的评价应该与预定义的分数区间对应
   * (0-30%:"匆忙人生", 31-60%:"平凡人生", 61-85%:"充实人生", 86-100%:"完美人生")
   * **验证: 需求 6.2, 6.3, 6.4, 6.5**
   */
  test('属性 17: 评价系统一致性', () => {
    fc.assert(fc.property(
      fc.record({
        totalPossibleEvents: fc.integer({ min: 1, max: 100 }),
        completedEvents: fc.integer({ min: 0, max: 100 })
      }).filter(data => data.completedEvents <= data.totalPossibleEvents),
      (testData) => {
        // 创建评分系统
        const scoreSystem = new ScoreSystem();
        
        // 设置总可能事件数
        scoreSystem.setTotalPossibleEvents(testData.totalPossibleEvents);
        
        // 添加完成的事件
        for (let i = 0; i < testData.completedEvents; i++) {
          const mockEvent = {
            id: `event_${i}`,
            name: `Event ${i}`,
            points: 10,
            stage: 'test'
          };
          scoreSystem.addCompletedEvent(mockEvent);
        }
        
        // 计算完成百分比
        const completionPercentage = scoreSystem.getCompletionPercentage();
        
        // 获取评价
        const evaluation = scoreSystem.calculateFinalEvaluation();
        
        // 验证评价与百分比区间的一致性
        if (completionPercentage >= 0 && completionPercentage <= 30.99) {
          return evaluation.title === '匆忙人生';
        } else if (completionPercentage >= 31 && completionPercentage <= 60.99) {
          return evaluation.title === '平凡人生';
        } else if (completionPercentage >= 61 && completionPercentage <= 85.99) {
          return evaluation.title === '充实人生';
        } else if (completionPercentage >= 86 && completionPercentage <= 100) {
          return evaluation.title === '完美人生';
        }
        
        // 如果百分比不在预期范围内，测试失败
        return false;
      }
    ), { numRuns: 100 });
  });
  
  /**
   * 分数计算一致性测试
   * 验证总分数等于所有完成事件的分数总和（考虑重复事件防护）
   */
  test('分数计算一致性', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 20 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          points: fc.integer({ min: 1, max: 100 }),
          stage: fc.constantFrom('baby', 'child', 'teen', 'adult', 'elder')
        }),
        { minLength: 0, maxLength: 50 }
      ),
      (events) => {
        const scoreSystem = new ScoreSystem();
        
        // 计算预期总分（去重后的事件）
        const uniqueEvents = [];
        const seenIds = new Set();
        
        events.forEach(event => {
          if (!seenIds.has(event.id)) {
            uniqueEvents.push(event);
            seenIds.add(event.id);
          }
        });
        
        const expectedTotalScore = uniqueEvents.reduce((sum, event) => sum + event.points, 0);
        
        // 添加所有事件（包括重复的）
        events.forEach(event => {
          scoreSystem.addCompletedEvent(event);
        });
        
        // 验证总分数一致性（应该等于去重后的分数）
        return scoreSystem.getTotalScore() === expectedTotalScore;
      }
    ), { numRuns: 100 });
  });
  
  /**
   * 完成百分比计算一致性测试
   * 验证完成百分比的正确计算
   */
  test('完成百分比计算一致性', () => {
    fc.assert(fc.property(
      fc.record({
        totalPossibleEvents: fc.integer({ min: 1, max: 100 }),
        completedEventsCount: fc.integer({ min: 0, max: 100 })
      }).filter(data => data.completedEventsCount <= data.totalPossibleEvents),
      (testData) => {
        const scoreSystem = new ScoreSystem();
        
        // 设置总可能事件数
        scoreSystem.setTotalPossibleEvents(testData.totalPossibleEvents);
        
        // 添加完成的事件
        for (let i = 0; i < testData.completedEventsCount; i++) {
          const mockEvent = {
            id: `event_${i}`,
            name: `Event ${i}`,
            points: 10,
            stage: 'test'
          };
          scoreSystem.addCompletedEvent(mockEvent);
        }
        
        // 计算预期百分比
        const expectedPercentage = (testData.completedEventsCount / testData.totalPossibleEvents) * 100;
        const actualPercentage = scoreSystem.getCompletionPercentage();
        
        // 验证百分比计算一致性（允许小的浮点误差）
        return Math.abs(actualPercentage - expectedPercentage) < 0.01;
      }
    ), { numRuns: 100 });
  });
  
  /**
   * 重复事件防护测试
   * 验证相同ID的事件不会被重复添加
   */
  test('重复事件防护一致性', () => {
    fc.assert(fc.property(
      fc.record({
        eventId: fc.string({ minLength: 1, maxLength: 20 }),
        points: fc.integer({ min: 1, max: 100 }),
        addAttempts: fc.integer({ min: 1, max: 10 })
      }),
      (testData) => {
        const scoreSystem = new ScoreSystem();
        
        const mockEvent = {
          id: testData.eventId,
          name: 'Test Event',
          points: testData.points,
          stage: 'test'
        };
        
        // 尝试多次添加相同事件
        for (let i = 0; i < testData.addAttempts; i++) {
          scoreSystem.addCompletedEvent(mockEvent);
        }
        
        // 验证事件只被添加一次
        const completedCount = scoreSystem.getCompletedEventCount();
        const totalScore = scoreSystem.getTotalScore();
        
        return completedCount === 1 && totalScore === testData.points;
      }
    ), { numRuns: 100 });
  });
  
  /**
   * 评价等级边界测试
   * 验证边界百分比值的正确评价
   */
  test('评价等级边界一致性', () => {
    fc.assert(fc.property(
      fc.constantFrom(0, 30, 31, 60, 61, 85, 86, 100),
      (percentage) => {
        const scoreSystem = new ScoreSystem();
        
        // 设置事件数以达到特定百分比
        const totalEvents = 100;
        const completedEvents = percentage;
        
        scoreSystem.setTotalPossibleEvents(totalEvents);
        
        for (let i = 0; i < completedEvents; i++) {
          const mockEvent = {
            id: `event_${i}`,
            name: `Event ${i}`,
            points: 10,
            stage: 'test'
          };
          scoreSystem.addCompletedEvent(mockEvent);
        }
        
        const evaluation = scoreSystem.calculateFinalEvaluation();
        
        // 验证边界值的正确评价
        if (percentage <= 30) {
          return evaluation.title === '匆忙人生';
        } else if (percentage <= 60) {
          return evaluation.title === '平凡人生';
        } else if (percentage <= 85) {
          return evaluation.title === '充实人生';
        } else {
          return evaluation.title === '完美人生';
        }
      }
    ), { numRuns: 100 });
  });
});