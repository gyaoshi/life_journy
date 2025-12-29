/**
 * StateManager 状态管理测试
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
      { id: 'baby', name: '婴儿期', duration: 15000, startTime: 0, difficulty: 1 },
      { id: 'child', name: '儿童期', duration: 20000, startTime: 15000, difficulty: 2 },
      { id: 'teen', name: '青少年期', duration: 20000, startTime: 35000, difficulty: 3 },
      { id: 'adult', name: '成年期', duration: 30000, startTime: 55000, difficulty: 4 },
      { id: 'elder', name: '老年期', duration: 15000, startTime: 85000, difficulty: 3 }
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
  
  endGame() {
    this.isGameActive = false;
    this.isGameComplete = true;
  }
  
  update(deltaTime) {
    if (!this.isGameActive || this.isGameComplete) return;
    this.gameTime += deltaTime;
    this.checkStageTransition();
    if (this.gameTime >= this.totalGameTime) {
      this.endGame();
    }
  }
  
  checkStageTransition() {
    const newStage = this.getStageForTime(this.gameTime);
    if (newStage && (!this.currentStage || newStage.id !== this.currentStage.id)) {
      this.currentStage = newStage;
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
  
  getTimeLeft() {
    return Math.max((this.totalGameTime - this.gameTime) / 1000, 0);
  }
  
  getGameProgress() {
    return Math.min(this.gameTime / this.totalGameTime, 1);
  }
  
  getStageProgress() {
    if (!this.currentStage) return 0;
    const stageElapsed = this.gameTime - this.currentStage.startTime;
    return Math.min(stageElapsed / this.currentStage.duration, 1);
  }
  
  getAllStages() {
    return [...this.lifeStages];
  }
}

describe('StateManager', () => {
  let stateManager;
  
  beforeEach(() => {
    stateManager = new StateManager();
  });
  
  describe('基础功能测试', () => {
    test('应该正确初始化StateManager', () => {
      expect(stateManager).toBeDefined();
      expect(stateManager.gameTime).toBe(0);
      expect(stateManager.isGameActive).toBe(false);
      expect(stateManager.isGameComplete).toBe(false);
      expect(stateManager.currentStage).toBeNull();
    });
    
    test('应该正确开始游戏', () => {
      stateManager.startGame();
      
      expect(stateManager.isGameActive).toBe(true);
      expect(stateManager.isGameComplete).toBe(false);
      expect(stateManager.gameTime).toBe(0);
      expect(stateManager.currentStage).toBeDefined();
      expect(stateManager.currentStage.id).toBe('baby');
    });
    
    test('应该正确重置游戏', () => {
      stateManager.startGame();
      stateManager.gameTime = 50000;
      
      stateManager.resetGame();
      
      expect(stateManager.gameTime).toBe(0);
      expect(stateManager.isGameActive).toBe(false);
      expect(stateManager.isGameComplete).toBe(false);
      expect(stateManager.currentStage).toBeNull();
    });
    
    test('应该正确结束游戏', () => {
      stateManager.startGame();
      
      stateManager.endGame();
      
      expect(stateManager.isGameActive).toBe(false);
      expect(stateManager.isGameComplete).toBe(true);
    });
  });
  
  describe('时间管理测试', () => {
    test('应该正确更新游戏时间', () => {
      stateManager.startGame();
      const initialTime = stateManager.gameTime;
      
      stateManager.update(1000); // 1秒
      
      expect(stateManager.gameTime).toBe(initialTime + 1000);
    });
    
    test('游戏未激活时不应更新时间', () => {
      const initialTime = stateManager.gameTime;
      
      stateManager.update(1000);
      
      expect(stateManager.gameTime).toBe(initialTime);
    });
    
    test('应该正确计算剩余时间', () => {
      stateManager.startGame();
      stateManager.gameTime = 30000; // 30秒
      
      const remainingTime = stateManager.getTimeLeft();
      
      expect(remainingTime).toBe(70); // 100 - 30 = 70秒
    });
    
    test('应该正确计算游戏进度', () => {
      stateManager.startGame();
      stateManager.gameTime = 50000; // 50秒
      
      const progress = stateManager.getGameProgress();
      
      expect(progress).toBe(0.5); // 50/100 = 0.5
    });
  });
  
  describe('人生阶段管理测试', () => {
    test('应该包含所有预定义的人生阶段', () => {
      const stages = stateManager.getAllStages();
      
      expect(stages).toHaveLength(5);
      expect(stages.map(s => s.id)).toEqual(['baby', 'child', 'teen', 'adult', 'elder']);
    });
    
    test('应该正确根据时间获取人生阶段', () => {
      const babyStage = stateManager.getStageForTime(5000);
      expect(babyStage.id).toBe('baby');
      
      const childStage = stateManager.getStageForTime(20000);
      expect(childStage.id).toBe('child');
      
      const teenStage = stateManager.getStageForTime(40000);
      expect(teenStage.id).toBe('teen');
      
      const adultStage = stateManager.getStageForTime(70000);
      expect(adultStage.id).toBe('adult');
      
      const elderStage = stateManager.getStageForTime(90000);
      expect(elderStage.id).toBe('elder');
    });
    
    test('应该正确切换人生阶段', () => {
      stateManager.startGame();
      
      // 模拟时间推进到儿童期
      stateManager.gameTime = 20000;
      stateManager.checkStageTransition();
      
      expect(stateManager.currentStage.id).toBe('child');
    });
    
    test('应该正确计算阶段进度', () => {
      stateManager.startGame();
      stateManager.gameTime = 7500; // 婴儿期一半时间
      
      const progress = stateManager.getStageProgress();
      
      expect(progress).toBe(0.5); // 7500 / 15000 = 0.5
    });
  });
  
  describe('游戏结束条件测试', () => {
    test('应该在100秒后自动结束游戏', () => {
      stateManager.startGame();
      
      stateManager.update(100000); // 100秒
      
      expect(stateManager.isGameComplete).toBe(true);
      expect(stateManager.isGameActive).toBe(false);
    });
    
    test('应该在超过100秒后结束游戏', () => {
      stateManager.startGame();
      
      stateManager.update(120000); // 120秒
      
      expect(stateManager.isGameComplete).toBe(true);
    });
  });
});