/**
 * ResponsiveManager - 响应式设计和移动端适配管理器
 * 负责屏幕适配、布局系统和设备方向锁定
 */
class ResponsiveManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.container = canvas.parentElement;
        
        // 设计基准尺寸 (4:3 比例)
        this.baseWidth = 800;
        this.baseHeight = 600;
        this.aspectRatio = this.baseWidth / this.baseHeight;
        
        // 缩放相关
        this.currentScale = 1;
        this.scaledWidth = this.baseWidth;
        this.scaledHeight = this.baseHeight;
        
        // 设备信息
        this.isMobile = this.detectMobile();
        this.isLandscape = window.innerWidth > window.innerHeight;
        this.devicePixelRatio = window.devicePixelRatio || 1;
        
        // 方向锁定
        this.preferredOrientation = 'landscape';
        this.orientationLocked = false;
        
        // 上次尺寸记录，用于减少不必要的布局更新
        this.lastWidth = window.innerWidth;
        this.lastHeight = window.innerHeight;
        
        // 事件监听器
        this.resizeHandler = this.handleResize.bind(this);
        this.orientationHandler = this.handleOrientationChange.bind(this);
        
        this.initialize();
    }
    
    /**
     * 初始化响应式管理器
     */
    initialize() {
        // 设置初始布局
        this.updateLayout();
        
        // 绑定事件监听器
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('orientationchange', this.orientationHandler);
        
        // 移动端特殊处理
        if (this.isMobile) {
            this.setupMobileOptimizations();
        }
        
        // 尝试锁定方向
        this.lockOrientation();
        
        console.log('ResponsiveManager initialized', {
            isMobile: this.isMobile,
            isLandscape: this.isLandscape,
            devicePixelRatio: this.devicePixelRatio
        });
    }
    
    /**
     * 检测是否为移动设备
     */
    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // 检测移动设备
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        const isMobileUA = mobileRegex.test(userAgent);
        
        // 检测触摸支持
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // 检测屏幕尺寸
        const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;
        
        return isMobileUA || (hasTouchSupport && isSmallScreen);
    }
    
    /**
     * 更新布局
     */
    updateLayout() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 计算可用空间 (留出边距)
        const availableWidth = viewportWidth * 0.95;
        const availableHeight = viewportHeight * 0.9;
        
        // 计算最佳尺寸
        let targetWidth, targetHeight;
        
        if (this.isMobile && !this.isLandscape) {
            // 移动端竖屏模式：调整为竖屏比例
            const mobileAspectRatio = 3 / 4; // 3:4 竖屏比例
            
            if (availableWidth / availableHeight > mobileAspectRatio) {
                targetHeight = availableHeight;
                targetWidth = targetHeight * mobileAspectRatio;
            } else {
                targetWidth = availableWidth;
                targetHeight = targetWidth / mobileAspectRatio;
            }
        } else {
            // 桌面端或移动端横屏：保持4:3比例
            if (availableWidth / availableHeight > this.aspectRatio) {
                targetHeight = availableHeight;
                targetWidth = targetHeight * this.aspectRatio;
            } else {
                targetWidth = availableWidth;
                targetHeight = targetWidth / this.aspectRatio;
            }
        }
        
        // 限制最小尺寸
        const minWidth = this.isMobile ? 320 : 400;
        const minHeight = minWidth / this.aspectRatio;
        
        targetWidth = Math.max(targetWidth, minWidth);
        targetHeight = Math.max(targetHeight, minHeight);
        
        // 限制最大尺寸
        const maxWidth = this.isMobile ? 800 : 1200;
        const maxHeight = maxWidth / this.aspectRatio;
        
        targetWidth = Math.min(targetWidth, maxWidth);
        targetHeight = Math.min(targetHeight, maxHeight);
        
        // 应用尺寸
        this.applyCanvasSize(targetWidth, targetHeight);
        
        // 更新缩放信息
        this.currentScale = targetWidth / this.baseWidth;
        this.scaledWidth = targetWidth;
        this.scaledHeight = targetHeight;
        
        console.log('Layout updated', {
            targetWidth,
            targetHeight,
            scale: this.currentScale,
            viewport: { width: viewportWidth, height: viewportHeight }
        });
    }
    
    /**
     * 应用Canvas尺寸
     */
    applyCanvasSize(width, height) {
        // 设置Canvas实际尺寸
        this.canvas.width = width * this.devicePixelRatio;
        this.canvas.height = height * this.devicePixelRatio;
        
        // 设置Canvas显示尺寸
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // 调整Canvas上下文缩放以适应高DPI屏幕
        const ctx = this.canvas.getContext('2d');
        ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
        
        // 居中显示
        this.centerCanvas();
    }
    
    /**
     * 居中Canvas
     */
    centerCanvas() {
        this.canvas.style.position = 'relative';
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
    }
    
    /**
     * 处理窗口大小变化
     */
    handleResize() {
        // 防抖处理 - 增加时间到200ms，减少抖动
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            // 仅在尺寸变化明显时更新布局
            const currentWidth = window.innerWidth;
            const currentHeight = window.innerHeight;
            
            if (Math.abs(currentWidth - this.lastWidth) > 50 || Math.abs(currentHeight - this.lastHeight) > 50) {
                this.updateLayout();
                this.lastWidth = currentWidth;
                this.lastHeight = currentHeight;
            }
        }, 200);
    }
    
    /**
     * 处理设备方向变化
     */
    handleOrientationChange() {
        // 延迟处理，等待方向变化完成
        setTimeout(() => {
            this.isLandscape = window.innerWidth > window.innerHeight;
            this.updateLayout();
            
            // 重新尝试锁定方向
            if (this.orientationLocked) {
                this.lockOrientation();
            }
        }, 500);
    }
    
    /**
     * 锁定设备方向
     */
    lockOrientation() {
        if (!this.isMobile) return;
        
        try {
            // 尝试使用Screen Orientation API
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock(this.preferredOrientation)
                    .then(() => {
                        this.orientationLocked = true;
                        console.log('Orientation locked to', this.preferredOrientation);
                    })
                    .catch(err => {
                        console.warn('Failed to lock orientation:', err);
                        this.showOrientationHint();
                    });
            } else {
                // 降级方案：显示方向提示
                this.showOrientationHint();
            }
        } catch (error) {
            console.warn('Orientation lock not supported:', error);
            this.showOrientationHint();
        }
    }
    
    /**
     * 显示方向提示
     */
    showOrientationHint() {
        if (!this.isMobile || this.isLandscape) return;
        
        // 创建方向提示覆盖层
        if (!this.orientationHint) {
            this.orientationHint = document.createElement('div');
            this.orientationHint.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                font-family: Arial, sans-serif;
            `;
            
            this.orientationHint.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 20px;">📱</div>
                <div style="font-size: 18px; text-align: center; margin-bottom: 10px;">
                    请将设备横屏
                </div>
                <div style="font-size: 14px; color: #ccc; text-align: center;">
                    为了获得最佳游戏体验
                </div>
            `;
            
            document.body.appendChild(this.orientationHint);
        }
        
        // 显示或隐藏提示
        this.orientationHint.style.display = this.isLandscape ? 'none' : 'flex';
    }
    
    /**
     * 设置移动端优化
     */
    setupMobileOptimizations() {
        // 禁用双击缩放
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
        
        // 禁用上下文菜单
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // 禁用选择
        this.canvas.style.userSelect = 'none';
        this.canvas.style.webkitUserSelect = 'none';
        this.canvas.style.webkitTouchCallout = 'none';
        
        // 优化触摸延迟
        this.canvas.style.touchAction = 'manipulation';
    }
    
    /**
     * 获取缩放后的坐标
     */
    getScaledCoordinates(x, y) {
        return {
            x: x * this.currentScale,
            y: y * this.currentScale
        };
    }
    
    /**
     * 获取原始坐标
     */
    getOriginalCoordinates(x, y) {
        return {
            x: x / this.currentScale,
            y: y / this.currentScale
        };
    }
    
    /**
     * 获取当前缩放比例
     */
    getScale() {
        return this.currentScale;
    }
    
    /**
     * 获取缩放后的尺寸
     */
    getScaledSize() {
        return {
            width: this.scaledWidth,
            height: this.scaledHeight
        };
    }
    
    /**
     * 检查是否为移动设备
     */
    isMobileDevice() {
        return this.isMobile;
    }
    
    /**
     * 检查是否为横屏
     */
    isLandscapeMode() {
        return this.isLandscape;
    }
    
    /**
     * 销毁响应式管理器
     */
    destroy() {
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('orientationchange', this.orientationHandler);
        
        if (this.orientationHint && this.orientationHint.parentNode) {
            this.orientationHint.parentNode.removeChild(this.orientationHint);
        }
        
        clearTimeout(this.resizeTimeout);
        
        console.log('ResponsiveManager destroyed');
    }
}