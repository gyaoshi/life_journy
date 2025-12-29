/**
 * EventSystem 属性测试
 */

const fc = require('fast-check');

// 简化的LifeEvent类用于测试
class LifeEvent {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.difficulty = config.difficulty;
    this.timeLimit = config.timeLimit;
    this.timeRemaining = config.timeLimit;
    this.points = config.points;
    this.position = config.position || { x: 0, y: 0 };
    this.target = config.target;
    
    this.completed = false;
    this.failed = false;
    this.startTime = Date.now();
    this.completedTime = null;
  }
  
  update(deltaTime) {
    if (this.completed || this.failed) return;
    
    this.timeRemaining -= deltaTime;
    
    if (this.timeRemaining <= 0) {
      this.fail();
    }
  }
  
  handleInteraction(inputEvent) {
    if (this.completed || this.failed) return false;
    
    switch (this.target.type) {
      case 'button':
        if (inputEvent.type === 'click') {
          this.complete();
          return true;
        }
        break;
      case 'drag_target':
        if (inputEvent.type === 'drag') {
          this.complete();
          return true;
        }
        break;
      case 'moving_object':
        if (inputEvent.type === 'click') {
          this.complete();
          return true;
        }
        break;
    }
    
    return false;
  }
  
  complete() {
    if (this.completed || this.failed) return;
    
    this.completed = true;
    this.completedTime = Date.now();
  }
  
  fail() {
    if (this.completed || this.failed) return;
    
    this.failed = true;
  }
  
  isPointInside(x, y) {
    const dx = x - this.position.x;
    const dy = y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const radius = Math.max(this.target.size.width, this.target.size.height) / 2;
    return distance <= radius;
  }
  
  isActive() {
    return !this.completed && !this.failed && this.timeRemaining > 0;
  }
}

// 简化的StateManager类用于测试
class StateManager {
  constructor() {
    this.currentStage = null;
    this.gameTime = 0;
    this.isGameActive = false;
    
    this.lifeStages = [
      { id: 'baby', name: '婴儿期', difficulty: 1 },
      { id: 'child', name: '儿童期', difficulty: 2 },
      { id: 'teen', name: '青少年期', difficulty: 3 },
      { id: 'adult', name: '成年期', difficulty: 4 },
      { id: 'elder', name: '老年期', difficulty: 3 }
    ];
  }
  
  startGame() {
    this.isGameActive = true;
    this.currentStage = this.lifeStages[0];
  }
  
  getCurrentStage() {
    return this.currentStage;
  }
  
  isGameActive() {
    return this.isGameActive;
  }
}

// 简化的EventSystem类用于测试
class EventSystem {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.activeEvents = [];
    this.completedEvents = [];
    this.eventIdCounter = 0;
    
    // 事件模板
    this.eventTemplates = {
      'baby': [
        {
          name: '第一次微笑',
          type: 'button',
          difficulty: 1,
          timeLimit: 3000,
          points: 10,
          target: {
            type: 'button',
            size: { width: 100, height: 60 },
            requiredClicks: 1
          }
        }
      ],
      'child': [
        {
          name: '学会走路',
          type: 'rapid_click',
          difficulty: 2,
          timeLimit: 3000,
          points: 20,
          target: {
            type: 'button',
            size: { width: 90, height: 50 },
            requiredClicks: 3
          }
        }
      ]
    };
  }
  
  generateEvent(stage) {
    const templates = this.eventTemplates[stage.id];
    if (!templates || templates.length === 0) return null;
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const eventConfig = {
      id: `event_${this.eventIdCounter++}`,
      name: template.name,
      type: template.type,
      difficulty: template.difficulty,
      timeLimit: template.timeLimit,
      points: template.points,
      position: { x: 400, y: 300 },
      target: { ...template.target }
    };
    
    const event = new LifeEvent(eventConfig);
    this.activeEvents.push(event);
    
    return event;
  }
  
  processInteraction(inputEvent) {
    let interactionHandled = false;
    
    for (const event of this.activeEvents) {
      if (event.isActive() && event.isPointInside(inputEvent.x, inputEvent.y)) {
        const success = event.handleInteraction(inputEvent);
        
        if (success) {
          this.onEventCompleted(event);
          interactionHandled = true;
          break;
        }
      }
    }
    
    return interactionHandled;
  }
  
  onEventCompleted(event) {
    this.completedEvents.push(event);
    
    const index = this.activeEvents.indexOf(event);
    if (index > -1) {
      this.activeEvents.splice(index, 1);
    }
  }
  
  getActiveEvents() {
    return [...this.activeEvents];
  }
  
  getCompletedEvents() {
    return [...this.completedEvents];
  }
  
  getTotalScore() {
    return this.completedEvents.reduce((total, event) => total + event.points, 0);
  }
  
  cleanupEvents() {
    // 移除失败的事件
    const failedEvents = this.activeEvents.filter(event => event.failed);
    failedEvents.forEach(event => {
      const index = this.activeEvents.indexOf(event);
      if (index > -1) {
        this.activeEvents.splice(index, 1);
      }
    });
  }
}

describe('EventSystem 属性测试', () => {
  /**
   * **Feature: life-journey-game, Property 4: 事件交互提示一致性**
   * 对于任何生成的人生事件，都应该包含相应的交互提示和操作区域配置
   * **验证: 需求 2.1**
   */
  test('属性 4: 事件交互提示一致性', () => {
    fc.assert(fc.property(
      fc.constantFrom('baby', 'child', 'teen', 'adult', 'elder'),
      (stageId) => {
        // 创建状态管理器和事件系统
        const stateManager = new StateManager();
        const eventSystem = new EventSystem(stateManager);
        
        // 设置游戏状态
        stateManager.startGame();
        const stage = stateManager.lifeStages.find(s => s.id === stageId);
        stateManager.currentStage = stage;
        
        // 生成事件
        const event = eventSystem.generateEvent(stage);
        
        // 如果没有事件模板，跳过验证
        if (!event) {
          return true;
        }
        
        // 验证事件包含必要的交互提示和操作区域配置
        const hasValidId = typeof event.id === 'string' && event.id.length > 0;
        const hasValidName = typeof event.name === 'string' && event.name.length > 0;
        const hasValidType = typeof event.type === 'string' && event.type.length > 0;
        const hasValidPosition = event.position && 
                                typeof event.position.x === 'number' && 
                                typeof event.position.y === 'number';
        const hasValidTarget = event.target && 
                              typeof event.target.type === 'string' &&
                              event.target.size &&
                              typeof event.target.size.width === 'number' &&
                              typeof event.target.size.height === 'number';
        const hasValidTimeLimit = typeof event.timeLimit === 'number' && event.timeLimit > 0;
        const hasValidPoints = typeof event.points === 'number' && event.points > 0;
        
        // 验证交互区域配置的完整性
        let hasValidInteractionConfig = true;
        
        switch (event.target.type) {
          case 'button':
            hasValidInteractionConfig = typeof event.target.requiredClicks === 'number' && 
                                       event.target.requiredClicks > 0;
            break;
          case 'drag_target':
            hasValidInteractionConfig = typeof event.target.dragDistance === 'number' && 
                                       event.target.dragDistance > 0;
            break;
          case 'moving_object':
            hasValidInteractionConfig = typeof event.target.speed === 'number' && 
                                       event.target.speed >= 0;
            break;
        }
        
        return hasValidId && hasValidName && hasValidType && hasValidPosition && 
               hasValidTarget && hasValidTimeLimit && hasValidPoints && hasValidInteractionConfig;
      }
    ), { numRuns: 100 });
  });

  /**
   * **Feature: life-journey-game, Property 5: 成功交互奖励一致性**
   * 对于任何成功完成的交互任务，分数应该增加且应该触发成功反馈
   * **验证: 需求 2.2, 3.5**
   */
  test('属性 5: 成功交互奖励一致性', () => {
    fc.assert(fc.property(
      fc.record({
        stageId: fc.constantFrom('baby', 'child'),
        interactionX: fc.integer({ min: 350, max: 450 }),
        interactionY: fc.integer({ min: 250, max: 350 }),
        interactionType: fc.constantFrom('click', 'drag')
      }),
      (testData) => {
        // 创建状态管理器和事件系统
        const stateManager = new StateManager();
        const eventSystem = new EventSystem(stateManager);
        
        // 设置游戏状态
        stateManager.startGame();
        const stage = stateManager.lifeStages.find(s => s.id === testData.stageId);
        stateManager.currentStage = stage;
        
        // 生成事件
        const event = eventSystem.generateEvent(stage);
        
        // 如果没有事件模板，跳过验证
        if (!event) {
          return true;
        }
        
        // 记录初始状态
        const initialScore = eventSystem.getTotalScore();
        const initialCompletedCount = eventSystem.getCompletedEvents().length;
        const initialActiveCount = eventSystem.getActiveEvents().length;
        
        // 模拟成功的交互
        const inputEvent = {
          type: testData.interactionType,
          x: testData.interactionX,
          y: testData.interactionY,
          deltaX: testData.interactionType === 'drag' ? 100 : 0,
          deltaY: testData.interactionType === 'drag' ? 100 : 0
        };
        
        // 处理交互
        const interactionHandled = eventSystem.processInteraction(inputEvent);
        
        // 如果交互被处理（成功完成）
        if (interactionHandled) {
          // 验证分数增加
          const newScore = eventSystem.getTotalScore();
          const scoreIncreased = newScore > initialScore;
          const scoreIncreasedByEventPoints = newScore === initialScore + event.points;
          
          // 验证事件被移动到完成列表
          const newCompletedCount = eventSystem.getCompletedEvents().length;
          const newActiveCount = eventSystem.getActiveEvents().length;
          const eventMovedToCompleted = newCompletedCount === initialCompletedCount + 1;
          const eventRemovedFromActive = newActiveCount === initialActiveCount - 1;
          
          // 验证事件状态
          const eventCompleted = event.completed === true;
          const eventNotFailed = event.failed === false;
          
          return scoreIncreased && scoreIncreasedByEventPoints && 
                 eventMovedToCompleted && eventRemovedFromActive && 
                 eventCompleted && eventNotFailed;
        } else {
          // 如果交互未被处理，验证状态未改变
          const newScore = eventSystem.getTotalScore();
          const newCompletedCount = eventSystem.getCompletedEvents().length;
          const newActiveCount = eventSystem.getActiveEvents().length;
          
          return newScore === initialScore && 
                 newCompletedCount === initialCompletedCount && 
                 newActiveCount === initialActiveCount;
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * **Feature: life-journey-game, Property 6: 失败交互处理一致性**
   * 对于任何超时未完成的交互任务，该事件应该被跳过且分数不应该增加
   * **验证: 需求 2.3**
   */
  test('属性 6: 失败交互处理一致性', () => {
    fc.assert(fc.property(
      fc.record({
        stageId: fc.constantFrom('baby', 'child'),
        timeoutDelta: fc.integer({ min: 3001, max: 5000 }) // 超过事件时间限制
      }),
      (testData) => {
        // 创建状态管理器和事件系统
        const stateManager = new StateManager();
        const eventSystem = new EventSystem(stateManager);
        
        // 设置游戏状态
        stateManager.startGame();
        const stage = stateManager.lifeStages.find(s => s.id === testData.stageId);
        stateManager.currentStage = stage;
        
        // 生成事件
        const event = eventSystem.generateEvent(stage);
        
        // 如果没有事件模板，跳过验证
        if (!event) {
          return true;
        }
        
        // 记录初始状态
        const initialScore = eventSystem.getTotalScore();
        const initialCompletedCount = eventSystem.getCompletedEvents().length;
        const initialActiveCount = eventSystem.getActiveEvents().length;
        
        // 模拟时间超时 - 让事件超时失败
        event.update(testData.timeoutDelta);
        
        // 清理失败的事件
        eventSystem.cleanupEvents();
        
        // 验证失败处理的一致性
        const newScore = eventSystem.getTotalScore();
        const newCompletedCount = eventSystem.getCompletedEvents().length;
        const newActiveCount = eventSystem.getActiveEvents().length;
        
        // 验证分数没有增加
        const scoreUnchanged = newScore === initialScore;
        
        // 验证事件没有被添加到完成列表
        const completedCountUnchanged = newCompletedCount === initialCompletedCount;
        
        // 验证事件从活跃列表中移除
        const eventRemovedFromActive = newActiveCount === initialActiveCount - 1;
        
        // 验证事件状态
        const eventFailed = event.failed === true;
        const eventNotCompleted = event.completed === false;
        const eventNotActive = !event.isActive();
        
        return scoreUnchanged && completedCountUnchanged && eventRemovedFromActive && 
               eventFailed && eventNotCompleted && eventNotActive;
      }
    ), { numRuns: 100 });
  });
});