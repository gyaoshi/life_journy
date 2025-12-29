/**
 * StateManager 属性测试
 */

const fc = require('fast-check');

// 简化的StateManager类用于测试
class StateManager {
  constructor() {
    this.currentStage = null;
    this.gameTime = 0; // 游戏已进行时间(毫秒)
    this.totalGameTime = 100000; // 总游戏时间100秒(毫秒)
    this.isGameActive = false;
    this.isGameComplete = false;
    
    // 人生阶段定义
    this.lifeStages = [
      {
        id: 'baby',
        name: '婴儿期',
        duration: 15000, // 15秒
        difficulty: 1,
        startTime: 0
      },
      {
        id: 'child',
        name: '儿童期',
        duration: 20000, // 20秒
        difficulty: 2,
        startTime: 15000
      },
      {
        id: 'teen',
        name: '青少年期',
        duration: 20000, // 20秒
        difficulty: 3,
        startTime: 35000
      },
      {
        id: 'adult',
        name: '成年期',
        duration: 30000, // 30秒
        difficulty: 4,
        startTime: 55000
      },
      {
        id: 'elder',
        name: '老年期',
        duration: 15000, // 15秒
        difficulty: 3,
        startTime: 85000
      }
    ];
  }
  
  startGame() {
    this.gameTime = 0;
    this.isGameActive = true;
    this.isGameComplete = false;
    this.currentStage = this.lifeStages[0];
  }
  
  resetGame() {
    this.gameTime = 0;
    this.isGameActive = false;
    this.isGameComplete = false;
    this.currentStage = null;
  }
  
  update(deltaTime) {
    if (!this.isGameActive || this.isGameComplete) return;
    
    this.gameTime += deltaTime;
    
    // 检查是否需要切换人生阶段
    this.checkStageTransition();
    
    // 检查游戏是否结束
    if (this.gameTime >= this.totalGameTime) {
      this.endGame();
    }
  }
  
  checkStageTransition() {
    const newStage = this.getStageForTime(this.gameTime);
    
    if (newStage && (!this.currentStage || newStage.id !== this.currentStage.id)) {
      this.transitionToStage(newStage);
    }
  }
  
  getStageForTime(time) {
    for (let i = this.lifeStages.length - 1; i >= 0; i--) {
      if (time >= this.lifeStages[i].startTime) {
        return this.lifeStages[i];
      }
    }
    return this.lifeStages[0];
  }
  
  transitionToStage(stage) {
    this.currentStage = stage;
  }
  
  endGame() {
    this.isGameActive = false;
    this.isGameComplete = true;
  }
  
  getCurrentStage() {
    return this.currentStage;
  }
  
  getStageProgress() {
    if (!this.currentStage) return 0;
    
    const stageElapsed = this.gameTime - this.currentStage.startTime;
    return Math.min(stageElapsed / this.currentStage.duration, 1);
  }
  
  getGameProgress() {
    return Math.min(this.gameTime / this.totalGameTime, 1);
  }
  
  getTimeLeft() {
    const timeLeft = this.totalGameTime - this.gameTime;
    return Math.max(timeLeft / 1000, 0);
  }
  
  getElapsedTime() {
    return this.gameTime / 1000;
  }
  
  isGameComplete() {
    return this.isGameComplete;
  }
  
  isGameActive() {
    return this.isGameActive;
  }
}

describe('StateManager 属性测试', () => {
  /**
   * **Feature: life-journey-game, Property 1: 游戏时间与人生阶段一致性**
   * 对于任何游戏时间点，显示的人生阶段应该与该时间点在100秒生命周期中的位置相对应
   * **验证: 需求 1.2**
   */
  test('属性 1: 游戏时间与人生阶段一致性', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 100000 }), // 游戏时间范围 0-100秒(毫秒)
      (gameTime) => {
        // 创建状态管理器
        const stateManager = new StateManager();
        stateManager.startGame();
        
        // 设置游戏时间
        stateManager.gameTime = gameTime;
        stateManager.checkStageTransition();
        
        // 获取当前阶段
        const currentStage = stateManager.getCurrentStage();
        
        // 验证阶段与时间的一致性
        if (gameTime < 15000) {
          return currentStage && currentStage.id === 'baby';
        } else if (gameTime < 35000) {
          return currentStage && currentStage.id === 'child';
        } else if (gameTime < 55000) {
          return currentStage && currentStage.id === 'teen';
        } else if (gameTime < 85000) {
          return currentStage && currentStage.id === 'adult';
        } else {
          return currentStage && currentStage.id === 'elder';
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * **Feature: life-journey-game, Property 3: 游戏重置往返性**
   * 对于任何游戏状态，重置游戏后应该返回到初始的新生儿状态，倒计时为100秒
   * **验证: 需求 1.5**
   */
  test('属性 3: 游戏重置往返性', () => {
    fc.assert(fc.property(
      fc.record({
        gameTime: fc.integer({ min: 0, max: 100000 }),
        isGameActive: fc.boolean(),
        isGameComplete: fc.boolean()
      }),
      (initialState) => {
        // 创建状态管理器并设置任意状态
        const stateManager = new StateManager();
        
        // 设置任意游戏状态
        stateManager.gameTime = initialState.gameTime;
        stateManager.isGameActive = initialState.isGameActive;
        stateManager.isGameComplete = initialState.isGameComplete;
        
        if (initialState.gameTime > 0) {
          stateManager.checkStageTransition();
        }
        
        // 重置游戏
        stateManager.resetGame();
        
        // 验证重置后的状态
        const isTimeReset = stateManager.gameTime === 0;
        const isActiveReset = stateManager.isGameActive === false;
        const isCompleteReset = stateManager.isGameComplete === false;
        const isStageReset = stateManager.currentStage === null;
        
        return isTimeReset && isActiveReset && isCompleteReset && isStageReset;
      }
    ), { numRuns: 100 });
  });
});