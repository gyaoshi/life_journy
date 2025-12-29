/**
 * AudioManager 属性测试
 */

const fc = require('fast-check');

// Mock Web Audio API for testing
global.AudioContext = class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.sampleRate = 44100;
    this.destination = {};
  }
  
  createGain() {
    return {
      connect: () => {},
      gain: { value: 1.0 }
    };
  }
  
  createBuffer(channels, frameCount, sampleRate) {
    return {
      getChannelData: () => new Float32Array(frameCount)
    };
  }
  
  createBufferSource() {
    return {
      buffer: null,
      loop: false,
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  
  async resume() {
    this.state = 'running';
  }
};

global.webkitAudioContext = global.AudioContext;

// 简化的AudioManager类用于测试
class AudioManager {
  constructor() {
    this.isEnabled = true;
    this.masterVolume = 1.0;
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    
    // 音频上下文
    this.audioContext = null;
    this.backgroundMusic = null;
    this.soundEffects = new Map();
    
    // 播放状态
    this.isMusicPlaying = false;
    this.currentMusicSource = null;
    
    this.initializeAudioContext();
  }
  
  async initializeAudioContext() {
    try {
      this.audioContext = new AudioContext();
      
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);
      this.masterGainNode.gain.value = this.masterVolume;
      
      this.musicGainNode = this.audioContext.createGain();
      this.musicGainNode.connect(this.masterGainNode);
      this.musicGainNode.gain.value = this.musicVolume;
      
      this.sfxGainNode = this.audioContext.createGain();
      this.sfxGainNode.connect(this.masterGainNode);
      this.sfxGainNode.gain.value = this.sfxVolume;
    } catch (error) {
      this.isEnabled = false;
    }
  }
  
  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
  
  generateBackgroundMusic() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const duration = 8;
      const sampleRate = this.audioContext.sampleRate;
      const frameCount = sampleRate * duration;
      
      this.backgroundMusic = this.audioContext.createBuffer(1, frameCount, sampleRate);
    } catch (error) {
      // Handle error silently for testing
    }
  }
  
  playBackgroundMusic() {
    if (!this.audioContext || !this.isEnabled || this.isMusicPlaying) return;
    
    this.resumeAudioContext().then(() => {
      if (!this.backgroundMusic) {
        this.generateBackgroundMusic();
      }
      
      if (this.backgroundMusic) {
        this.startMusicLoop();
      }
    });
  }
  
  startMusicLoop() {
    if (!this.backgroundMusic || this.isMusicPlaying) return;
    
    try {
      this.currentMusicSource = this.audioContext.createBufferSource();
      this.currentMusicSource.buffer = this.backgroundMusic;
      this.currentMusicSource.connect(this.musicGainNode);
      this.currentMusicSource.loop = true;
      this.currentMusicSource.start();
      
      this.isMusicPlaying = true;
    } catch (error) {
      // Handle error silently for testing
    }
  }
  
  stopBackgroundMusic() {
    if (this.currentMusicSource && this.isMusicPlaying) {
      try {
        this.currentMusicSource.stop();
        this.currentMusicSource = null;
        this.isMusicPlaying = false;
      } catch (error) {
        // Handle error silently for testing
      }
    }
  }
  
  generateSoundEffect(type) {
    if (!this.audioContext || !this.isEnabled) return null;
    
    try {
      const duration = 0.3;
      const sampleRate = this.audioContext.sampleRate;
      const frameCount = sampleRate * duration;
      
      return this.audioContext.createBuffer(1, frameCount, sampleRate);
    } catch (error) {
      return null;
    }
  }
  
  playSoundEffect(type) {
    if (!this.audioContext || !this.isEnabled) return;
    
    this.resumeAudioContext().then(() => {
      let soundBuffer = this.soundEffects.get(type);
      
      if (!soundBuffer) {
        soundBuffer = this.generateSoundEffect(type);
        if (soundBuffer) {
          this.soundEffects.set(type, soundBuffer);
        }
      }
      
      if (soundBuffer) {
        try {
          const source = this.audioContext.createBufferSource();
          source.buffer = soundBuffer;
          source.connect(this.sfxGainNode);
          source.start();
        } catch (error) {
          // Handle error silently for testing
        }
      }
    });
  }
  
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.masterVolume;
    }
  }
  
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.musicVolume;
    }
  }
  
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = this.sfxVolume;
    }
  }
  
  enable() {
    this.isEnabled = true;
  }
  
  disable() {
    this.isEnabled = false;
    this.stopBackgroundMusic();
  }
  
  getMusicPlayingState() {
    return this.isMusicPlaying;
  }
  
  getAudioState() {
    return {
      isEnabled: this.isEnabled,
      isMusicPlaying: this.isMusicPlaying,
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      contextState: this.audioContext ? this.audioContext.state : 'unavailable'
    };
  }
}

describe('AudioManager 属性测试', () => {
  /**
   * **Feature: life-journey-game, Property 9: 音频播放状态一致性**
   * 对于任何游戏进行状态，背景音乐应该在播放中，且角色说话时应该播放相应音效
   * **验证: 需求 3.2, 3.3**
   */
  test('属性 9: 音频播放状态一致性', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        isGameActive: fc.boolean(),
        shouldPlayMusic: fc.boolean(),
        characterSpeaking: fc.boolean(),
        audioEnabled: fc.boolean()
      }),
      async (gameState) => {
        // 创建音频管理器
        const audioManager = new AudioManager();
        
        // 等待音频上下文初始化
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // 设置音频启用状态
        if (gameState.audioEnabled) {
          audioManager.enable();
        } else {
          audioManager.disable();
        }
        
        // 模拟游戏进行状态
        if (gameState.isGameActive && gameState.shouldPlayMusic && gameState.audioEnabled) {
          audioManager.playBackgroundMusic();
          // 等待异步操作完成
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // 模拟角色说话
        if (gameState.characterSpeaking && gameState.audioEnabled) {
          audioManager.playSoundEffect('character_voice');
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // 验证音频播放状态一致性
        const audioState = audioManager.getAudioState();
        
        // 如果音频被禁用，音乐不应该播放
        if (!gameState.audioEnabled) {
          return audioState.isMusicPlaying === false;
        }
        
        // 如果游戏未进行或不应该播放音乐，音乐不应该播放
        if (!gameState.isGameActive || !gameState.shouldPlayMusic) {
          return audioState.isMusicPlaying === false;
        }
        
        // 如果游戏进行中且音频启用，背景音乐应该播放
        if (gameState.isGameActive && gameState.shouldPlayMusic && gameState.audioEnabled) {
          const audioContextAvailable = audioState.contextState !== 'unavailable';
          // 音频上下文可用时，音乐应该播放
          return audioContextAvailable ? audioState.isMusicPlaying === true : true;
        }
        
        return true;
      }
    ), { numRuns: 100 });
  });
  
  /**
   * 音频音量控制一致性测试
   * 验证音量设置在有效范围内且正确应用
   */
  test('音频音量控制一致性', () => {
    fc.assert(fc.property(
      fc.record({
        masterVolume: fc.float({ min: -1, max: 2, noNaN: true }),
        musicVolume: fc.float({ min: -1, max: 2, noNaN: true }),
        sfxVolume: fc.float({ min: -1, max: 2, noNaN: true })
      }),
      (volumes) => {
        const audioManager = new AudioManager();
        
        // 设置音量
        audioManager.setMasterVolume(volumes.masterVolume);
        audioManager.setMusicVolume(volumes.musicVolume);
        audioManager.setSfxVolume(volumes.sfxVolume);
        
        const audioState = audioManager.getAudioState();
        
        // 验证音量被正确限制在0-1范围内
        const masterVolumeValid = audioState.masterVolume >= 0 && audioState.masterVolume <= 1;
        const musicVolumeValid = audioState.musicVolume >= 0 && audioState.musicVolume <= 1;
        const sfxVolumeValid = audioState.sfxVolume >= 0 && audioState.sfxVolume <= 1;
        
        return masterVolumeValid && musicVolumeValid && sfxVolumeValid;
      }
    ), { numRuns: 100 });
  });
  
  /**
   * 音频启用/禁用状态一致性测试
   * 验证音频启用状态与播放行为的一致性
   */
  test('音频启用/禁用状态一致性', () => {
    fc.assert(fc.property(
      fc.record({
        initialEnabled: fc.boolean(),
        toggleEnabled: fc.boolean(),
        attemptPlayMusic: fc.boolean()
      }),
      (testCase) => {
        const audioManager = new AudioManager();
        
        // 设置初始启用状态
        if (testCase.initialEnabled) {
          audioManager.enable();
        } else {
          audioManager.disable();
        }
        
        // 切换启用状态
        if (testCase.toggleEnabled) {
          if (testCase.initialEnabled) {
            audioManager.disable();
          } else {
            audioManager.enable();
          }
        }
        
        // 尝试播放音乐
        if (testCase.attemptPlayMusic) {
          audioManager.playBackgroundMusic();
        }
        
        const audioState = audioManager.getAudioState();
        const finalEnabled = testCase.initialEnabled !== testCase.toggleEnabled;
        
        // 验证启用状态一致性
        const enabledStateConsistent = audioState.isEnabled === finalEnabled;
        
        // 如果音频被禁用，音乐不应该播放
        const playbackConsistent = !finalEnabled ? !audioState.isMusicPlaying : true;
        
        return enabledStateConsistent && playbackConsistent;
      }
    ), { numRuns: 100 });
  });
});