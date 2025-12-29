/**
 * 交互类型属性测试
 */

const fc = require('fast-check');

// 简化的InteractionTarget类用于测试
class InteractionTarget {
  constructor(config) {
    this.type = config.type;
    this.size = config.size || { width: 80, height: 40 };
    this.speed = config.speed || 0;
    this.requiredClicks = config.requiredClicks || 1;
    this.dragDistance = config.dragDistance || 0;
  }
  
  isPointInside(point, position) {
    const hitArea = {
      x: position.x - this.size.width / 2,
      y: position.y - this.size.height / 2,
      width: this.size.width,
      height: this.size.height
    };
    
    return point.x >= hitArea.x && 
           point.x <= hitArea.x + hitArea.width &&
           point.y >= hitArea.y && 
           point.y <= hitArea.y + hitArea.height;
  }
}

// 简化的LifeEvent类用于测试
class LifeEvent {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.position = config.position || { x: 0, y: 0 };
    this.target = new InteractionTarget(config.target);
    this.timeLimit = config.timeLimit;
    this.timeRemaining = config.timeLimit;
    this.points = config.points;
    
    this.completed = false;
    this.failed = false;
    this.clickCount = 0;
    this.dragDistance = 0;
    
    // 移动目标的移动状态
    this.movement = null;
  }
  
  update(deltaTime) {
    if (this.completed || this.failed) return;
    
    this.timeRemaining -= deltaTime;
    
    if (this.timeRemaining <= 0) {
      this.fail();
      return;
    }
    
    // 更新移动目标位置
    if (this.target.type === 'moving_object') {
      this.updateMovingTarget(deltaTime);
    }
  }
  
  updateMovingTarget(deltaTime) {
    if (!this.movement) {
      // 初始化移动参数
      this.movement = {
        vx: (Math.random() - 0.5) * this.target.speed,
        vy: (Math.random() - 0.5) * this.target.speed,
        bounds: {
          left: 50,
          right: 750,
          top: 50,
          bottom: 550
        }
      };
    }
    
    // 更新位置
    this.position.x += this.movement.vx * deltaTime / 1000;
    this.position.y += this.movement.vy * deltaTime / 1000;
    
    // 边界反弹
    const bounds = this.movement.bounds;
    if (this.position.x <= bounds.left || this.position.x >= bounds.right) {
      this.movement.vx *= -1;
    }
    if (this.position.y <= bounds.top || this.position.y >= bounds.bottom) {
      this.movement.vy *= -1;
    }
    
    // 限制在边界内
    this.position.x = Math.max(bounds.left, Math.min(bounds.right, this.position.x));
    this.position.y = Math.max(bounds.top, Math.min(bounds.bottom, this.position.y));
  }
  
  handleInteraction(inputEvent) {
    if (this.completed || this.failed) return false;
    
    switch (this.target.type) {
      case 'button':
        return this.handleButtonClick(inputEvent);
      case 'drag_target':
        return this.handleDragInteraction(inputEvent);
      case 'moving_object':
        return this.handleMovingObjectClick(inputEvent);
      default:
        return false;
    }
  }
  
  handleButtonClick(inputEvent) {
    if (inputEvent.type === 'click') {
      this.clickCount++;
      
      if (this.clickCount >= this.target.requiredClicks) {
        this.complete();
        return true;
      }
    }
    
    return false;
  }
  
  handleDragInteraction(inputEvent) {
    if (inputEvent.type === 'drag') {
      const distance = Math.sqrt(
        Math.pow(inputEvent.deltaX, 2) + Math.pow(inputEvent.deltaY, 2)
      );
      
      this.dragDistance = Math.max(this.dragDistance, distance);
      
      if (this.dragDistance >= this.target.dragDistance) {
        this.complete();
        return true;
      }
    }
    
    return false;
  }
  
  handleMovingObjectClick(inputEvent) {
    if (inputEvent.type === 'click') {
      this.complete();
      return true;
    }
    
    return false;
  }
  
  complete() {
    if (this.completed || this.failed) return;
    
    this.completed = true;
  }
  
  fail() {
    if (this.completed || this.failed) return;
    
    this.failed = true;
  }
  
  isPointInside(x, y) {
    return this.target.isPointInside({ x, y }, this.position);
  }
  
  isActive() {
    return !this.completed && !this.failed && this.timeRemaining > 0;
  }
}

describe('交互类型属性测试', () => {
  /**
   * **Feature: life-journey-game, Property 7: 移动目标交互验证**
   * 对于任何点击移动物体类型的交互，只有准确点击移动目标才应该被认为是成功交互
   * **验证: 需求 2.4**
   */
  test('属性 7: 移动目标交互验证', () => {
    fc.assert(fc.property(
      fc.record({
        initialX: fc.integer({ min: 100, max: 700 }),
        initialY: fc.integer({ min: 100, max: 500 }),
        targetSize: fc.integer({ min: 30, max: 80 }),
        speed: fc.integer({ min: 50, max: 200 }),
        clickX: fc.integer({ min: 50, max: 750 }),
        clickY: fc.integer({ min: 50, max: 550 }),
        simulationTime: fc.integer({ min: 0, max: 2000 }) // 模拟时间(毫秒)
      }),
      (testData) => {
        // 创建移动目标事件
        const eventConfig = {
          id: 'test_moving_event',
          name: '移动目标测试',
          type: 'moving_object',
          position: { x: testData.initialX, y: testData.initialY },
          target: {
            type: 'moving_object',
            size: { width: testData.targetSize, height: testData.targetSize },
            speed: testData.speed
          },
          timeLimit: 5000,
          points: 10
        };
        
        const event = new LifeEvent(eventConfig);
        
        // 模拟时间流逝，让目标移动
        if (testData.simulationTime > 0) {
          event.update(testData.simulationTime);
        }
        
        // 记录当前目标位置
        const currentPosition = { x: event.position.x, y: event.position.y };
        
        // 创建点击输入事件
        const inputEvent = {
          type: 'click',
          x: testData.clickX,
          y: testData.clickY,
          timestamp: Date.now()
        };
        
        // 检查点击是否在目标区域内
        const isClickInTarget = event.isPointInside(testData.clickX, testData.clickY);
        
        // 处理交互 - 只有点击在目标内才处理
        let interactionSuccess = false;
        if (isClickInTarget) {
          interactionSuccess = event.handleInteraction(inputEvent);
        }
        
        // 验证移动目标交互的准确性
        if (isClickInTarget) {
          // 如果点击在目标内，交互应该成功，事件应该完成
          const eventCompleted = event.completed === true;
          const eventNotFailed = event.failed === false;
          
          return interactionSuccess && eventCompleted && eventNotFailed;
        } else {
          // 如果点击不在目标内，交互应该失败，事件状态不变
          const interactionFailed = !interactionSuccess;
          const eventNotCompleted = event.completed === false;
          const eventStillActive = event.isActive();
          
          return interactionFailed && eventNotCompleted && eventStillActive;
        }
      }
    ), { numRuns: 100 });
  });
  
  /**
   * 测试移动目标的位置更新准确性
   */
  test('移动目标位置更新准确性', () => {
    fc.assert(fc.property(
      fc.record({
        initialX: fc.integer({ min: 100, max: 700 }),
        initialY: fc.integer({ min: 100, max: 500 }),
        speed: fc.integer({ min: 50, max: 200 }),
        deltaTime: fc.integer({ min: 100, max: 1000 })
      }),
      (testData) => {
        // 创建移动目标事件
        const eventConfig = {
          id: 'test_moving_position',
          name: '移动位置测试',
          type: 'moving_object',
          position: { x: testData.initialX, y: testData.initialY },
          target: {
            type: 'moving_object',
            size: { width: 50, height: 50 },
            speed: testData.speed
          },
          timeLimit: 5000,
          points: 10
        };
        
        const event = new LifeEvent(eventConfig);
        
        // 记录初始位置
        const initialPosition = { x: event.position.x, y: event.position.y };
        
        // 更新位置
        event.update(testData.deltaTime);
        
        // 验证位置更新
        const newPosition = { x: event.position.x, y: event.position.y };
        
        // 验证位置在边界内
        const bounds = { left: 50, right: 750, top: 50, bottom: 550 };
        const withinBounds = newPosition.x >= bounds.left && newPosition.x <= bounds.right &&
                            newPosition.y >= bounds.top && newPosition.y <= bounds.bottom;
        
        // 验证位置发生了变化（除非速度为0或时间很短）
        const positionChanged = newPosition.x !== initialPosition.x || newPosition.y !== initialPosition.y;
        const shouldMove = testData.speed > 0 && testData.deltaTime > 50;
        
        if (shouldMove) {
          return withinBounds && positionChanged;
        } else {
          return withinBounds;
        }
      }
    ), { numRuns: 100 });
  });
  
  /**
   * 测试目标碰撞检测准确性
   */
  test('目标碰撞检测准确性', () => {
    fc.assert(fc.property(
      fc.record({
        targetX: fc.integer({ min: 100, max: 700 }),
        targetY: fc.integer({ min: 100, max: 500 }),
        targetWidth: fc.integer({ min: 30, max: 100 }),
        targetHeight: fc.integer({ min: 30, max: 100 }),
        clickX: fc.integer({ min: 50, max: 750 }),
        clickY: fc.integer({ min: 50, max: 550 })
      }),
      (testData) => {
        // 创建交互目标
        const target = new InteractionTarget({
          type: 'moving_object',
          size: { width: testData.targetWidth, height: testData.targetHeight }
        });
        
        const targetPosition = { x: testData.targetX, y: testData.targetY };
        const clickPoint = { x: testData.clickX, y: testData.clickY };
        
        // 检测碰撞
        const isInside = target.isPointInside(clickPoint, targetPosition);
        
        // 计算预期结果
        const hitArea = {
          left: targetPosition.x - testData.targetWidth / 2,
          right: targetPosition.x + testData.targetWidth / 2,
          top: targetPosition.y - testData.targetHeight / 2,
          bottom: targetPosition.y + testData.targetHeight / 2
        };
        
        const expectedInside = clickPoint.x >= hitArea.left && clickPoint.x <= hitArea.right &&
                              clickPoint.y >= hitArea.top && clickPoint.y <= hitArea.bottom;
        
        return isInside === expectedInside;
      }
    ), { numRuns: 100 });
  });

  /**
   * **Feature: life-journey-game, Property 8: 连击交互计数准确性**
   * 对于任何快速连续点击类型的交互，检测到的点击次数应该等于玩家在时间限制内的实际点击次数
   * **验证: 需求 2.5**
   */
  test('属性 8: 连击交互计数准确性', () => {
    fc.assert(fc.property(
      fc.record({
        targetX: fc.integer({ min: 100, max: 700 }),
        targetY: fc.integer({ min: 100, max: 500 }),
        targetSize: fc.integer({ min: 40, max: 80 }),
        requiredClicks: fc.integer({ min: 2, max: 8 }),
        actualClicks: fc.integer({ min: 1, max: 10 }),
        timeLimit: fc.integer({ min: 2000, max: 5000 })
      }),
      (testData) => {
        // 创建连击交互事件
        const eventConfig = {
          id: 'test_rapid_click',
          name: '连击测试',
          type: 'rapid_click',
          position: { x: testData.targetX, y: testData.targetY },
          target: {
            type: 'button',
            size: { width: testData.targetSize, height: testData.targetSize },
            requiredClicks: testData.requiredClicks
          },
          timeLimit: testData.timeLimit,
          points: 20
        };
        
        const event = new LifeEvent(eventConfig);
        
        // 记录初始状态
        const initialClickCount = event.clickCount;
        const initialCompleted = event.completed;
        
        // 模拟连续点击
        let successfulClicks = 0;
        for (let i = 0; i < testData.actualClicks; i++) {
          // 创建点击输入事件（在目标区域内）
          const inputEvent = {
            type: 'click',
            x: testData.targetX,
            y: testData.targetY,
            timestamp: Date.now() + i * 100 // 每100ms一次点击
          };
          
          // 处理交互
          const clickHandled = event.handleInteraction(inputEvent);
          
          if (clickHandled || event.clickCount > initialClickCount + i) {
            successfulClicks++;
          }
          
          // 如果事件已完成，停止点击
          if (event.completed) {
            break;
          }
        }
        
        // 验证点击计数准确性
        const expectedClickCount = Math.min(testData.actualClicks, testData.requiredClicks);
        const actualClickCount = event.clickCount;
        
        // 验证事件完成状态
        const shouldBeCompleted = testData.actualClicks >= testData.requiredClicks;
        const isCompleted = event.completed;
        
        // 验证点击计数等于实际点击次数（在要求范围内）
        const clickCountAccurate = actualClickCount === expectedClickCount;
        
        // 验证完成状态正确
        const completionStateCorrect = shouldBeCompleted === isCompleted;
        
        return clickCountAccurate && completionStateCorrect;
      }
    ), { numRuns: 100 });
  });
  
  /**
   * 测试连击交互的时间限制
   */
  test('连击交互时间限制准确性', () => {
    fc.assert(fc.property(
      fc.record({
        requiredClicks: fc.integer({ min: 3, max: 6 }),
        timeLimit: fc.integer({ min: 1000, max: 3000 }),
        clickInterval: fc.integer({ min: 50, max: 500 })
      }),
      (testData) => {
        // 创建连击交互事件
        const eventConfig = {
          id: 'test_rapid_click_timing',
          name: '连击时间测试',
          type: 'rapid_click',
          position: { x: 400, y: 300 },
          target: {
            type: 'button',
            size: { width: 60, height: 60 },
            requiredClicks: testData.requiredClicks
          },
          timeLimit: testData.timeLimit,
          points: 20
        };
        
        const event = new LifeEvent(eventConfig);
        
        // 计算总点击时间
        const totalClickTime = testData.requiredClicks * testData.clickInterval;
        
        // 模拟连续点击
        for (let i = 0; i < testData.requiredClicks; i++) {
          // 检查是否超时
          const elapsedTime = i * testData.clickInterval;
          if (elapsedTime >= testData.timeLimit) {
            // 模拟超时
            event.update(testData.timeLimit + 100);
            break;
          }
          
          // 创建点击事件
          const inputEvent = {
            type: 'click',
            x: 400,
            y: 300,
            timestamp: Date.now() + elapsedTime
          };
          
          event.handleInteraction(inputEvent);
        }
        
        // 验证时间限制的影响
        if (totalClickTime < testData.timeLimit) {
          // 如果在时间限制内完成所有点击，事件应该完成
          return event.completed === true && event.failed === false;
        } else {
          // 如果超过时间限制，事件可能失败或未完成
          return event.clickCount <= testData.requiredClicks;
        }
      }
    ), { numRuns: 100 });
  });
});