# 设计文档

## 概述

人生旅程游戏是一个基于HTML5 Canvas的2D移动端游戏，采用组件化架构设计。游戏通过状态机管理不同的人生阶段，使用事件驱动的交互系统处理玩家输入，并通过评分系统提供反馈。整个系统设计为轻量级、高性能，适合在移动设备上运行。

## 架构

### 整体架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │   Game Logic    │    │   Data Layer    │
│     Layer       │    │     Layer       │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Canvas        │    │ • Game Engine   │    │ • Game State    │
│ • UI Components │◄──►│ • State Machine │◄──►│ • Score System  │
│ • Input Handler │    │ • Event System  │    │ • Life Events   │
│ • Audio Manager │    │ • Physics       │    │ • Player Data   │
│ • Animation Sys │    │ • Animation Eng │    │ • Animation Cfg │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 动画系统架构
```
┌─────────────────────────────────────────────────────────────┐
│                    Animation System                         │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Core Engine   │   Renderers     │      Effects            │
├─────────────────┼─────────────────┼─────────────────────────┤
│ • AnimationEng  │ • CharacterRend │ • ParticleSystem        │
│ • LifecycleMgr  │ • EffectRender  │ • LightEffects          │
│ • ModuleLoader  │ • SceneRender   │ • TransitionEffects     │
│ • TimerControl  │ • UIRenderer    │ • BirthEffects          │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### 核心模块
- **GameEngine**: 主游戏循环和渲染管理
- **StateManager**: 人生阶段状态机
- **EventSystem**: 人生事件和交互管理
- **InputHandler**: 触摸输入处理
- **AudioManager**: 音频播放控制
- **ScoreSystem**: 分数计算和评价
- **AnimationEngine**: 动画生命周期管理和模块加载
- **CharacterRenderer**: 角色形态渲染和转换
- **EffectRenderer**: 视觉特效渲染
- **ParticleSystem**: 粒子效果系统
- **MovementController**: 角色移动控制

## 组件和接口

### GameEngine
```javascript
class GameEngine {
  constructor(canvas, audioManager)
  start()                    // 开始游戏循环
  pause()                    // 暂停游戏
  resume()                   // 恢复游戏
  update(deltaTime)          // 更新游戏状态
  render()                   // 渲染游戏画面
  handleInput(inputEvent)    // 处理输入事件
}
```

### StateManager
```javascript
class StateManager {
  constructor()
  getCurrentStage()          // 获取当前人生阶段
  transitionToStage(stage)   // 切换到指定阶段
  getStageProgress()         // 获取当前阶段进度
  isGameComplete()           // 检查游戏是否结束
}
```

### EventSystem
```javascript
class EventSystem {
  constructor(stateManager)
  generateEvent(stage)       // 根据阶段生成事件
  processInteraction(input)  // 处理玩家交互
  completeEvent(eventId)     // 完成事件
  getActiveEvents()          // 获取活跃事件列表
}
```

### InputHandler
```javascript
class InputHandler {
  constructor(canvas)
  bindEvents()               // 绑定触摸事件
  handleTouch(event)         // 处理触摸输入
  handleDrag(event)          // 处理拖拽输入
  isValidInteraction(event)  // 验证交互有效性
}
```

### AnimationEngine
```javascript
class AnimationEngine {
  constructor(canvas, options)
  loadAnimation(type, config) // 动态加载动画模块
  playAnimation(type, duration) // 播放指定动画
  playBirthAnimation()       // 播放出生动画
  pauseAnimation()           // 暂停动画
  resumeAnimation()          // 恢复动画
  stopAnimation()            // 停止动画
  pauseGameTimer()           // 暂停游戏计时器
  resumeGameTimer()          // 恢复游戏计时器
  setQuality(level)          // 设置质量等级
  getPerformanceMetrics()    // 获取性能指标
}
```

### CharacterRenderer
```javascript
class CharacterRenderer {
  constructor(context, options)
  renderCharacter(stage, position, emotion) // 渲染角色
  transitionToStage(from, to, duration) // 角色形态转换
  updateCharacterForm(stage) // 更新角色形态
  setCharacterEmotion(emotion) // 设置角色情感
  replaceCharacterVisual(assets) // 替换角色视觉资源
  getCharacterBounds()       // 获取角色边界
}
```

### EffectRenderer
```javascript
class EffectRenderer {
  constructor(context, options)
  renderParticles(particles, options) // 渲染粒子系统
  renderLightEffects(lights, options) // 渲染光效
  renderGlow(glowConfig)     // 渲染光晕效果
  renderBurst(burstConfig)   // 渲染爆发效果
  setBlendMode(mode)         // 设置混合模式
  clearCache()               // 清理缓存
}
```

### ParticleSystem
```javascript
class ParticleSystem {
  constructor(maxParticles)
  createEmitter(config)      // 创建粒子发射器
  updateParticles(deltaTime) // 更新粒子状态
  renderParticles(renderer)  // 渲染粒子
  addParticle(particle)      // 添加粒子
  clearParticles()           // 清理粒子
}
```

### MovementController
```javascript
class MovementController {
  constructor(character, scene)
  moveToPosition(x, y, duration) // 移动到指定位置
  moveToEvent(eventType, data) // 移动到事件位置
  setMovementSpeed(speed)    // 设置移动速度
  pauseMovement()            // 暂停移动
  resumeMovement()           // 恢复移动
  isMoving()                 // 检查是否在移动
  getCurrentPosition()       // 获取当前位置
}
```

## 数据模型

### GameState
```javascript
{
  currentStage: LifeStage,
  gameTime: number,          // 游戏已进行时间(0-100秒)
  totalScore: number,        // 总分数
  completedEvents: Event[],  // 已完成事件
  activeEvents: Event[],     // 当前活跃事件
  character: Character,      // 游戏角色状态
  isGameActive: boolean      // 游戏是否进行中
}
```

### LifeStage
```javascript
{
  id: string,               // 阶段ID (baby, child, teen, adult, elder)
  name: string,             // 阶段名称
  duration: number,         // 阶段持续时间(秒)
  difficulty: number,       // 难度系数(1-5)
  events: LifeEvent[],      // 该阶段可能的事件
  scene: Scene              // 场景配置
}
```

### LifeEvent
```javascript
{
  id: string,               // 事件ID
  name: string,             // 事件名称
  type: InteractionType,    // 交互类型
  difficulty: number,       // 事件难度
  timeLimit: number,        // 时间限制(毫秒)
  points: number,           // 完成后获得分数
  position: {x, y},         // 屏幕位置
  target: InteractionTarget // 交互目标配置
}
```

### InteractionTarget
```javascript
{
  type: string,             // 目标类型 (button, moving_object, drag_target)
  size: {width, height},    // 目标大小
  speed: number,            // 移动速度(如果是移动目标)
  requiredClicks: number,   // 需要点击次数(如果是连击)
  dragDistance: number      // 拖拽距离(如果是拖拽)
}
```

### AnimationConfig
```javascript
{
  name: string,             // 动画名称
  duration: number,         // 持续时间(ms)
  fps: number,              // 目标帧率
  quality: string,          // 质量等级 (high, medium, low)
  phases: [                 // 动画阶段
    {
      name: string,         // 阶段名称
      startTime: number,    // 开始时间
      endTime: number,      // 结束时间
      effects: Array        // 特效配置
    }
  ],
  characters: Array,        // 角色配置
  environment: Object,      // 环境配置
  effects: Array           // 特效配置
}
```

### CharacterForm
```javascript
{
  stage: string,            // 人生阶段 (baby, child, teen, adult, elder)
  appearance: {
    size: number,           // 角色大小
    proportions: Object,    // 身体比例
    features: Array,        // 面部特征
    posture: string         // 姿态
  },
  animations: {
    idle: string,           // 待机动画
    walk: string,           // 行走动画
    emotion: Object         // 情感表达动画
  },
  transitions: Array        // 形态转换动画
}
```

### ParticleConfig
```javascript
{
  type: string,             // 粒子类型 (circle, heart, star, sparkle)
  count: number,            // 粒子数量
  position: {x, y},         // 发射位置
  velocity: {x, y},         // 初始速度
  acceleration: {x, y},     // 加速度
  life: number,             // 生命周期
  color: string,            // 颜色
  size: number,             // 大小
  opacity: number           // 透明度
}
```

### MovementConfig
```javascript
{
  speed: number,            // 移动速度
  easing: string,           // 缓动函数类型
  pathType: string,         // 路径类型 (direct, curved, smart)
  duration: number,         // 移动持续时间
  smoothing: number,        // 路径平滑度
  collision: boolean,       // 是否启用碰撞检测
  eventIntegration: {
    pauseOnEvent: boolean,  // 事件时暂停移动
    resumeAfterEvent: boolean, // 事件后恢复移动
    eventPositioning: Object // 事件位置配置
  }
}
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*
### 属性反思

经过分析，我识别出以下可以合并的冗余属性：
- 评分范围属性(6.2-6.5)可合并为单一的评价系统属性
- 交互反馈属性(2.2, 3.5)可合并为统一的反馈机制属性  
- 难度递进属性(5.1, 5.2)可合并为阶段难度一致性属性
- 音频相关属性(3.2, 3.3)可合并为音频播放状态属性

**属性 1: 游戏时间与人生阶段一致性**
*对于任何*游戏时间点，显示的人生阶段应该与该时间点在100秒生命周期中的位置相对应
**验证: 需求 1.2**

**属性 2: 分数计算一致性**  
*对于任何*完成事件的组合，最终分数应该等于所有完成事件的分数总和
**验证: 需求 1.4, 6.1**

**属性 3: 游戏重置往返性**
*对于任何*游戏状态，重置游戏后应该返回到初始的新生儿状态，倒计时为100秒
**验证: 需求 1.5**

**属性 4: 事件交互提示一致性**
*对于任何*生成的人生事件，都应该包含相应的交互提示和操作区域配置
**验证: 需求 2.1**

**属性 5: 成功交互奖励一致性**
*对于任何*成功完成的交互任务，分数应该增加且应该触发成功反馈
**验证: 需求 2.2, 3.5**

**属性 6: 失败交互处理一致性**
*对于任何*超时未完成的交互任务，该事件应该被跳过且分数不应该增加
**验证: 需求 2.3**

**属性 7: 移动目标交互验证**
*对于任何*点击移动物体类型的交互，只有准确点击移动目标才应该被认为是成功交互
**验证: 需求 2.4**

**属性 8: 连击交互计数准确性**
*对于任何*快速连续点击类型的交互，检测到的点击次数应该等于玩家在时间限制内的实际点击次数
**验证: 需求 2.5**

**属性 9: 音频播放状态一致性**
*对于任何*游戏进行状态，背景音乐应该在播放中，且角色说话时应该播放相应音效
**验证: 需求 3.2, 3.3**

**属性 10: 屏幕适配一致性**
*对于任何*屏幕尺寸和分辨率，游戏界面应该正确适配并保持可用性
**验证: 需求 4.1**

**属性 11: 触摸输入识别准确性**
*对于任何*有效的触摸输入，系统应该准确识别其类型(点击、拖拽、滑动)并正确处理
**验证: 需求 4.2**

**属性 12: 方向锁定一致性**
*对于任何*设备方向变化，游戏应该保持横屏模式且界面布局应该相应调整
**验证: 需求 4.5**

**属性 13: 阶段难度递进一致性**
*对于任何*人生阶段序列，后期阶段的交互任务难度应该大于或等于前期阶段
**验证: 需求 5.1, 5.2**

**属性 14: 难度时间限制反比关系**
*对于任何*交互任务，难度增加时反应时间限制应该相应减少
**验证: 需求 5.3**

**属性 15: 动态难度调整一致性**
*对于任何*连续成功的交互序列，后续任务的难度应该适当提高
**验证: 需求 5.4**

**属性 16: 难度保护机制**
*对于任何*连续失败的交互序列，难度水平应该保持不变或降低
**验证: 需求 5.5**

**属性 17: 评价系统一致性**
*对于任何*最终分数百分比，显示的评价应该与预定义的分数区间对应(0-30%:"匆忙人生", 31-60%:"平凡人生", 61-85%:"充实人生", 86-100%:"完美人生")
**验证: 需求 6.2, 6.3, 6.4, 6.5**

## 错误处理

### 输入错误处理
- **无效触摸输入**: 忽略超出游戏区域的触摸事件
- **多点触摸**: 只处理第一个触摸点，忽略其他触摸
- **快速重复输入**: 实施防抖机制，避免意外的重复触发

### 游戏状态错误处理  
- **状态不一致**: 实施状态验证，确保游戏状态转换的有效性
- **时间同步错误**: 使用系统时间戳确保计时准确性
- **事件冲突**: 确保同一时间只有一个活跃的交互事件

### 性能错误处理
- **内存不足**: 实施对象池模式，重用游戏对象
- **帧率下降**: 动态调整渲染质量以维持性能
- **音频加载失败**: 提供静音模式作为降级方案

### 设备兼容性错误处理
- **不支持的浏览器**: 显示兼容性提示信息
- **触摸不支持**: 提供鼠标输入作为备选方案
- **音频不支持**: 仅显示视觉反馈，禁用音频功能

## 测试策略

### 双重测试方法

本项目将采用单元测试和基于属性的测试相结合的综合测试策略：

**单元测试**用于验证：
- 特定的游戏初始化和结束场景
- 具体的交互类型和边界条件  
- 特定分数范围的评价显示
- 关键组件的集成点

**基于属性的测试**用于验证：
- 跨所有输入的通用正确性属性
- 游戏状态转换的一致性
- 分数计算和难度调整的数学关系
- 输入处理和反馈机制的可靠性

### 基于属性的测试要求

- **测试库**: 使用fast-check库进行JavaScript基于属性的测试
- **测试配置**: 每个属性测试运行最少100次迭代以确保充分覆盖
- **属性标记**: 每个基于属性的测试必须包含注释，明确引用设计文档中对应的正确性属性
- **标记格式**: 使用格式'**Feature: life-journey-game, Property {number}: {property_text}**'
- **实现要求**: 每个正确性属性必须对应一个单独的基于属性测试
- **测试重点**: 属性测试应验证通用规则，单元测试应验证具体示例

### 测试覆盖范围

**核心功能测试**:
- 游戏生命周期管理(开始、进行、结束)
- 人生阶段转换和时间管理
- 交互事件生成和处理
- 分数计算和评价系统

**性能和兼容性测试**:
- 移动设备触摸输入响应
- 不同屏幕尺寸的适配
- 音频播放和同步
- 帧率和内存使用优化

**边界条件测试**:
- 极端分数情况(0分和满分)
- 最大和最小难度级别
- 网络连接中断情况
- 设备资源限制场景