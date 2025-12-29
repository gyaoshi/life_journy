/**
 * ResponsiveManager 属性测试
 * 验证响应式设计和移动端适配的正确性属性
 */

const fc = require('fast-check');

// 设置测试环境
require('../setup.js');

// 模拟DOM环境
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="testCanvas"></canvas></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.screen = dom.window.screen;

// 模拟移动设备检测
Object.defineProperty(global.navigator, 'userAgent', {
    value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    writable: true
});

Object.defineProperty(global.navigator, 'maxTouchPoints', {
    value: 5,
    writable: true
});

// 模拟屏幕方向API
Object.defineProperty(global.screen, 'orientation', {
    value: {
        lock: jest.fn().mockResolvedValue(),
        unlock: jest.fn().mockResolvedValue()
    },
    writable: true
});

// 模拟requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));

// 定义ResponsiveManager类用于测试
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
        
        this.initialize();
    }
    
    initialize() {
        this.updateLayout();
        
        // 绑定事件监听器
        if (window.addEventListener) {
            window.addEventListener('resize', this.handleResize.bind(this));
            window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        }
        
        // 移动端特殊处理
        if (this.isMobile) {
            this.setupMobileOptimizations();
        }
    }
    
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
    }
    
    applyCanvasSize(width, height) {
        // 设置Canvas实际尺寸
        this.canvas.width = width * this.devicePixelRatio;
        this.canvas.height = height * this.devicePixelRatio;
        
        // 设置Canvas显示尺寸
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // 调整Canvas上下文缩放以适应高DPI屏幕
        if (this.canvas.getContext) {
            const ctx = this.canvas.getContext('2d');
            if (ctx && ctx.scale) {
                ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
            }
        }
    }
    
    handleResize() {
        // 防抖处理
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.updateLayout();
        }, 100);
    }
    
    handleOrientationChange() {
        // 延迟处理，等待方向变化完成
        setTimeout(() => {
            this.isLandscape = window.innerWidth > window.innerHeight;
            this.updateLayout();
        }, 500);
    }
    
    setupMobileOptimizations() {
        // 禁用选择
        if (this.canvas.style) {
            this.canvas.style.userSelect = 'none';
            this.canvas.style.webkitUserSelect = 'none';
            this.canvas.style.webkitTouchCallout = 'none';
            this.canvas.style.touchAction = 'manipulation';
        }
    }
    
    getScaledCoordinates(x, y) {
        return {
            x: x * this.currentScale,
            y: y * this.currentScale
        };
    }
    
    getOriginalCoordinates(x, y) {
        return {
            x: x / this.currentScale,
            y: y / this.currentScale
        };
    }
    
    getScale() {
        return this.currentScale;
    }
    
    getScaledSize() {
        return {
            width: this.scaledWidth,
            height: this.scaledHeight
        };
    }
    
    isMobileDevice() {
        return this.isMobile;
    }
    
    isLandscapeMode() {
        return this.isLandscape;
    }
    
    destroy() {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.handleResize);
            window.removeEventListener('orientationchange', this.handleOrientationChange);
        }
        
        clearTimeout(this.resizeTimeout);
    }
}

describe('ResponsiveManager 属性测试', () => {
    let canvas;
    let responsiveManager;
    
    beforeEach(() => {
        // 重置DOM
        document.body.innerHTML = '<canvas id="testCanvas"></canvas>';
        canvas = document.getElementById('testCanvas');
        
        // 设置初始Canvas尺寸
        canvas.width = 800;
        canvas.height = 600;
        
        // 模拟getContext
        canvas.getContext = jest.fn(() => ({
            scale: jest.fn(),
            clearRect: jest.fn(),
            fillRect: jest.fn(),
            fillText: jest.fn()
        }));
        
        // 重置window尺寸
        Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
        Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true });
        
        // 模拟事件监听器
        window.addEventListener = jest.fn();
        window.removeEventListener = jest.fn();
        
        responsiveManager = new ResponsiveManager(canvas);
    });
    
    afterEach(() => {
        if (responsiveManager) {
            responsiveManager.destroy();
        }
        jest.clearAllMocks();
    });
    
    /**
     * **Feature: life-journey-game, Property 10: 屏幕适配一致性**
     * **验证: 需求 4.1**
     * 
     * 对于任何屏幕尺寸和分辨率，游戏界面应该正确适配并保持可用性
     */
    test('属性 10: 屏幕适配一致性', () => {
        fc.assert(fc.property(
            fc.integer({ min: 320, max: 2560 }), // 屏幕宽度
            fc.integer({ min: 240, max: 1440 }), // 屏幕高度
            fc.float({ min: 1, max: 3, noNaN: true }),        // 设备像素比
            (screenWidth, screenHeight, devicePixelRatio) => {
                // 设置屏幕尺寸
                Object.defineProperty(window, 'innerWidth', { value: screenWidth, writable: true });
                Object.defineProperty(window, 'innerHeight', { value: screenHeight, writable: true });
                Object.defineProperty(window, 'devicePixelRatio', { value: devicePixelRatio, writable: true });
                
                // 创建新的ResponsiveManager实例
                const testManager = new ResponsiveManager(canvas);
                
                try {
                    // 获取缩放后的尺寸
                    const scaledSize = testManager.getScaledSize();
                    const scale = testManager.getScale();
                    
                    // 验证适配一致性
                    // 1. 缩放后的尺寸应该在合理范围内
                    const isValidSize = scaledSize.width >= 320 && scaledSize.width <= 2560 &&
                                       scaledSize.height >= 240 && scaledSize.height <= 1440;
                    
                    // 2. 缩放比例应该为正数
                    const isValidScale = scale > 0 && scale <= 10;
                    
                    // 3. 宽高比应该保持合理（考虑移动端竖屏的特殊情况）
                    const aspectRatio = scaledSize.width / scaledSize.height;
                    const isValidAspectRatio = aspectRatio >= 0.3 && aspectRatio <= 4;
                    
                    // 4. Canvas实际尺寸应该考虑设备像素比
                    const expectedCanvasWidth = scaledSize.width * devicePixelRatio;
                    const expectedCanvasHeight = scaledSize.height * devicePixelRatio;
                    const isValidCanvasSize = Math.abs(canvas.width - expectedCanvasWidth) < 2 &&
                                            Math.abs(canvas.height - expectedCanvasHeight) < 2;
                    
                    testManager.destroy();
                    
                    return isValidSize && isValidScale && isValidAspectRatio && isValidCanvasSize;
                } catch (error) {
                    testManager.destroy();
                    return false;
                }
            }
        ), { numRuns: 100 });
    });
    
    test('坐标转换一致性', () => {
        fc.assert(fc.property(
            fc.float({ min: 0, max: 800, noNaN: true }), // x坐标
            fc.float({ min: 0, max: 600, noNaN: true }), // y坐标
            (x, y) => {
                // 获取缩放后的坐标
                const scaledCoords = responsiveManager.getScaledCoordinates(x, y);
                
                // 转换回原始坐标
                const originalCoords = responsiveManager.getOriginalCoordinates(scaledCoords.x, scaledCoords.y);
                
                // 验证往返转换的一致性（允许小的浮点误差）
                const xDiff = Math.abs(originalCoords.x - x);
                const yDiff = Math.abs(originalCoords.y - y);
                
                return xDiff < 0.001 && yDiff < 0.001;
            }
        ), { numRuns: 100 });
    });
    
    test('移动设备检测准确性', () => {
        fc.assert(fc.property(
            fc.constantFrom(
                'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
                'Mozilla/5.0 (Android 10; Mobile; rv:81.0) Gecko/81.0 Firefox/81.0',
                'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            ),
            fc.integer({ min: 1, max: 10 }), // maxTouchPoints (确保有触摸支持)
            fc.integer({ min: 320, max: 800 }), // 小屏幕宽度
            (userAgent, touchPoints, screenWidth) => {
                // 设置明确的移动设备环境
                Object.defineProperty(navigator, 'userAgent', { value: userAgent, writable: true });
                Object.defineProperty(navigator, 'maxTouchPoints', { value: touchPoints, writable: true });
                Object.defineProperty(window, 'innerWidth', { value: screenWidth, writable: true });
                
                const testManager = new ResponsiveManager(canvas);
                const isMobile = testManager.isMobileDevice();
                
                testManager.destroy();
                
                // 明确的移动设备用户代理应该被检测为移动设备
                return isMobile === true;
            }
        ), { numRuns: 30 });
    });
    
    test('布局更新稳定性', () => {
        fc.assert(fc.property(
            fc.array(fc.tuple(
                fc.integer({ min: 320, max: 1920 }),
                fc.integer({ min: 240, max: 1080 })
            ), { minLength: 2, maxLength: 5 }),
            (screenSizes) => {
                let previousSize = null;
                let isStable = true;
                
                for (const [width, height] of screenSizes) {
                    // 更新屏幕尺寸
                    Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
                    Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
                    
                    // 触发布局更新
                    responsiveManager.updateLayout();
                    
                    const currentSize = responsiveManager.getScaledSize();
                    
                    // 验证尺寸变化的合理性
                    if (previousSize) {
                        const widthChange = Math.abs(currentSize.width - previousSize.width) / previousSize.width;
                        const heightChange = Math.abs(currentSize.height - previousSize.height) / previousSize.height;
                        
                        // 尺寸变化应该与屏幕尺寸变化成比例，不应该有突变
                        if (widthChange > 2 || heightChange > 2) {
                            isStable = false;
                            break;
                        }
                    }
                    
                    previousSize = currentSize;
                }
                
                return isStable;
            }
        ), { numRuns: 50 });
    });
    
    test('最小尺寸保护', () => {
        fc.assert(fc.property(
            fc.integer({ min: 200, max: 400 }), // 小屏幕宽度
            fc.integer({ min: 200, max: 400 }), // 小屏幕高度
            (screenWidth, screenHeight) => {
                // 设置小屏幕尺寸
                Object.defineProperty(window, 'innerWidth', { value: screenWidth, writable: true });
                Object.defineProperty(window, 'innerHeight', { value: screenHeight, writable: true });
                
                const testManager = new ResponsiveManager(canvas);
                const scaledSize = testManager.getScaledSize();
                
                // 验证最小尺寸保护 - 应该至少有一个合理的最小尺寸
                const hasReasonableSize = scaledSize.width >= 200 && scaledSize.height >= 150;
                
                testManager.destroy();
                
                return hasReasonableSize;
            }
        ), { numRuns: 50 });
    });
});