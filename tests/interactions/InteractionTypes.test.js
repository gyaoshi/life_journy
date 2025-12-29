/**
 * InteractionTypes 单元测试
 * 验证交互类型系统的正确功能
 */

// 模拟 InteractionTypes 类
const InteractionTypes = require('../../src/interactions/InteractionTypes.js');

describe('InteractionTypes', () => {
    let interactionTypes;
    
    beforeEach(() => {
        interactionTypes = new InteractionTypes();
    });
    
    describe('Initialization', () => {
        test('should initialize with interaction definitions', () => {
            expect(interactionTypes.interactionDefinitions).toBeDefined();
            expect(typeof interactionTypes.interactionDefinitions).toBe('object');
        });
        
        test('should have all expected interaction types', () => {
            const expectedTypes = [
                'simple_click', 'rapid_click', 'drag_target', 'moving_object',
                'long_press', 'swipe_gesture', 'double_click', 'sequence_click',
                'draw_circle', 'rhythm_click', 'multi_touch'
            ];
            
            expectedTypes.forEach(type => {
                expect(interactionTypes.interactionDefinitions[type]).toBeDefined();
            });
        });
        
        test('should have valid structure for each interaction type', () => {
            Object.keys(interactionTypes.interactionDefinitions).forEach(type => {
                const definition = interactionTypes.interactionDefinitions[type];
                
                expect(definition.name).toBeDefined();
                expect(typeof definition.name).toBe('string');
                
                expect(definition.description).toBeDefined();
                expect(typeof definition.description).toBe('string');
                
                expect(definition.difficulty).toBeDefined();
                expect(typeof definition.difficulty).toBe('number');
                expect(definition.difficulty).toBeGreaterThanOrEqual(1);
                expect(definition.difficulty).toBeLessThanOrEqual(5);
                
                expect(definition.instructions).toBeDefined();
                expect(typeof definition.instructions).toBe('string');
                
                expect(definition.validate).toBeDefined();
                expect(typeof definition.validate).toBe('function');
                
                expect(definition.progress).toBeDefined();
                expect(typeof definition.progress).toBe('function');
            });
        });
    });
    
    describe('getInteractionType', () => {
        test('should return correct interaction type definition', () => {
            const simpleClick = interactionTypes.getInteractionType('simple_click');
            
            expect(simpleClick).toBeDefined();
            expect(simpleClick.name).toBe('简单点击');
            expect(simpleClick.difficulty).toBe(1);
        });
        
        test('should return undefined for non-existent types', () => {
            const result = interactionTypes.getInteractionType('non_existent');
            expect(result).toBeUndefined();
        });
    });
    
    describe('Interaction Validation', () => {
        test('should validate simple click interactions', () => {
            const mockEvent = {
                type: 'simple_click',
                target: { requiredClicks: 1 },
                clickCount: 0,
                isPointInside: jest.fn(() => true)
            };
            
            const input = { type: 'click', x: 100, y: 100 };
            
            const result = interactionTypes.validateInteraction(mockEvent, input);
            expect(result).toBe(true);
            expect(mockEvent.isPointInside).toHaveBeenCalledWith(100, 100);
        });
        
        test('should validate rapid click interactions', () => {
            const mockEvent = {
                type: 'rapid_click',
                target: { requiredClicks: 3 },
                clickCount: 2,
                isPointInside: jest.fn(() => true)
            };
            
            const input = { type: 'click', x: 100, y: 100 };
            
            const result = interactionTypes.validateInteraction(mockEvent, input);
            expect(result).toBe(true);
            expect(mockEvent.clickCount).toBe(3);
        });
        
        test('should validate drag target interactions', () => {
            const mockEvent = {
                type: 'drag_target',
                target: { dragDistance: 100 },
                dragDistance: 0
            };
            
            const input = { type: 'drag', deltaX: 80, deltaY: 60 }; // distance = 100
            
            const result = interactionTypes.validateInteraction(mockEvent, input);
            expect(result).toBe(true);
            expect(mockEvent.dragDistance).toBe(100);
        });
        
        test('should validate moving object interactions', () => {
            const mockEvent = {
                type: 'moving_object',
                isPointInside: jest.fn(() => true)
            };
            
            const input = { type: 'click', x: 100, y: 100 };
            
            const result = interactionTypes.validateInteraction(mockEvent, input);
            expect(result).toBe(true);
        });
        
        test('should validate long press interactions', () => {
            const mockEvent = {
                type: 'long_press',
                target: { requiredDuration: 1000 },
                isPointInside: jest.fn(() => true),
                pressStartTime: Date.now() - 1500,
                isPressing: true
            };
            
            const input = { type: 'press_end' };
            
            const result = interactionTypes.validateInteraction(mockEvent, input);
            expect(result).toBe(true);
        });
        
        test('should validate swipe gesture interactions', () => {
            const mockEvent = {
                type: 'swipe_gesture',
                target: { direction: 'right' }
            };
            
            const input = { type: 'swipe', deltaX: 100, deltaY: 0 };
            
            const result = interactionTypes.validateInteraction(mockEvent, input);
            expect(result).toBe(true);
        });
        
        test('should validate double click interactions', () => {
            const mockEvent = {
                type: 'double_click',
                isPointInside: jest.fn(() => true),
                lastClickTime: Date.now() - 200
            };
            
            const input = { type: 'click', x: 100, y: 100 };
            
            const result = interactionTypes.validateInteraction(mockEvent, input);
            expect(result).toBe(true);
        });
    });
    
    describe('Interaction Progress', () => {
        test('should calculate progress for simple click', () => {
            const mockEvent = {
                type: 'simple_click',
                target: { requiredClicks: 1 },
                clickCount: 1
            };
            
            const progress = interactionTypes.getInteractionProgress(mockEvent);
            expect(progress).toBe(1);
        });
        
        test('should calculate progress for rapid click', () => {
            const mockEvent = {
                type: 'rapid_click',
                target: { requiredClicks: 5 },
                clickCount: 3
            };
            
            const progress = interactionTypes.getInteractionProgress(mockEvent);
            expect(progress).toBe(0.6);
        });
        
        test('should calculate progress for drag target', () => {
            const mockEvent = {
                type: 'drag_target',
                target: { dragDistance: 100 },
                dragDistance: 50
            };
            
            const progress = interactionTypes.getInteractionProgress(mockEvent);
            expect(progress).toBe(0.5);
        });
        
        test('should calculate progress for long press', () => {
            const mockEvent = {
                type: 'long_press',
                target: { requiredDuration: 1000 },
                isPressing: true,
                pressStartTime: Date.now() - 500
            };
            
            const progress = interactionTypes.getInteractionProgress(mockEvent);
            expect(progress).toBeCloseTo(0.5, 1);
        });
        
        test('should return 0 progress for unknown types', () => {
            const mockEvent = {
                type: 'unknown_type'
            };
            
            const progress = interactionTypes.getInteractionProgress(mockEvent);
            expect(progress).toBe(0);
        });
    });
    
    describe('getInteractionInstructions', () => {
        test('should return correct instructions for each type', () => {
            const types = ['simple_click', 'rapid_click', 'drag_target', 'moving_object'];
            
            types.forEach(type => {
                const mockEvent = { type };
                const instructions = interactionTypes.getInteractionInstructions(mockEvent);
                
                expect(instructions).toBeDefined();
                expect(typeof instructions).toBe('string');
                expect(instructions.length).toBeGreaterThan(0);
            });
        });
        
        test('should return default instructions for unknown types', () => {
            const mockEvent = { type: 'unknown' };
            const instructions = interactionTypes.getInteractionInstructions(mockEvent);
            
            expect(instructions).toBe('完成任务');
        });
    });
    
    describe('getSwipeDirection', () => {
        test('should detect right swipe', () => {
            const angle = 0; // 0 degrees = right
            const direction = interactionTypes.getSwipeDirection(angle);
            expect(direction).toBe('right');
        });
        
        test('should detect down swipe', () => {
            const angle = Math.PI / 2; // 90 degrees = down
            const direction = interactionTypes.getSwipeDirection(angle);
            expect(direction).toBe('down');
        });
        
        test('should detect left swipe', () => {
            const angle = Math.PI; // 180 degrees = left
            const direction = interactionTypes.getSwipeDirection(angle);
            expect(direction).toBe('left');
        });
        
        test('should detect up swipe', () => {
            const angle = -Math.PI / 2; // -90 degrees = up
            const direction = interactionTypes.getSwipeDirection(angle);
            expect(direction).toBe('up');
        });
    });
    
    describe('isCircularPath', () => {
        test('should detect circular paths', () => {
            // 创建一个圆形路径
            const circularPath = [];
            const centerX = 100;
            const centerY = 100;
            const radius = 50;
            
            for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 2;
                circularPath.push({
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius
                });
            }
            
            const result = interactionTypes.isCircularPath(circularPath);
            expect(result).toBe(true);
        });
        
        test('should reject non-circular paths', () => {
            const linearPath = [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 20, y: 0 },
                { x: 30, y: 0 },
                { x: 40, y: 0 }
            ];
            
            const result = interactionTypes.isCircularPath(linearPath);
            expect(result).toBe(false);
        });
        
        test('should reject paths that are too short', () => {
            const shortPath = [
                { x: 0, y: 0 },
                { x: 10, y: 10 }
            ];
            
            const result = interactionTypes.isCircularPath(shortPath);
            expect(result).toBe(false);
        });
    });
    
    describe('createInteractionTarget', () => {
        test('should create simple click targets', () => {
            const target = interactionTypes.createInteractionTarget('simple_click', {
                requiredClicks: 2
            });
            
            expect(target.type).toBe('simple_click');
            expect(target.requiredClicks).toBe(2);
            expect(target.size).toBeDefined();
        });
        
        test('should create rapid click targets', () => {
            const target = interactionTypes.createInteractionTarget('rapid_click', {
                requiredClicks: 7
            });
            
            expect(target.type).toBe('rapid_click');
            expect(target.requiredClicks).toBe(7);
        });
        
        test('should create drag targets', () => {
            const target = interactionTypes.createInteractionTarget('drag_target', {
                dragDistance: 150
            });
            
            expect(target.type).toBe('drag_target');
            expect(target.dragDistance).toBe(150);
        });
        
        test('should create moving object targets', () => {
            const target = interactionTypes.createInteractionTarget('moving_object', {
                speed: 200
            });
            
            expect(target.type).toBe('moving_object');
            expect(target.speed).toBe(200);
        });
        
        test('should use default values when options not provided', () => {
            const target = interactionTypes.createInteractionTarget('simple_click');
            
            expect(target.type).toBe('simple_click');
            expect(target.requiredClicks).toBe(1);
            expect(target.size).toBeDefined();
        });
    });
    
    describe('getStageAppropriateInteractions', () => {
        test('should return appropriate interactions for each stage', () => {
            const stages = ['baby', 'child', 'teen', 'adult', 'elder'];
            
            stages.forEach(stageId => {
                const interactions = interactionTypes.getStageAppropriateInteractions(stageId);
                
                expect(Array.isArray(interactions)).toBe(true);
                expect(interactions.length).toBeGreaterThan(0);
                
                interactions.forEach(interactionType => {
                    expect(interactionTypes.interactionDefinitions[interactionType]).toBeDefined();
                });
            });
        });
        
        test('should return simple interactions for baby stage', () => {
            const babyInteractions = interactionTypes.getStageAppropriateInteractions('baby');
            
            expect(babyInteractions).toContain('simple_click');
            expect(babyInteractions).toContain('long_press');
        });
        
        test('should return complex interactions for adult stage', () => {
            const adultInteractions = interactionTypes.getStageAppropriateInteractions('adult');
            
            expect(adultInteractions).toContain('moving_object');
            expect(adultInteractions).toContain('rhythm_click');
            expect(adultInteractions).toContain('multi_touch');
        });
        
        test('should return default interactions for unknown stages', () => {
            const unknownInteractions = interactionTypes.getStageAppropriateInteractions('unknown');
            
            expect(unknownInteractions).toEqual(['simple_click']);
        });
    });
    
    describe('adjustInteractionForDifficulty', () => {
        test('should adjust rapid click for difficulty', () => {
            const baseConfig = {
                type: 'rapid_click',
                requiredClicks: 3
            };
            
            const adjustedConfig = interactionTypes.adjustInteractionForDifficulty(baseConfig, 4);
            
            expect(adjustedConfig.requiredClicks).toBeGreaterThan(3);
        });
        
        test('should adjust moving object for difficulty', () => {
            const baseConfig = {
                type: 'moving_object',
                speed: 100,
                size: { width: 60, height: 60 }
            };
            
            const adjustedConfig = interactionTypes.adjustInteractionForDifficulty(baseConfig, 4);
            
            expect(adjustedConfig.speed).toBeGreaterThan(100);
            expect(adjustedConfig.size.width).toBeLessThan(60);
            expect(adjustedConfig.size.height).toBeLessThan(60);
        });
        
        test('should adjust drag target for difficulty', () => {
            const baseConfig = {
                type: 'drag_target',
                dragDistance: 100
            };
            
            const adjustedConfig = interactionTypes.adjustInteractionForDifficulty(baseConfig, 3);
            
            expect(adjustedConfig.dragDistance).toBeGreaterThan(100);
        });
        
        test('should not modify unknown interaction types', () => {
            const baseConfig = {
                type: 'unknown_type',
                someProperty: 'value'
            };
            
            const adjustedConfig = interactionTypes.adjustInteractionForDifficulty(baseConfig, 5);
            
            expect(adjustedConfig).toEqual(baseConfig);
        });
    });
    
    describe('Utility Functions', () => {
        test('should return all interaction types', () => {
            const allTypes = interactionTypes.getAllInteractionTypes();
            
            expect(Array.isArray(allTypes)).toBe(true);
            expect(allTypes.length).toBeGreaterThan(0);
            
            allTypes.forEach(type => {
                expect(interactionTypes.interactionDefinitions[type]).toBeDefined();
            });
        });
        
        test('should return interaction statistics', () => {
            const stats = interactionTypes.getInteractionStats();
            
            expect(stats.totalTypes).toBeGreaterThan(0);
            expect(stats.difficultyDistribution).toBeDefined();
            expect(stats.averageDifficulty).toBeGreaterThan(0);
            
            // 验证难度分布
            Object.keys(stats.difficultyDistribution).forEach(difficulty => {
                expect(parseInt(difficulty)).toBeGreaterThanOrEqual(1);
                expect(parseInt(difficulty)).toBeLessThanOrEqual(5);
                expect(stats.difficultyDistribution[difficulty]).toBeGreaterThan(0);
            });
        });
        
        test('should generate random sequences', () => {
            const sequence = interactionTypes.generateRandomSequence(5);
            
            expect(Array.isArray(sequence)).toBe(true);
            expect(sequence.length).toBe(5);
            
            sequence.forEach(point => {
                expect(point.x).toBeDefined();
                expect(point.y).toBeDefined();
                expect(point.radius).toBeDefined();
                expect(typeof point.x).toBe('number');
                expect(typeof point.y).toBe('number');
                expect(typeof point.radius).toBe('number');
            });
        });
        
        test('should generate random touch points', () => {
            const touchPoints = interactionTypes.generateRandomTouchPoints(3);
            
            expect(Array.isArray(touchPoints)).toBe(true);
            expect(touchPoints.length).toBe(3);
            
            touchPoints.forEach(point => {
                expect(point.x).toBeDefined();
                expect(point.y).toBeDefined();
                expect(point.radius).toBeDefined();
                expect(typeof point.x).toBe('number');
                expect(typeof point.y).toBe('number');
                expect(typeof point.radius).toBe('number');
            });
        });
    });
    
    describe('Edge Cases', () => {
        test('should handle null event in validation', () => {
            const result = interactionTypes.validateInteraction(null, { type: 'click' });
            expect(result).toBe(false);
        });
        
        test('should handle null input in validation', () => {
            const mockEvent = { type: 'simple_click' };
            const result = interactionTypes.validateInteraction(mockEvent, null);
            expect(result).toBe(false);
        });
        
        test('should handle events with missing properties', () => {
            const mockEvent = { type: 'rapid_click' }; // 缺少 target 属性
            const input = { type: 'click', x: 100, y: 100 };
            
            expect(() => {
                interactionTypes.validateInteraction(mockEvent, input);
            }).not.toThrow();
        });
        
        test('should handle zero difficulty adjustment', () => {
            const baseConfig = {
                type: 'rapid_click',
                requiredClicks: 3
            };
            
            const adjustedConfig = interactionTypes.adjustInteractionForDifficulty(baseConfig, 0);
            
            // 应该处理边界情况而不崩溃
            expect(adjustedConfig).toBeDefined();
        });
    });
});