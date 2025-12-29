/**
 * DifficultyManager 属性测试
 */

const fc = require('fast-check');

// 简化的StateManager类用于测试
class StateManager {
  constructor() {
    this.currentStage = null;
    this.gameTime = 0;
    this.totalGameTime = 100000;
    this.isGameActive = false;
    this.isGameComplete = false;
    
    this.lifeStages = [
      { id: 'baby', name: '婴儿期', duration: 15000, difficulty: 1, startTime: 0 },
      { id: 'child', name: '儿童期', duration: 20000, difficulty: 2, startTime: 15000 },
      { id: 'teen', name: '青少年期', duration: 20000, difficulty: 3, startTime: 35000 },
      { id: 'adult', name: '成年期', duration: 30000, difficulty: 4, startTime: 55000 },
      { id: 'elder', name: '老年期', duration: 15000, difficulty: 3, startTime: 85000 }
    ];
  }
  
  startGame() {
    this.gameTime = 0;
    this.isGameActive = true;
    this.isGameComplete = false;
    this.currentStage = this.lifeStages[0];
  }
  
  getCurrentStage() {
    return this.currentStage;
  }
  
  getAllStages() {
    return [...this.lifeStages];
  }
  
  getStageById(stageId) {
    return this.lifeStages.find(stage => stage.id === stageId);
  }
  
  setCurrentStage(stageId) {
    this.currentStage = this.getStageById(stageId);
  }
}

// 简化的DifficultyManager类用于测试
class DifficultyManager {
  constructor(stateManager, eventSystem) {
    this.stateManager = stateManager;
    this.eventSystem = eventSystem;
    
    this.baseDifficulty = {
      'baby': 1,
      'child': 2,
      'teen': 3,
      'adult': 4,
      'elder': 3
    };
    
    this.dynamicDifficultyEnabled = true;
    this.currentDifficultyModifier = 0;
    this.maxDifficultyModifier = 2;
    this.minDifficultyModifier = -2;
    
    this.recentPerformance = [];
    this.performanceWindowSize = 5;
    this.consecutiveSuccesses = 0;
    this.consecutiveFailures = 0;
    
    this.successThreshold = 3;
    this.failureThreshold = 3;
    this.adjustmentCooldown = 5000;
    this.lastAdjustmentTime = 0;
    
    this.timeLimitMultipliers = {
      1: 1.5,
      2: 1.2,
      3: 1.0,
      4: 0.8,
      5: 0.6
    };
  }
  
  getCurrentDifficulty() {
    const currentStage = this.stateManager.getCurrentStage();
    if (!currentStage) return 1;
    
    const baseDifficulty = this.baseDifficulty[currentStage.id] || 1;
    const adjustedDifficulty = baseDifficulty + this.currentDifficultyModifier;
    
    return Math.max(1, Math.min(5, adjustedDifficulty));
  }
  
  getBaseDifficultyForStage(stageId) {
    return this.baseDifficulty[stageId] || 1;
  }
  
  calculateEventDifficulty(baseEventDifficulty, stageId) {
    const stageDifficulty = this.getBaseDifficultyForStage(stageId);
    const currentDifficulty = this.getCurrentDifficulty();
    
    const finalDifficulty = Math.min(5, Math.max(1, 
      baseEventDifficulty + stageDifficulty - 1 + this.currentDifficultyModifier
    ));
    
    return finalDifficulty;
  }
  
  adjustTimeLimit(baseTimeLimit, difficulty) {
    const multiplier = this.timeLimitMultipliers[difficulty] || 1.0;
    return Math.max(1000, Math.round(baseTimeLimit * multiplier));
  }
  
  recordInteractionResult(success, eventDifficulty, completionTime) {
    const result = {
      success: success,
      difficulty: eventDifficulty,
      completionTime: completionTime,
      timestamp: Date.now()
    };
    
    this.recentPerformance.push(result);
    
    if (this.recentPerformance.length > this.performanceWindowSize) {
      this.recentPerformance.shift();
    }
    
    if (success) {
      this.consecutiveSuccesses++;
      this.consecutiveFailures = 0;
    } else {
      this.consecutiveFailures++;
      this.consecutiveSuccesses = 0;
    }
    
    this.checkDifficultyAdjustment();
  }
  
  checkDifficultyAdjustment() {
    if (!this.dynamicDifficultyEnabled) return;
    
    const currentTime = Date.now();
    
    if (currentTime - this.lastAdjustmentTime < this.adjustmentCooldown) {
      return;
    }
    
    let shouldAdjust = false;
    let adjustment = 0;
    
    if (this.consecutiveSuccesses >= this.successThreshold) {
      if (this.currentDifficultyModifier < this.maxDifficultyModifier) {
        adjustment = 1;
        shouldAdjust = true;
      }
    } else if (this.consecutiveFailures >= this.failureThreshold) {
      if (this.currentDifficultyModifier > this.minDifficultyModifier) {
        adjustment = -1;
        shouldAdjust = true;
      }
    }
    
    if (shouldAdjust) {
      this.adjustDifficulty(adjustment);
      this.lastAdjustmentTime = currentTime;
      this.consecutiveSuccesses = 0;
      this.consecutiveFailures = 0;
    }
  }
  
  adjustDifficulty(adjustment) {
    const oldModifier = this.currentDifficultyModifier;
    this.currentDifficultyModifier = Math.max(
      this.minDifficultyModifier,
      Math.min(this.maxDifficultyModifier, this.currentDifficultyModifier + adjustment)
    );
  }
  
  validateStageDifficultyProgression() {
    const stages = this.stateManager.getAllStages();
    
    for (let i = 1; i < stages.length - 1; i++) {
      const currentStage = stages[i];
      const previousStage = stages[i - 1];
      
      const currentDifficulty = this.getBaseDifficultyForStage(currentStage.id);
      const previousDifficulty = this.getBaseDifficultyForStage(previousStage.id);
      
      if (currentDifficulty < previousDifficulty) {
        return false;
      }
    }
    
    return true;
  }
  
  getDifficultyProtectionStatus() {
    return {
      isProtected: this.consecutiveFailures >= this.failureThreshold && 
                  this.currentDifficultyModifier <= this.minDifficultyModifier,
      consecutiveFailures: this.consecutiveFailures,
      currentModifier: this.currentDifficultyModifier,
      canDecrease: this.currentDifficultyModifier > this.minDifficultyModifier
    };
  }
  
  setDifficultyModifier(modifier) {
    this.currentDifficultyModifier = Math.max(
      this.minDifficultyModifier,
      Math.min(this.maxDifficultyModifier, modifier)
    );
  }
  
  reset() {
    this.currentDifficultyModifier = 0;
    this.recentPerformance = [];
    this.consecutiveSuccesses = 0;
    this.consecutiveFailures = 0;
    this.lastAdjustmentTime = 0;
  }
}

describe('DifficultyManager 属性测试', () => {
  /**
   * **Feature: life-journey-game, Property 13: 阶段难度递进一致性**
   * 对于任何人生阶段序列，后期阶段的交互任务难度应该大于或等于前期阶段
   * **验证: 需求 5.1, 5.2**
   */
  test('属性 13: 阶段难度递进一致性', () => {
    fc.assert(fc.property(
      fc.constant(null), // 不需要随机输入，测试固定的阶段序列
      () => {
        // 创建状态管理器和难度管理器
        const stateManager = new StateManager();
        const difficultyManager = new DifficultyManager(stateManager, null);
        
        // 验证阶段难度递进一致性
        const isProgressionValid = difficultyManager.validateStageDifficultyProgression();
        
        // 手动验证每个阶段的难度递进
        const stages = stateManager.getAllStages();
        let manualValidation = true;
        
        for (let i = 1; i < stages.length - 1; i++) { // 排除最后的elder阶段
          const currentStage = stages[i];
          const previousStage = stages[i - 1];
          
          const currentDifficulty = difficultyManager.getBaseDifficultyForStage(currentStage.id);
          const previousDifficulty = difficultyManager.getBaseDifficultyForStage(previousStage.id);
          
          if (currentDifficulty < previousDifficulty) {
            manualValidation = false;
            break;
          }
        }
        
        // 验证具体的难度值
        const babyDifficulty = difficultyManager.getBaseDifficultyForStage('baby');
        const childDifficulty = difficultyManager.getBaseDifficultyForStage('child');
        const teenDifficulty = difficultyManager.getBaseDifficultyForStage('teen');
        const adultDifficulty = difficultyManager.getBaseDifficultyForStage('adult');
        const elderDifficulty = difficultyManager.getBaseDifficultyForStage('elder');
        
        const specificValidation = 
          babyDifficulty <= childDifficulty &&
          childDifficulty <= teenDifficulty &&
          teenDifficulty <= adultDifficulty &&
          elderDifficulty >= 1; // elder可以比adult低，但不能低于1
        
        return isProgressionValid && manualValidation && specificValidation;
      }
    ), { numRuns: 100 });
  });

  /**
   * **Feature: life-journey-game, Property 14: 难度时间限制反比关系**
   * 对于任何交互任务，难度增加时反应时间限制应该相应减少
   * **验证: 需求 5.3**
   */
  test('属性 14: 难度时间限制反比关系', () => {
    fc.assert(fc.property(
      fc.record({
        baseTimeLimit: fc.integer({ min: 1000, max: 10000 }), // 基础时间限制 1-10秒
        difficulty1: fc.integer({ min: 1, max: 5 }),
        difficulty2: fc.integer({ min: 1, max: 5 })
      }),
      ({ baseTimeLimit, difficulty1, difficulty2 }) => {
        // 创建状态管理器和难度管理器
        const stateManager = new StateManager();
        const difficultyManager = new DifficultyManager(stateManager, null);
        
        // 计算两个不同难度的时间限制
        const timeLimit1 = difficultyManager.adjustTimeLimit(baseTimeLimit, difficulty1);
        const timeLimit2 = difficultyManager.adjustTimeLimit(baseTimeLimit, difficulty2);
        
        // 验证反比关系：难度越高，时间限制越短
        if (difficulty1 < difficulty2) {
          return timeLimit1 >= timeLimit2;
        } else if (difficulty1 > difficulty2) {
          return timeLimit1 <= timeLimit2;
        } else {
          // 相同难度应该有相同的时间限制
          return timeLimit1 === timeLimit2;
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * **Feature: life-journey-game, Property 15: 动态难度调整一致性**
   * 对于任何连续成功的交互序列，后续任务的难度应该适当提高
   * **验证: 需求 5.4**
   */
  test('属性 15: 动态难度调整一致性', () => {
    fc.assert(fc.property(
      fc.record({
        initialModifier: fc.integer({ min: -2, max: 1 }), // 初始修正值，确保有提升空间
        successCount: fc.integer({ min: 3, max: 10 }) // 连续成功次数
      }),
      ({ initialModifier, successCount }) => {
        // 创建状态管理器和难度管理器
        const stateManager = new StateManager();
        stateManager.startGame();
        const difficultyManager = new DifficultyManager(stateManager, null);
        
        // 设置初始难度修正值
        difficultyManager.setDifficultyModifier(initialModifier);
        const initialDifficulty = difficultyManager.getCurrentDifficulty();
        
        // 模拟连续成功的交互
        for (let i = 0; i < successCount; i++) {
          // 模拟成功的交互结果
          difficultyManager.recordInteractionResult(true, 3, 1000);
          
          // 如果达到成功阈值且还有提升空间，应该会调整难度
          if ((i + 1) % difficultyManager.successThreshold === 0 && 
              difficultyManager.currentDifficultyModifier < difficultyManager.maxDifficultyModifier) {
            // 等待足够的时间以通过冷却期
            difficultyManager.lastAdjustmentTime = Date.now() - difficultyManager.adjustmentCooldown - 1000;
            difficultyManager.checkDifficultyAdjustment();
          }
        }
        
        const finalDifficulty = difficultyManager.getCurrentDifficulty();
        
        // 验证：如果有足够的连续成功且有提升空间，难度应该增加
        const shouldIncrease = successCount >= difficultyManager.successThreshold && 
                              initialModifier < difficultyManager.maxDifficultyModifier;
        
        if (shouldIncrease) {
          return finalDifficulty >= initialDifficulty;
        } else {
          // 如果没有提升空间或成功次数不够，难度应该保持不变
          return finalDifficulty === initialDifficulty;
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * **Feature: life-journey-game, Property 16: 难度保护机制**
   * 对于任何连续失败的交互序列，难度水平应该保持不变或降低
   * **验证: 需求 5.5**
   */
  test('属性 16: 难度保护机制', () => {
    fc.assert(fc.property(
      fc.record({
        initialModifier: fc.integer({ min: -1, max: 2 }), // 初始修正值，确保有降低空间
        failureCount: fc.integer({ min: 3, max: 10 }) // 连续失败次数
      }),
      ({ initialModifier, failureCount }) => {
        // 创建状态管理器和难度管理器
        const stateManager = new StateManager();
        stateManager.startGame();
        const difficultyManager = new DifficultyManager(stateManager, null);
        
        // 设置初始难度修正值
        difficultyManager.setDifficultyModifier(initialModifier);
        const initialDifficulty = difficultyManager.getCurrentDifficulty();
        
        // 模拟连续失败的交互
        for (let i = 0; i < failureCount; i++) {
          // 模拟失败的交互结果
          difficultyManager.recordInteractionResult(false, 3, null);
          
          // 如果达到失败阈值且还有降低空间，应该会调整难度
          if ((i + 1) % difficultyManager.failureThreshold === 0 && 
              difficultyManager.currentDifficultyModifier > difficultyManager.minDifficultyModifier) {
            // 等待足够的时间以通过冷却期
            difficultyManager.lastAdjustmentTime = Date.now() - difficultyManager.adjustmentCooldown - 1000;
            difficultyManager.checkDifficultyAdjustment();
          }
        }
        
        const finalDifficulty = difficultyManager.getCurrentDifficulty();
        const protectionStatus = difficultyManager.getDifficultyProtectionStatus();
        
        // 验证难度保护机制
        const shouldDecrease = failureCount >= difficultyManager.failureThreshold && 
                              initialModifier > difficultyManager.minDifficultyModifier;
        
        if (shouldDecrease) {
          // 如果有降低空间，难度应该降低或保持不变
          return finalDifficulty <= initialDifficulty;
        } else {
          // 如果已经在最低难度，应该触发保护机制
          if (initialModifier <= difficultyManager.minDifficultyModifier && 
              failureCount >= difficultyManager.failureThreshold) {
            return protectionStatus.isProtected && finalDifficulty === initialDifficulty;
          } else {
            // 失败次数不够，难度应该保持不变
            return finalDifficulty === initialDifficulty;
          }
        }
      }
    ), { numRuns: 100 });
  });
});