class NovaPCM extends AudioWorkletProcessor {
  constructor() { super(); this.samples = []; this.phase = 0; }
  process(inputs, outputs) {
    const audio = inputs[0]?.[0];
    if (audio) {
      // AudioContext requests 16 kHz; resample if the device context uses another rate.
      const ratio = sampleRate / 16000;
      while (this.phase < audio.length) {
        const sample = Math.max(-1, Math.min(1, audio[Math.floor(this.phase)]));
        this.samples.push(Math.round(sample * (sample < 0 ? 32768 : 32767))); this.phase += ratio;
      }
      this.phase -= audio.length;
      if (this.samples.length >= 1600) {
        const pcm = new Int16Array(this.samples.splice(0, 1600)); let sum = 0; for (const n of pcm) sum += (n / 32768) ** 2;
        this.port.postMessage({ pcm: pcm.buffer, level: Math.sqrt(sum / pcm.length) }, [pcm.buffer]);
      }
    }
    return true;
  }
}
registerProcessor('nova-pcm', NovaPCM);
