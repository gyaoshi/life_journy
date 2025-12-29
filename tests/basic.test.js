/**
 * 基础项目结构测试
 */

const fs = require('fs');
const path = require('path');

describe('项目结构测试', () => {
  test('应该存在所有核心文件', () => {
    const coreFiles = [
      'src/core/GameEngine.js',
      'src/core/StateManager.js',
      'src/core/EventSystem.js',
      'src/core/InputHandler.js',
      'src/core/AudioManager.js',
      'src/core/ScoreSystem.js'
    ];
    
    coreFiles.forEach(file => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(true);
    });
  });
  
  test('应该存在所有数据模型文件', () => {
    const modelFiles = [
      'src/models/GameState.js',
      'src/models/LifeStage.js',
      'src/models/LifeEvent.js',
      'src/models/InteractionTarget.js'
    ];
    
    modelFiles.forEach(file => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(true);
    });
  });
  
  test('应该存在主要配置文件', () => {
    const configFiles = [
      'index.html',
      'package.json',
      'jest.config.js',
      'src/main.js'
    ];
    
    configFiles.forEach(file => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(true);
    });
  });
  
  test('HTML文件应该包含Canvas元素', () => {
    const htmlContent = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    
    expect(htmlContent).toContain('<canvas id="gameCanvas"');
    expect(htmlContent).toContain('人生旅程游戏');
  });
  
  test('package.json应该包含必要的依赖', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    
    expect(packageJson.devDependencies).toHaveProperty('jest');
    expect(packageJson.devDependencies).toHaveProperty('fast-check');
    expect(packageJson.devDependencies).toHaveProperty('jest-environment-jsdom');
  });
});