/**
 * PixelArtRenderer 单元测试
 * 验证像素艺术渲染器的正确功能
 */

// 模拟 Canvas 和 Context
const mockCanvas = {
    width: 800,
    height: 600,
    getContext: jest.fn(() => mockContext)
};

const mockContext = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    fillText: jest.fn(),
    createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()
    })),
    set fillStyle(value) { this._fillStyle = value; },
    get fillStyle() { return this._fillStyle; },
    set strokeStyle(value) { this._strokeStyle = value; },
    get strokeStyle() { return this._strokeStyle; },
    set globalAlpha(value) { this._globalAlpha = value; },
    get globalAlpha() { return this._globalAlpha; },
    set font(value) { this._font = value; },
    get font() { return this._font; },
    set textAlign(value) { this._textAlign = value; },
    get textAlign() { return this._textAlign; },
    set textBaseline(value) { this._textBaseline = value; },
    get textBaseline() { return this._textBaseline; },
    set lineWidth(value) { this._lineWidth = value; },
    get lineWidth() { return this._lineWidth; },
    set imageSmoothingEnabled(value) { this._imageSmoothingEnabled = value; },
    get imageSmoothingEnabled() { return this._imageSmoothingEnabled; }
};

// 模拟 PixelArtRenderer 类
const PixelArtRenderer = require('../../src/graphics/PixelArtRenderer.js');

describe('PixelArtRenderer', () => {
    let pixelRenderer;
    
    beforeEach(() => {
        jest.clearAllMocks();
        pixelRenderer = new PixelArtRenderer(mockCanvas);
    });
    
    describe('Initialization', () => {
        test('should initialize with canvas and disable image smoothing', () => {
            expect(pixelRenderer.canvas).toBe(mockCanvas);
            expect(pixelRenderer.ctx).toBe(mockContext);
            expect(pixelRenderer.pixelSize).toBe(3);
            expect(mockContext.imageSmoothingEnabled).toBe(false);
        });
        
        test('should have character sprites for all life stages', () => {
            const expectedStages = ['baby', 'child', 'teen', 'adult', 'elder'];
            
            expectedStages.forEach(stage => {
                expect(pixelRenderer.characterSprites[stage]).toBeDefined();
                expect(pixelRenderer.characterSprites[stage].idle).toBeDefined();
                expect(Array.isArray(pixelRenderer.characterSprites[stage].idle)).toBe(true);
            });
        });
        
        test('should have scene elements for all life stages', () => {
            const expectedStages = ['baby', 'child', 'teen', 'adult', 'elder'];
            
            expectedStages.forEach(stage => {
                expect(pixelRenderer.sceneElements[stage]).toBeDefined();
                expect(typeof pixelRenderer.sceneElements[stage]).toBe('object');
            });
        });
    });
    
    describe('Character Rendering', () => {
        test('should render character sprites', () => {
            pixelRenderer.renderCharacter('baby', 'idle', 0, 100, 100, 1);
            
            expect(mockContext.fillRect).toHaveBeenCalled();
            expect(mockContext.fillStyle).toBeDefined();
        });
        
        test('should handle different animation states', () => {
            const stages = ['baby', 'child', 'teen', 'adult', 'elder'];
            
            stages.forEach(stageId => {
                const character = pixelRenderer.characterSprites[stageId];
                Object.keys(character).forEach(animation => {
                    pixelRenderer.renderCharacter(stageId, animation, 0, 100, 100, 1);
                    expect(mockContext.fillRect).toHaveBeenCalled();
                });
            });
        });
        
        test('should handle invalid stage gracefully', () => {
            expect(() => {
                pixelRenderer.renderCharacter('invalid', 'idle', 0, 100, 100, 1);
            }).not.toThrow();
        });
        
        test('should handle invalid animation gracefully', () => {
            expect(() => {
                pixelRenderer.renderCharacter('baby', 'invalid', 0, 100, 100, 1);
            }).not.toThrow();
        });
        
        test('should apply scaling to character rendering', () => {
            const scale = 2;
            pixelRenderer.renderCharacter('baby', 'idle', 0, 100, 100, scale);
            
            // 验证像素大小被缩放
            expect(mockContext.fillRect).toHaveBeenCalled();
        });
    });
    
    describe('Scene Element Rendering', () => {
        test('should render scene elements', () => {
            pixelRenderer.renderSceneElement('baby', 'crib', 100, 100, 1);
            
            expect(mockContext.fillRect).toHaveBeenCalled();
        });
        
        test('should handle different scene elements for each stage', () => {
            const stageElements = {
                'baby': ['crib', 'toys'],
                'child': ['playground', 'school'],
                'teen': ['classroom', 'heart'],
                'adult': ['office', 'house'],
                'elder': ['garden', 'rocking_chair']
            };
            
            Object.keys(stageElements).forEach(stageId => {
                stageElements[stageId].forEach(elementType => {
                    pixelRenderer.renderSceneElement(stageId, elementType, 100, 100, 1);
                    expect(mockContext.fillRect).toHaveBeenCalled();
                });
            });
        });
        
        test('should handle invalid scene elements gracefully', () => {
            expect(() => {
                pixelRenderer.renderSceneElement('baby', 'invalid', 100, 100, 1);
            }).not.toThrow();
        });
    });
    
    describe('Pixel Sprite Rendering', () => {
        test('should render pixel sprites correctly', () => {
            const testSprite = [
                '●●●',
                '●○●',
                '●●●'
            ];
            
            pixelRenderer.renderPixelSprite(testSprite, 100, 100, 1, '#ff0000');
            
            expect(mockContext.fillRect).toHaveBeenCalled();
            expect(mockContext.fillStyle).toBe('#ff0000');
        });
        
        test('should skip empty pixels', () => {
            const testSprite = [
                '● ●',
                ' ● ',
                '● ●'
            ];
            
            const fillRectCallsBefore = mockContext.fillRect.mock.calls.length;
            pixelRenderer.renderPixelSprite(testSprite, 100, 100, 1, '#ff0000');
            const fillRectCallsAfter = mockContext.fillRect.mock.calls.length;
            
            // 应该只渲染5个非空像素 (4个角落 + 1个中心)
            expect(fillRectCallsAfter - fillRectCallsBefore).toBe(5);
        });
        
        test('should apply scaling to pixel sprites', () => {
            const testSprite = ['●'];
            const scale = 2;
            
            pixelRenderer.renderPixelSprite(testSprite, 100, 100, scale, '#ff0000');
            
            expect(mockContext.fillRect).toHaveBeenCalled();
            
            // 验证像素大小被缩放
            const lastCall = mockContext.fillRect.mock.calls[mockContext.fillRect.mock.calls.length - 1];
            const pixelSize = lastCall[2]; // width parameter
            expect(pixelSize).toBe(pixelRenderer.pixelSize * scale);
        });
    });
    
    describe('Color Management', () => {
        test('should return correct pixel colors', () => {
            const colorTests = [
                { char: '●', expected: '#ffffff' },
                { char: '○', expected: '#ffffff' },
                { char: '█', expected: '#333333' },
                { char: '♠', expected: '#228B22' },
                { char: '♥', expected: '#ff69b4' }
            ];
            
            colorTests.forEach(({ char, expected }) => {
                const color = pixelRenderer.getPixelColor(char, '#ffffff');
                expect(color).toBe(expected);
            });
        });
        
        test('should use primary color for main character pixels', () => {
            const primaryColor = '#ff0000';
            const color = pixelRenderer.getPixelColor('●', primaryColor);
            expect(color).toBe(primaryColor);
        });
        
        test('should have stage colors for all stages', () => {
            const stages = ['baby', 'child', 'teen', 'adult', 'elder'];
            
            stages.forEach(stageId => {
                const color = pixelRenderer.getStageColor(stageId);
                expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
            });
        });
        
        test('should have element colors for all element types', () => {
            const elementTypes = ['crib', 'toys', 'playground', 'school', 'classroom', 
                                'heart', 'office', 'house', 'garden', 'rocking_chair'];
            
            elementTypes.forEach(elementType => {
                const color = pixelRenderer.getElementColor(elementType);
                expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
            });
        });
    });
    
    describe('Background Rendering', () => {
        test('should render background for all stages', () => {
            const stages = ['baby', 'child', 'teen', 'adult', 'elder'];
            
            stages.forEach(stageId => {
                pixelRenderer.renderBackground(stageId, 1);
                
                expect(mockContext.createLinearGradient).toHaveBeenCalled();
                expect(mockContext.fillRect).toHaveBeenCalled();
            });
        });
        
        test('should add pixel texture to background', () => {
            pixelRenderer.renderBackground('baby', 1);
            
            // 验证纹理被添加（多次fillRect调用）
            expect(mockContext.fillRect.mock.calls.length).toBeGreaterThan(1);
        });
        
        test('should handle default background for unknown stages', () => {
            expect(() => {
                pixelRenderer.renderBackground('unknown', 1);
            }).not.toThrow();
        });
    });
    
    describe('Event Icon Rendering', () => {
        test('should render event icons', () => {
            const mockEvent = {
                icon: '😊',
                color: '#ff0000'
            };
            
            pixelRenderer.renderEventIcon(mockEvent, 100, 100, 1);
            
            expect(mockContext.fillRect).toHaveBeenCalled();
            expect(mockContext.fillText).toHaveBeenCalledWith('😊', 100, 100);
        });
        
        test('should handle events without icons', () => {
            const mockEvent = {
                color: '#ff0000'
            };
            
            expect(() => {
                pixelRenderer.renderEventIcon(mockEvent, 100, 100, 1);
            }).not.toThrow();
        });
        
        test('should apply scaling to event icons', () => {
            const mockEvent = {
                icon: '😊',
                color: '#ff0000'
            };
            
            const scale = 2;
            pixelRenderer.renderEventIcon(mockEvent, 100, 100, scale);
            
            expect(mockContext.fillText).toHaveBeenCalled();
        });
    });
    
    describe('Pixel Drawing Functions', () => {
        test('should draw pixel circles', () => {
            pixelRenderer.drawPixelCircle(100, 100, 25, '#ff0000', 1);
            
            expect(mockContext.fillRect).toHaveBeenCalled();
            expect(mockContext.fillStyle).toBe('#ff0000');
        });
        
        test('should draw pixel borders', () => {
            pixelRenderer.drawPixelBorder(50, 50, 100, 80, '#000000', 1);
            
            expect(mockContext.fillRect).toHaveBeenCalled();
            expect(mockContext.fillStyle).toBe('#000000');
        });
        
        test('should render pixel progress bars', () => {
            pixelRenderer.renderPixelProgressBar(10, 10, 200, 20, 0.5, 1);
            
            expect(mockContext.fillRect).toHaveBeenCalled();
        });
        
        test('should render pixel text', () => {
            pixelRenderer.renderPixelText('Test', 100, 100, 16, '#ffffff', 1);
            
            expect(mockContext.fillText).toHaveBeenCalledWith('Test', 100, 100);
            expect(mockContext.fillText).toHaveBeenCalledWith('Test', 101, 101); // 阴影
        });
    });
    
    describe('Utility Functions', () => {
        test('should get sprite size correctly', () => {
            const testSprite = [
                '●●●●●',
                '●●●●●',
                '●●●●●'
            ];
            
            const size = pixelRenderer.getSpriteSize(testSprite);
            
            expect(size.width).toBe(5 * pixelRenderer.pixelSize);
            expect(size.height).toBe(3 * pixelRenderer.pixelSize);
        });
        
        test('should handle empty sprites', () => {
            const size = pixelRenderer.getSpriteSize([]);
            
            expect(size.width).toBe(0);
            expect(size.height).toBe(0);
        });
        
        test('should handle null sprites', () => {
            const size = pixelRenderer.getSpriteSize(null);
            
            expect(size.width).toBe(0);
            expect(size.height).toBe(0);
        });
        
        test('should reset properly', () => {
            pixelRenderer.reset();
            
            expect(mockContext.imageSmoothingEnabled).toBe(false);
        });
    });
    
    describe('Sprite Data Validation', () => {
        test('should have valid character sprite data', () => {
            Object.keys(pixelRenderer.characterSprites).forEach(stageId => {
                const character = pixelRenderer.characterSprites[stageId];
                
                Object.keys(character).forEach(animationName => {
                    const animation = character[animationName];
                    
                    expect(Array.isArray(animation)).toBe(true);
                    expect(animation.length).toBeGreaterThan(0);
                    
                    animation.forEach(frame => {
                        expect(Array.isArray(frame)).toBe(true);
                        expect(frame.length).toBeGreaterThan(0);
                        
                        frame.forEach(row => {
                            expect(typeof row).toBe('string');
                        });
                    });
                });
            });
        });
        
        test('should have valid scene element data', () => {
            Object.keys(pixelRenderer.sceneElements).forEach(stageId => {
                const elements = pixelRenderer.sceneElements[stageId];
                
                Object.keys(elements).forEach(elementName => {
                    const element = elements[elementName];
                    
                    expect(Array.isArray(element)).toBe(true);
                    expect(element.length).toBeGreaterThan(0);
                    
                    element.forEach(row => {
                        expect(typeof row).toBe('string');
                    });
                });
            });
        });
        
        test('should have consistent sprite dimensions within frames', () => {
            Object.keys(pixelRenderer.characterSprites).forEach(stageId => {
                const character = pixelRenderer.characterSprites[stageId];
                
                Object.keys(character).forEach(animationName => {
                    const animation = character[animationName];
                    
                    animation.forEach(frame => {
                        if (frame.length > 1) {
                            const firstRowLength = frame[0].length;
                            frame.forEach(row => {
                                expect(row.length).toBe(firstRowLength);
                            });
                        }
                    });
                });
            });
        });
    });
    
    describe('Performance', () => {
        test('should handle large sprites efficiently', () => {
            const largeSprite = [];
            for (let i = 0; i < 50; i++) {
                largeSprite.push('●'.repeat(50));
            }
            
            const startTime = Date.now();
            pixelRenderer.renderPixelSprite(largeSprite, 100, 100, 1, '#ff0000');
            const endTime = Date.now();
            
            const duration = endTime - startTime;
            expect(duration).toBeLessThan(100); // 应该在100ms内完成
        });
        
        test('should handle multiple character renders efficiently', () => {
            const startTime = Date.now();
            
            for (let i = 0; i < 10; i++) {
                pixelRenderer.renderCharacter('baby', 'idle', 0, i * 50, 100, 1);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(50); // 应该在50ms内完成
        });
    });
});