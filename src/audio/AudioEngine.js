export class AudioEngine {
  constructor() {
    this.ac = null;
    this.master = null;
    this.nodes = [];
    this.cur = null;
  }

  init() {
    if (!this.ac) {
      this.ac = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ac.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ac.destination);
    }
    if (this.ac.state === 'suspended') this.ac.resume();
  }

  vol(v, r = 1.5) {
    if (!this.ac) return;
    this.master.gain.cancelScheduledValues(this.ac.currentTime);
    this.master.gain.linearRampToValueAtTime(v, this.ac.currentTime + r);
  }

  play(type) {
    if (type === this.cur) return;
    this.stop();
    this.cur = type;
    if (!this.ac || type === 'silence') return;
    if (type === 'rain')    { this._noise(3200, 0.6, 0.35); this._noise(800, 2.5, 0.2); }
    if (type === 'wind')    { this._noise(280, 6, 0.5); this._noise(120, 3, 0.25); }
    if (type === 'tension') { this._drone(52, 0.25); this._drone(55.5, 0.12); this._pulse(); }
  }

  _noise(freq, q, gain) {
    const len = this.ac.sampleRate * 4;
    const buf = this.ac.createBuffer(2, len, this.ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = this.ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = this.ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = this.ac.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(this.master); src.start();
    this.nodes.push(src);
  }

  _drone(freq, gain) {
    const o = this.ac.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
    const g = this.ac.createGain(); g.gain.value = gain;
    o.connect(g); g.connect(this.master); o.start();
    this.nodes.push(o);
  }

  _pulse() {
    const lfo = this.ac.createOscillator(); lfo.frequency.value = 1.1;
    const lg = this.ac.createGain(); lg.gain.value = 0.06;
    const d = this.ac.createOscillator(); d.type = 'sine'; d.frequency.value = 80;
    const g = this.ac.createGain(); g.gain.value = 0.08;
    lfo.connect(lg); lg.connect(d.frequency);
    d.connect(g); g.connect(this.master);
    lfo.start(); d.start();
    this.nodes.push(lfo, d);
  }

  stop() {
    this.nodes.forEach(n => { try { n.stop(); } catch (_) {} });
    this.nodes = [];
    this.cur = null;
  }

  dispose() {
    this.stop();
    if (this.ac) this.ac.close();
  }
}
