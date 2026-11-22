class BirthdayAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlayingBgm = false;
  // 用于播放外部mp3背景音乐
  private bgmAudio: HTMLAudioElement | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.08, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx || freq <= 0) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public toggleBgm(): boolean {
    if (this.isPlayingBgm) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public startBgm() {
    this.ensureContext();
    if (this.isPlayingBgm) return;
    this.isPlayingBgm = true;
  
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio('/assets/aistudio/twelve.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.4;
      this.bgmAudio.onloadeddata = ()=>console.log("音频加载成功");
      this.bgmAudio.onerror = (e)=>console.error("音频加载失败",e);
    }
    this.bgmAudio.currentTime = 0;
    this.bgmAudio.play().catch(err => {
      console.warn("播放失败", err);
    });
  }

  public stopBgm() {
    this.isPlayingBgm = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
  }

  // --------下面全部是原有音效，原样保留，不要删--------
  public playCelebrate() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      this.playTone(f, 0.35, 'triangle', 0.08, idx * 0.08);
    });
  }
  public playFlip() {
    this.playTone(480, 0.08, 'sine', 0.04, 0);
    this.playTone(620, 0.09, 'sine', 0.035, 0.04);
  }
  public playGachaCrank() {
    this.playTone(320, 0.07, 'square', 0.03, 0);
    this.playTone(380, 0.07, 'square', 0.03, 0.12);
    this.playTone(440, 0.09, 'triangle', 0.05, 0.24);
  }
  public playGachaPop() {
    this.playTone(587.33, 0.14, 'triangle', 0.07, 0);
    this.playTone(880, 0.28, 'sine', 0.075, 0.09);
  }
  public playCatchGood() {
    this.playTone(659.25, 0.1, 'sine', 0.055, 0);
    this.playTone(987.77, 0.14, 'triangle', 0.05, 0.05);
  }
  public playCatchOops() {
    this.playTone(210, 0.18, 'sawtooth', 0.035, 0);
  }
  public playScratchReveal() {
    [587.33, 739.99, 880, 1174.66].forEach((f, i) => {
      this.playTone(f, 0.25, 'sine', 0.06, i * 0.07);
    });
  }
}
export const birthdaySound = new BirthdayAudioEngine();