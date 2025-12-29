/**
 * JavaScript语法验证测试
 */

const fs = require('fs');
const path = require('path');

describe('JavaScript语法验证', () => {
  const jsFiles = [
    'src/core/GameEngine.js',
    'src/core/StateManager.js',
    'src/core/EventSystem.js',
    'src/core/InputHandler.js',
    'src/core/AudioManager.js',
    'src/core/ScoreSystem.js',
    'src/models/GameState.js',
    'src/models/LifeStage.js',
    'src/models/LifeEvent.js',
    'src/models/InteractionTarget.js',
    'src/main.js'
  ];
  
  jsFiles.forEach(file => {
    test(`${file} 应该有有效的JavaScript语法`, () => {
      const filePath = path.join(process.cwd(), file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 基本语法检查
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
      
      // 检查是否包含class定义
      if (file.includes('src/core/') || file.includes('src/models/')) {
        expect(content).toMatch(/class\s+\w+/);
      }
      
      // 检查括号匹配
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      expect(openBraces).toBe(closeBraces);
      
      // 检查是否有基本的构造函数
      if (file.includes('src/core/') || file.includes('src/models/')) {
        expect(content).toMatch(/constructor\s*\(/);
      }
    });
  });
  
  test('HTML文件应该正确引用所有JavaScript文件', () => {
    const htmlPath = path.join(process.cwd(), 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // 检查核心文件引用
    expect(htmlContent).toContain('src/core/GameEngine.js');
    expect(htmlContent).toContain('src/core/StateManager.js');
    expect(htmlContent).toContain('src/core/EventSystem.js');
    expect(htmlContent).toContain('src/core/InputHandler.js');
    expect(htmlContent).toContain('src/core/AudioManager.js');
    expect(htmlContent).toContain('src/core/ScoreSystem.js');
    
    // 检查模型文件引用
    expect(htmlContent).toContain('src/models/GameState.js');
    expect(htmlContent).toContain('src/models/LifeStage.js');
    expect(htmlContent).toContain('src/models/LifeEvent.js');
    expect(htmlContent).toContain('src/models/InteractionTarget.js');
    
    // 检查主文件引用
    expect(htmlContent).toContain('src/main.js');
  });
});