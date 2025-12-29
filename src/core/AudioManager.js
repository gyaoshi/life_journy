/**
 * AudioManager - 音频管理器
 * 负责背景音乐播放和音效管理功能
 */
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
        console.log('AudioManager initialized');
    }
    
    /**
     * 初始化音频上下文
     */
    async initializeAudioContext() {
        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建主音量控制节点
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.connect(this.audioContext.destination);
            this.masterGainNode.gain.value = this.masterVolume;
            
            // 创建音乐音量控制节点
            this.musicGainNode = this.audioContext.createGain();
            this.musicGainNode.connect(this.masterGainNode);
            this.musicGainNode.gain.value = this.musicVolume;
            
            // 创建音效音量控制节点
            this.sfxGainNode = this.audioContext.createGain();
            this.sfxGainNode.connect(this.masterGainNode);
            this.sfxGainNode.gain.value = this.sfxVolume;
            
            console.log('AudioContext initialized');
        } catch (error) {
            console.warn('Failed to initialize AudioContext:', error);
            this.isEnabled = false;
        }
    }
    
    /**
     * 恢复音频上下文(用户交互后)
     */
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('AudioContext resumed');
            } catch (error) {
                console.warn('Failed to resume AudioContext:', error);
            }
        }
    }
    
    /**
     * 生成背景音乐(程序化生成)
     */
    generateBackgroundMusic() {
        if (!this.audioContext || !this.isEnabled) return;
        
        try {
            // 创建一个简单的循环音乐
            const duration = 8; // 8秒循环
            const sampleRate = this.audioContext.sampleRate;
            const frameCount = sampleRate * duration;
            
            const audioBuffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            // 生成急促的节拍音乐
            for (let i = 0; i < frameCount; i++) {
                const time = i / sampleRate;
                
                // 主旋律 - 快速的电子音
                const freq1 = 220 + Math.sin(time * 2) * 50;
                const wave1 = Math.sin(2 * Math.PI * freq1 * time) * 0.3;
                
                // 节拍 - 每0.5秒一个重音
                const beatFreq = 4; // 每秒4拍
                const beat = Math.sin(2 * Math.PI * beatFreq * time);
                const beatEnvelope = beat > 0 ? 1 : 0.3;
                
                // 高频装饰音
                const freq2 = 440 + Math.sin(time * 8) * 100;
                const wave2 = Math.sin(2 * Math.PI * freq2 * time) * 0.2;
                
                // 混合所有音频
                channelData[i] = (wave1 + wave2) * beatEnvelope * 0.5;
            }
            
            this.backgroundMusic = audioBuffer;
            console.log('Background music generated');
        } catch (error) {
            console.warn('Failed to generate background music:', error);
        }
    }
    
    /**
     * 播放背景音乐
     */
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
    
    /**
     * 开始音乐循环
     */
    startMusicLoop() {
        if (!this.backgroundMusic || this.isMusicPlaying) return;
        
        try {
            this.currentMusicSource = this.audioContext.createBufferSource();
            this.currentMusicSource.buffer = this.backgroundMusic;
            this.currentMusicSource.connect(this.musicGainNode);
            this.currentMusicSource.loop = true;
            this.currentMusicSource.start();
            
            this.isMusicPlaying = true;
            console.log('Background music started');
        } catch (error) {
            console.warn('Failed to start background music:', error);
        }
    }
    
    /**
     * 停止背景音乐
     */
    stopBackgroundMusic() {
        if (this.currentMusicSource && this.isMusicPlaying) {
            try {
                this.currentMusicSource.stop();
                this.currentMusicSource = null;
                this.isMusicPlaying = false;
                console.log('Background music stopped');
            } catch (error) {
                console.warn('Failed to stop background music:', error);
            }
        }
    }
    
    /**
     * 生成音效
     */
    generateSoundEffect(type) {
        if (!this.audioContext || !this.isEnabled) return null;
        
        try {
            const duration = 0.3; // 300ms
            const sampleRate = this.audioContext.sampleRate;
            const frameCount = sampleRate * duration;
            
            const audioBuffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            switch (type) {
                case 'success':
                    // 成功音效 - 上升音调
                    for (let i = 0; i < frameCount; i++) {
                        const time = i / sampleRate;
                        const freq = 440 + time * 200; // 从440Hz上升到640Hz
                        const envelope = Math.exp(-time * 3); // 衰减包络
                        channelData[i] = Math.sin(2 * Math.PI * freq * time) * envelope * 0.5;
                    }
                    break;
                    
                case 'failure':
                    // 失败音效 - 下降音调
                    for (let i = 0; i < frameCount; i++) {
                        const time = i / sampleRate;
                        const freq = 300 - time * 150; // 从300Hz下降到150Hz
                        const envelope = Math.exp(-time * 2);
                        channelData[i] = Math.sin(2 * Math.PI * freq * time) * envelope * 0.4;
                    }
                    break;
                    
                case 'character_voice':
                    // 角色声音 - 含糊尖锐的声音
                    for (let i = 0; i < frameCount; i++) {
                        const time = i / sampleRate;
                        const freq = 800 + Math.random() * 400; // 随机频率800-1200Hz
                        const noise = (Math.random() - 0.5) * 0.3; // 添加噪音
                        const envelope = Math.exp(-time * 4);
                        channelData[i] = (Math.sin(2 * Math.PI * freq * time) + noise) * envelope * 0.3;
                    }
                    break;
                    
                case 'click':
                    // 点击音效 - 短促的咔嗒声
                    for (let i = 0; i < frameCount * 0.1; i++) { // 只用前10%的时间
                        const time = i / sampleRate;
                        const freq = 1000;
                        const envelope = Math.exp(-time * 20); // 快速衰减
                        channelData[i] = Math.sin(2 * Math.PI * freq * time) * envelope * 0.6;
                    }
                    break;
                    
                default:
                    // 默认音效
                    for (let i = 0; i < frameCount; i++) {
                        const time = i / sampleRate;
                        const freq = 440;
                        const envelope = Math.exp(-time * 3);
                        channelData[i] = Math.sin(2 * Math.PI * freq * time) * envelope * 0.4;
                    }
            }
            
            return audioBuffer;
        } catch (error) {
            console.warn(`Failed to generate ${type} sound effect:`, error);
            return null;
        }
    }
    
    /**
     * 播放音效
     */
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
                    console.warn(`Failed to play ${type} sound effect:`, error);
                }
            }
        });
    }
    
    /**
     * 设置主音量
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = this.masterVolume;
        }
    }
    
    /**
     * 设置音乐音量
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGainNode) {
            this.musicGainNode.gain.value = this.musicVolume;
        }
    }
    
    /**
     * 设置音效音量
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGainNode) {
            this.sfxGainNode.gain.value = this.sfxVolume;
        }
    }
    
    /**
     * 启用音频
     */
    enable() {
        this.isEnabled = true;
    }
    
    /**
     * 禁用音频
     */
    disable() {
        this.isEnabled = false;
        this.stopBackgroundMusic();
    }
    
    /**
     * 检查音乐是否正在播放
     */
    isMusicPlaying() {
        return this.isMusicPlaying;
    }
    
    /**
     * 获取音频状态
     */
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