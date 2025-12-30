/**
 * 简化的游戏控制器
 */
class SimpleGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        
        // 游戏组件
        this.character = null;
        this.scene = null;
        this.interactionManager = null;
        
        // 游戏状态
        this.isRunning = false;
        this.isPaused = false;
        this.gameTime = 0;
        this.totalGameTime = 100000; // 100秒
        this.currentStage = 'baby';
        this.score = 0;
        
        // 人生阶段配置
        this.lifeStages = [
            { id: 'baby', name: '婴儿期', duration: 15000, color: '#ffb3ba' },
            { id: 'child', name: '儿童期', duration: 20000, color: '#87ceeb' },
            { id: 'teen', name: '青少年期', duration: 20000, color: '#90ee90' },
            { id: 'adult', name: '成年期', duration: 30000, color: '#ffff99' },
            { id: 'elder', name: '老年期', duration: 15000, color: '#deb887' }
        ];
        
        this.currentStageIndex = 0;
        this.stageStartTime = 0;
        
        // 事件生成
        this.lastEventTime = 0;
        this.eventInterval = 1000; // 缩短为1秒生成一个事件，确保有持续的可交互元素
        
        console.log('SimpleGame created');
    }
    
    /**
     * 初始化游戏
     */
    async initialize() {
        try {
            // 获取Canvas
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Canvas not found');
            }
            
            this.ctx = this.canvas.getContext('2d');
            
            // 创建游戏组件
            this.character = new Character(this.canvas);
            this.scene = new Scene(this.canvas);
            this.interactionManager = new InteractionManager(this.canvas);
            
            // 设置事件监听
            this.setupEventListeners();
            
            // 显示开始界面
            this.showStartScreen();
            
            console.log('SimpleGame initialized');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError(error.message);
        }
    }
    
    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 监听交互完成事件
        document.addEventListener('interactionCompleted', (e) => {
            const { event, success } = e.detail;
            
            if (success) {
                this.score += 10;
                console.log('Score increased:', this.score);
                
                // 角色根据事件类型执行相应动作
                if (event.story) {
                    this.character.performAction(event.story.action, 2000);
                    this.character.setEmotion(event.story.emotion, 3000);
                    
                    // 角色精确移动到事件位置
                    this.character.moveTo(event.x, event.y);
                } else {
                    this.character.performAction('dancing', 1500);
                    this.character.setEmotion('happy', 2000);
                }
            } else {
                // 失败时的反应
                this.character.setEmotion('sad', 2000);
                this.character.performAction('thinking', 1000);
            }
        });
        
        // 监听故事事件
        document.addEventListener('storyEvent', (e) => {
            const { title, description, action, emotion } = e.detail;
            console.log('Story event:', title, description);
            
            // 显示故事文本（如果有UI元素）
            this.showStoryText(title, description);
            
            // 角色预备动作
            this.character.setEmotion('surprised', 1000);
            setTimeout(() => {
                this.character.performAction('thinking', 1000);
            }, 500);
        });
        
        // 点击开始游戏 - 只响应按钮点击
        this.canvas.addEventListener('click', (e) => {
            if (!this.isRunning) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // 检查是否点击了开始按钮
                if (this.isPointInButton(x, y, this.startButton)) {
                    this.startGame();
                }
            }
        });
    }
    
    /**
     * 显示故事文本
     */
    showStoryText(title, description) {
        // 如果页面有故事文本元素，更新它
        const storyElement = document.getElementById('storyText');
        if (storyElement) {
            storyElement.textContent = `${title}: ${description}`;
            storyElement.style.animation = 'none';
            setTimeout(() => {
                storyElement.style.animation = 'fadeIn 0.5s ease-in';
            }, 10);
        }
    }
    
    /**
     * 显示开始界面
     */
    showStartScreen() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 标题
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('人生旅程游戏', this.canvas.width / 2, this.canvas.height / 2 - 100);
        
        // 副标题
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText('100秒体验完整人生', this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        // 预览角色
        if (this.character) {
            this.character.setPosition(this.canvas.width / 2, this.canvas.height / 2 + 50);
            this.character.render();
        }
        
        // 绘制开始按钮
        this.drawStartButton();
        
        // 说明
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#999999';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('完成交互任务获得分数', this.canvas.width / 2, this.canvas.height / 2 + 160);
    }
    
    /**
     * 绘制开始按钮
     */
    drawStartButton() {
        const buttonWidth = 200;
        const buttonHeight = 60;
        const buttonX = (this.canvas.width - buttonWidth) / 2;
        const buttonY = this.canvas.height / 2 + 100;
        
        // 保存按钮位置和尺寸，用于点击检测
        this.startButton = {
            x: buttonX,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight
        };
        
        // 绘制按钮背景
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // 绘制按钮边框
        this.ctx.strokeStyle = '#44a08d';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // 绘制按钮文字
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('开始游戏', this.canvas.width / 2, buttonY + buttonHeight / 2 + 8);
    }
    
    /**
     * 检查点击是否在按钮内
     */
    isPointInButton(x, y, button) {
        return x >= button.x && x <= button.x + button.width &&
               y >= button.y && y <= button.y + button.height;
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        if (this.isRunning) return;
        
        console.log('Starting game...');
        
        // 重置游戏状态
        this.gameTime = 0;
        this.score = 0;
        this.currentStageIndex = 0;
        this.currentStage = this.lifeStages[0].id;
        this.stageStartTime = 0;
        this.lastEventTime = 0;
        
        // 设置初始状态
        this.character.setStage(this.currentStage);
        this.character.setPosition(this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.scene.setStage(this.currentStage);
        
        // 清除当前交互事件
        this.interactionManager.clearCurrentEvent();
        
        this.isRunning = true;
        this.gameLoop();
    }
    
    /**
     * 游戏主循环
     */
    gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        const currentTime = Date.now();
        const deltaTime = 16; // 约60FPS
        
        // 更新游戏状态
        this.update(deltaTime);
        
        // 渲染游戏
        this.render();
        
        // 检查游戏结束
        if (this.gameTime >= this.totalGameTime) {
            this.endGame();
            return;
        }
        
        // 继续循环
        setTimeout(() => this.gameLoop(), 16);
    }
    
    /**
     * 更新游戏状态
     */
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // 更新人生阶段
        this.updateLifeStage();
        
        // 更新游戏组件
        if (this.character) {
            this.character.update(deltaTime);
        }
        
        if (this.interactionManager) {
            this.interactionManager.update(deltaTime);
        }
        
        // 生成新的交互事件
        this.generateEvents();
    }
    
    /**
     * 更新人生阶段
     */
    updateLifeStage() {
        const currentStageConfig = this.lifeStages[this.currentStageIndex];
        const stageElapsed = this.gameTime - this.stageStartTime;
        
        if (stageElapsed >= currentStageConfig.duration && this.currentStageIndex < this.lifeStages.length - 1) {
            // 进入下一个阶段
            this.currentStageIndex++;
            this.stageStartTime = this.gameTime;
            
            const newStage = this.lifeStages[this.currentStageIndex];
            this.currentStage = newStage.id;
            
            console.log('Entering stage:', newStage.name);
            
            // 更新组件
            this.character.setStage(this.currentStage);
            this.scene.setStage(this.currentStage);
            
            // 阶段转换时的特殊动作
            this.character.setEmotion('excited', 3000);
            this.character.performAction('dancing', 3000);
            
            // 角色可能会移动到场景中心
            const centerX = this.canvas.width / 2 + (Math.random() - 0.5) * 100;
            const centerY = this.canvas.height / 2 + 50 + (Math.random() - 0.5) * 50;
            this.character.moveTo(centerX, centerY);
            
            // 显示阶段转换信息
            this.showStoryText(`进入${newStage.name}`, `人生的新篇章开始了...`);
        }
    }
    
    /**
     * 生成交互事件
     */
    generateEvents() {
        const timeSinceLastEvent = this.gameTime - this.lastEventTime;
        
        if (timeSinceLastEvent >= this.eventInterval && !this.interactionManager.getCurrentEvent()) {
            this.interactionManager.createEvent(this.currentStage);
            this.lastEventTime = this.gameTime;
            
            // 角色注意到新事件的动作
            this.character.setEmotion('surprised', 1000);
            this.character.performAction('thinking', 1500);
            
            // 角色可能会移动到事件附近
            if (Math.random() < 0.7) { // 70%概率移动
                const event = this.interactionManager.getCurrentEvent();
                if (event) {
                    const targetX = event.x + (Math.random() - 0.5) * 150;
                    const targetY = Math.min(event.y + 80, this.canvas.height - 100);
                    this.character.moveTo(targetX, targetY);
                }
            }
        }
    }
    
    /**
     * 渲染游戏
     */
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染场景
        if (this.scene) {
            this.scene.render();
        }
        
        // 渲染角色
        if (this.character) {
            this.character.render();
        }
        
        // 渲染交互事件
        if (this.interactionManager) {
            this.interactionManager.render();
        }
        
        // 渲染UI
        this.renderUI();
    }
    
    /**
     * 渲染UI
     */
    renderUI() {
        const ctx = this.ctx;
        
        // 当前阶段
        const currentStageConfig = this.lifeStages[this.currentStageIndex];
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(currentStageConfig.name, this.canvas.width / 2, 40);
        
        // 时间进度条
        const progress = this.gameTime / this.totalGameTime;
        const barWidth = this.canvas.width - 40;
        const barHeight = 10;
        const barX = 20;
        const barY = 60;
        
        // 进度条背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 进度条填充
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        // 时间文字
        const remainingTime = Math.max(0, Math.ceil((this.totalGameTime - this.gameTime) / 1000));
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`剩余时间: ${remainingTime}秒`, 20, 95);
        
        // 分数
        ctx.textAlign = 'right';
        ctx.fillText(`分数: ${this.score}`, this.canvas.width - 20, 95);
        
        // 阶段进度
        const stageProgress = (this.gameTime - this.stageStartTime) / currentStageConfig.duration;
        ctx.textAlign = 'center';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`${currentStageConfig.name} ${Math.floor(stageProgress * 100)}%`, this.canvas.width / 2, 95);
    }
    
    /**
     * 结束游戏
     */
    endGame() {
        this.isRunning = false;
        console.log('Game ended. Final score:', this.score);
        
        // 显示结果
        this.showGameResult();
    }
    
    /**
     * 显示游戏结果
     */
    showGameResult() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 结果标题
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('人生旅程结束', this.canvas.width / 2, this.canvas.height / 2 - 80);
        
        // 分数
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillText(`最终分数: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        // 评价
        let evaluation = '';
        if (this.score >= 80) evaluation = '完美人生';
        else if (this.score >= 60) evaluation = '充实人生';
        else if (this.score >= 30) evaluation = '平凡人生';
        else evaluation = '匆忙人生';
        
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillStyle = '#ffe66d';
        this.ctx.fillText(evaluation, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        // 重新开始提示
        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText('点击屏幕重新开始', this.canvas.width / 2, this.canvas.height / 2 + 80);
        
        // 思考提示
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#999999';
        this.ctx.fillText('回想一下，什么才是人生中最重要的？', this.canvas.width / 2, this.canvas.height / 2 + 120);
    }
    
    /**
     * 显示错误
     */
    showError(message) {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏错误', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
    
    /**
     * 暂停游戏
     */
    pause() {
        this.isPaused = true;
    }
    
    /**
     * 恢复游戏
     */
    resume() {
        this.isPaused = false;
        if (this.isRunning) {
            this.gameLoop();
        }
    }
}

// Export for Node.js (testing) and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleGame;
}