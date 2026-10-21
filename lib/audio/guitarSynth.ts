// lib/audio/guitarSynth.ts

/**
 * 吉他標準調音 (E2, A2, D3, G3, B3, E4) 的基準頻率 (Hz)
 * Index 0: 第 6 弦 (低音 E2)
 * Index 5: 第 1 弦 (高音 E4)
 */
const STRING_OPEN_FREQUENCIES = [
  82.41,  // 6 弦 E2
  110.00, // 5 弦 A2
  146.83, // 4 弦 D3
  196.00, // 3 弦 G3
  246.94, // 2 弦 B3
  329.63  // 1 弦 E4
];

export class GuitarAudioEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupIOSUnlockListeners();
    }
  }

  /**
   * iPadOS / iOS 激進解鎖機制：
   * 監聽使用者的首次 touchstart / click，播放微小靜音緩衝區徹底喚醒音訊晶片
   */
  private setupIOSUnlockListeners() {
    const unlock = () => {
      this.initAudio().then(() => {
        if (this.ctx && this.ctx.state === 'running') {
          // 播放 1 frame 靜音 buffer 確保 iOS 核心解鎖
          const buffer = this.ctx.createBuffer(1, 1, 22050);
          const source = this.ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.ctx.destination);
          source.start(0);

          // 移除全域監聽器
          ['touchstart', 'touchend', 'click'].forEach((event) => {
            window.removeEventListener(event, unlock);
          });
        }
      });
    };

    ['touchstart', 'touchend', 'click'].forEach((event) => {
      window.addEventListener(event, unlock, { once: false, passive: true });
    });
  }

  public async initAudio(): Promise<boolean> {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.warn('AudioContext resume failed:', e);
      }
    }

    this.isUnlocked = this.ctx?.state === 'running';
    return this.isUnlocked;
  }

  /**
   * 計算特定弦在特定品位時的頻率
   */
  public getFrequency(stringIndex: number, fret: number): number {
    const baseFreq = STRING_OPEN_FREQUENCIES[stringIndex];
    return baseFreq * Math.pow(2, fret / 12);
  }

  /**
   * 物理建模 Karplus-Strong 演算法撥弦單音
   */
  public pluckString(stringIndex: number, fret: number, startTimeOffset: number = 0, volume: number = 0.5): void {
    if (!this.ctx || fret < 0) return; // -1 為悶音

    // 若 iPad 進入休眠後又被暫停，確保喚醒
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime + startTimeOffset;
    const frequency = this.getFrequency(stringIndex, fret);
    const sampleRate = this.ctx.sampleRate;
    const period = Math.round(sampleRate / frequency);

    const noiseBuffer = this.ctx.createBuffer(1, period, sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < period; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 3.5, now);
    filter.frequency.exponentialRampToValueAtTime(frequency * 0.8, now + 1.8);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 2.6);
  }

  /**
   * 刷弦發聲 (Strumming)
   */
  public async strumChord(frets: number[], downStrum: boolean = true, strumSpeed: number = 0.03): Promise<void> {
    await this.initAudio();
    if (!this.ctx) return;

    const stringOrder = downStrum ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0];
    let offset = 0;

    for (const strIdx of stringOrder) {
      const fret = frets[strIdx];
      if (fret >= 0) {
        this.pluckString(strIdx, fret, offset, 0.45);
        offset += strumSpeed;
      }
    }
  }

  /**
   * 慢速分解和弦 (Arpeggio)
   */
  public async playArpeggio(frets: number[], intervalSec: number = 0.25): Promise<void> {
    await this.initAudio();
    if (!this.ctx) return;

    let offset = 0;
    for (let i = 0; i < frets.length; i++) {
      const fret = frets[i];
      if (fret >= 0) {
        this.pluckString(i, fret, offset, 0.5);
        offset += intervalSec;
      }
    }
  }

  /**
   * 節拍器滴答聲 (Metronome Click)
   */
  public playClick(time: number, isAccent: boolean = false): void {
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccent ? 1600 : 900, time);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.06);
  }

  /**
   * 倒數預備鈴 (Count-in Beep: 1, 2, 3, 4)
   */
  public playCountInBeep(time: number, countNum: number): void {
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const freq = countNum === 4 ? 2200 : 1760;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.09);
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }
}

export const guitarAudio = new GuitarAudioEngine();
