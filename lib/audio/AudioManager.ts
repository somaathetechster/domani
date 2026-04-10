"use client";

class AudioManager {
  private ctx:          AudioContext | null     = null;
  private master:       GainNode | null         = null;
  private droneGain:    GainNode | null         = null;
  private ambientTrack: HTMLAudioElement | null = null;
  private stopping      = false;   // prevents re-trigger during fade-out
  private booted        = false;

  boot() {
    if (this.booted) return;
    this.booted = true;
    this.ctx    = new (window.AudioContext || (window as any).webkitAudioContext)();

    this.master = this.ctx.createGain();
    this.master.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.master.connect(this.ctx.destination);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.droneGain.gain.linearRampToValueAtTime(0.13, this.ctx.currentTime + 4);
    this.droneGain.connect(this.ctx.destination);

    const sub = this.drone(55, "sine", 0.42);
    this.drone(110, "sine", 0.15);
    this.drone(440.25, "sine", 0.025);
    this.drone(440.75, "sine", 0.025);

    const lfo = this.ctx.createOscillator();
    const lg  = this.ctx.createGain();
    lfo.frequency.value = 0.065; lg.gain.value = 1.4;
    lfo.connect(lg); lg.connect(sub.frequency); lfo.start();

    const ns = this.ctx.createOscillator();
    const nb = this.ctx.createBiquadFilter();
    const ng = this.ctx.createGain();
    ns.type = "sawtooth"; ns.frequency.value = 55;
    nb.type = "bandpass"; nb.frequency.value = 800; nb.Q.value = 12;
    ng.gain.value = 0.018;
    ns.connect(nb); nb.connect(ng); ng.connect(this.droneGain);
    ns.start();

    [[440,0.18],[554,0.12],[659,0.08],[880,0.05]].forEach(
      ([f,v],i) => this.chime(f,v,i*0.18)
    );
  }

  private drone(freq: number, type: OscillatorType, vol: number): OscillatorNode {
    if (!this.ctx || !this.droneGain) throw new Error();
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(this.droneGain); o.start();
    return o;
  }

  private chime(freq: number, vol: number, delay: number) {
    if (!this.ctx || !this.droneGain) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine"; o.frequency.value = freq;
    const t = this.ctx.currentTime + delay;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    o.connect(g); g.connect(this.droneGain);
    o.start(t); o.stop(t + 1.3);
  }

  playHover() {
    if (!this.ctx || !this.master) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine"; o.frequency.value = 660;
    g.gain.setValueAtTime(0.04, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
    o.connect(g); g.connect(this.master);
    o.start(); o.stop(this.ctx.currentTime + 0.2);
  }

  playClick() {
    if (!this.ctx || !this.master) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(800, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0.12, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    o.connect(g); g.connect(this.master);
    o.start(); o.stop(this.ctx.currentTime + 0.13);
  }

  playTransition() {
    if (!this.ctx || !this.master) return;
    const o = this.ctx.createOscillator();
    const f = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(220, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 2);
    f.type = "lowpass";
    f.frequency.setValueAtTime(2000, this.ctx.currentTime);
    f.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 2);
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2.4);
    o.connect(f); f.connect(g); g.connect(this.master);
    o.start(); o.stop(this.ctx.currentTime + 2.6);
  }

  playAmbientTrack(src = "/audio/ambient.mp3") {
    // Guard: don't start if already playing or currently fading out
    if (this.ambientTrack || this.stopping) return;
    const track  = new Audio(src);
    track.loop   = true;
    track.volume = 0;
    track.play().catch(() => {});
    let vol = 0;
    const target = 0.55;
    const iv = setInterval(() => {
      vol = Math.min(vol + target / 60, target);
      track.volume = vol;
      if (vol >= target) clearInterval(iv);
    }, 50);
    this.ambientTrack = track;
  }

  stopAmbientTrack(fadeMs = 2000) {
    if (!this.ambientTrack) return;
    this.stopping = true;
    const track = this.ambientTrack;
    this.ambientTrack = null;
    const step  = track.volume / (fadeMs / 50);
    const iv = setInterval(() => {
      track.volume = Math.max(0, track.volume - step);
      if (track.volume <= 0) {
        track.pause();
        clearInterval(iv);
        this.stopping = false;   // safe to start again
      }
    }, 50);
  }

  setAmbientVolume(vol: number) {
    if (!this.ambientTrack) return;
    this.ambientTrack.volume = Math.max(0, Math.min(1, vol));
  }

  resume() { this.ctx?.resume(); }
  get isBooted() { return this.booted; }
}

export const audio = new AudioManager();