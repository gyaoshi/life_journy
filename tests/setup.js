/**
 * Jest 测试环境设置
 */

// 模拟 Canvas API
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  fillText: jest.fn(),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  // 添加更多 Canvas 2D API 方法
  beginPath: jest.fn(),
  closePath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  arc: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  scale: jest.fn(),
  drawImage: jest.fn(),
  measureText: jest.fn(() => ({ width: 100 }))
}));

// 模拟 AudioContext
global.AudioContext = jest.fn(() => ({
  createBuffer: jest.fn(() => ({
    getChannelData: jest.fn(() => new Float32Array(1024))
  })),
  createBufferSource: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    buffer: null,
    loop: false
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { value: 1 }
  })),
  destination: {},
  state: 'running',
  resume: jest.fn(() => Promise.resolve()),
  sampleRate: 44100
}));

global.webkitAudioContext = global.AudioContext;

// 模拟 requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 16); // 模拟 60fps
});

global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// 模拟 performance.now
global.performance = {
  now: jest.fn(() => Date.now())
};

// 模拟 DOM 元素
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768
});

// 模拟 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// 设置默认的 Canvas 元素
document.body.innerHTML = `
  <canvas id="gameCanvas" width="800" height="600"></canvas>
`;

// 全局测试工具函数
global.createMockCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  canvas.id = 'gameCanvas';
  return canvas;
};

global.createMockEvent = (type, x = 100, y = 100) => {
  return {
    type: type,
    x: x,
    y: y,
    timestamp: Date.now(),
    deltaX: 0,
    deltaY: 0
  };
};

// 抑制 console.log 输出(可选)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn()
// };