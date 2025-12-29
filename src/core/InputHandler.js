/**
 * InputHandler - 触摸输入处理器
 * 负责处理触摸事件检测和手势识别功能
 */
class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.isEnabled = true;
        this.touchStartPos = null;
        this.touchStartTime = 0;
        this.isDragging = false;
        this.dragThreshold = 10; // 拖拽阈值(像素)
        this.tapTimeout = 300; // 点击超时(毫秒)
        
        // 事件回调
        this.onTouchCallback = null;
        this.onDragCallback = null;
        this.onClickCallback = null;
        
        this.bindEvents();
        console.log('InputHandler initialized');
    }
    
    /**
     * 绑定触摸事件
     */
    bindEvents() {
        // 触摸事件
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // 鼠标事件(用于桌面测试)
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // 防止默认行为
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        this.canvas.addEventListener('selectstart', e => e.preventDefault());
    }
    
    /**
     * 处理触摸开始
     */
    handleTouchStart(event) {
        if (!this.isEnabled) return;
        
        event.preventDefault();
        
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        this.touchStartPos = {
            x: (touch.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (touch.clientY - rect.top) * (this.canvas.height / rect.height)
        };
        
        this.touchStartTime = Date.now();
        this.isDragging = false;
        
        this.emitTouchEvent('touchstart', this.touchStartPos);
    }
    
    /**
     * 处理触摸移动
     */
    handleTouchMove(event) {
        if (!this.isEnabled || !this.touchStartPos) return;
        
        event.preventDefault();
        
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        const currentPos = {
            x: (touch.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (touch.clientY - rect.top) * (this.canvas.height / rect.height)
        };
        
        const deltaX = currentPos.x - this.touchStartPos.x;
        const deltaY = currentPos.y - this.touchStartPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > this.dragThreshold && !this.isDragging) {
            this.isDragging = true;
            this.emitDragEvent('dragstart', currentPos, deltaX, deltaY);
        }
        
        if (this.isDragging) {
            this.emitDragEvent('drag', currentPos, deltaX, deltaY);
        }
    }
    
    /**
     * 处理触摸结束
     */
    handleTouchEnd(event) {
        if (!this.isEnabled || !this.touchStartPos) return;
        
        event.preventDefault();
        
        const touchDuration = Date.now() - this.touchStartTime;
        
        if (this.isDragging) {
            this.emitDragEvent('dragend', this.touchStartPos, 0, 0);
        } else if (touchDuration < this.tapTimeout) {
            this.emitClickEvent('click', this.touchStartPos);
        }
        
        this.touchStartPos = null;
        this.isDragging = false;
    }
    
    /**
     * 处理鼠标按下(桌面测试用)
     */
    handleMouseDown(event) {
        if (!this.isEnabled) return;
        
        const rect = this.canvas.getBoundingClientRect();
        
        this.touchStartPos = {
            x: (event.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (event.clientY - rect.top) * (this.canvas.height / rect.height)
        };
        
        this.touchStartTime = Date.now();
        this.isDragging = false;
        
        this.emitTouchEvent('touchstart', this.touchStartPos);
    }
    
    /**
     * 处理鼠标移动(桌面测试用)
     */
    handleMouseMove(event) {
        if (!this.isEnabled || !this.touchStartPos) return;
        
        const rect = this.canvas.getBoundingClientRect();
        
        const currentPos = {
            x: (event.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (event.clientY - rect.top) * (this.canvas.height / rect.height)
        };
        
        const deltaX = currentPos.x - this.touchStartPos.x;
        const deltaY = currentPos.y - this.touchStartPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > this.dragThreshold && !this.isDragging) {
            this.isDragging = true;
            this.emitDragEvent('dragstart', currentPos, deltaX, deltaY);
        }
        
        if (this.isDragging) {
            this.emitDragEvent('drag', currentPos, deltaX, deltaY);
        }
    }
    
    /**
     * 处理鼠标释放(桌面测试用)
     */
    handleMouseUp(event) {
        if (!this.isEnabled || !this.touchStartPos) return;
        
        const touchDuration = Date.now() - this.touchStartTime;
        
        if (this.isDragging) {
            this.emitDragEvent('dragend', this.touchStartPos, 0, 0);
        } else if (touchDuration < this.tapTimeout) {
            this.emitClickEvent('click', this.touchStartPos);
        }
        
        this.touchStartPos = null;
        this.isDragging = false;
    }
    
    /**
     * 发送触摸事件
     */
    emitTouchEvent(type, position) {
        const inputEvent = {
            type: type,
            x: position.x,
            y: position.y,
            timestamp: Date.now()
        };
        
        if (this.onTouchCallback) {
            this.onTouchCallback(inputEvent);
        }
    }
    
    /**
     * 发送拖拽事件
     */
    emitDragEvent(type, position, deltaX, deltaY) {
        const inputEvent = {
            type: type,
            x: position.x,
            y: position.y,
            deltaX: deltaX,
            deltaY: deltaY,
            timestamp: Date.now()
        };
        
        if (this.onDragCallback) {
            this.onDragCallback(inputEvent);
        }
    }
    
    /**
     * 发送点击事件
     */
    emitClickEvent(type, position) {
        const inputEvent = {
            type: type,
            x: position.x,
            y: position.y,
            timestamp: Date.now()
        };
        
        if (this.onClickCallback) {
            this.onClickCallback(inputEvent);
        }
    }
    
    /**
     * 设置触摸事件回调
     */
    setTouchCallback(callback) {
        this.onTouchCallback = callback;
    }
    
    /**
     * 设置拖拽事件回调
     */
    setDragCallback(callback) {
        this.onDragCallback = callback;
    }
    
    /**
     * 设置点击事件回调
     */
    setClickCallback(callback) {
        this.onClickCallback = callback;
    }
    
    /**
     * 验证交互有效性
     */
    isValidInteraction(event) {
        // 检查事件是否在画布范围内
        if (event.x < 0 || event.x > this.canvas.width || 
            event.y < 0 || event.y > this.canvas.height) {
            return false;
        }
        
        // 检查事件类型是否有效
        const validTypes = ['click', 'touchstart', 'drag', 'dragstart', 'dragend'];
        if (!validTypes.includes(event.type)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 启用输入处理
     */
    enable() {
        this.isEnabled = true;
    }
    
    /**
     * 禁用输入处理
     */
    disable() {
        this.isEnabled = false;
        this.touchStartPos = null;
        this.isDragging = false;
    }
    
    /**
     * 获取相对于画布的坐标
     */
    getCanvasCoordinates(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        
        return {
            x: (clientX - rect.left) * (this.canvas.width / rect.width),
            y: (clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }
}