import type { ServerEvent } from '../../shared/types';
type VoiceEvent = Extract<ServerEvent, { type: 'voice' }>;
export class VoiceClient {
  private stopped = false;
  private stream?: MediaStream; private context?: AudioContext; private input?: AudioWorkletNode;
  private sources = new Set<AudioBufferSourceNode>(); private nextTime = 0; private utterance = '';
  private fallback?: ScriptProcessorNode;
  constructor(private send: (event: unknown) => void, private onLevel: (level: number) => void, private workletUrl?: string) {}
  async start(sessionId: string) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
    if (this.stopped) { stream.getTracks().forEach(track => track.stop()); return; }
    this.stream = stream;
    try {
      this.context = new AudioContext({ sampleRate: 16000 }); await this.context.resume();
      if (this.stopped) return;
      const source = this.context.createMediaStreamSource(this.stream);
      const gain = this.context.createGain(); gain.gain.value = 0;
      const sendPCM = (pcm: Int16Array, level: number) => {
        if (this.stopped) return;
        this.onLevel(level);
        const bytes = new Uint8Array(pcm.buffer); let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
        this.send({ type: 'audio', audio: btoa(binary) });
      };
      try {
        await this.context.audioWorklet.addModule(this.workletUrl || new URL('./pcm-worklet.js', location.href).href);
        if (this.stopped) return;
        this.input = new AudioWorkletNode(this.context, 'nova-pcm');
        source.connect(this.input).connect(gain).connect(this.context.destination);
        this.input.port.onmessage = event => sendPCM(new Int16Array(event.data.pcm), event.data.level);
      } catch {
        if (this.stopped) return;
        // Some site CSPs forbid a worklet URL. Keep microphone use available with
        // the browser's PCM callback instead of asking the site to weaken its CSP.
        this.fallback = this.context.createScriptProcessor(1024, 1, 1);
        this.fallback.onaudioprocess = event => {
          const samples = event.inputBuffer.getChannelData(0); const pcm = new Int16Array(samples.length); let energy = 0;
          for (let i=0;i<samples.length;i++) { pcm[i]=Math.max(-1,Math.min(1,samples[i]))*32767; energy+=samples[i]*samples[i]; }
          sendPCM(pcm, Math.sqrt(energy/samples.length));
        };
        source.connect(this.fallback).connect(gain).connect(this.context.destination);
      }
      if (!this.stopped) this.send({ type: 'voice-start', sessionId });
    } catch (error) { await this.stop(); throw error; }
  }
  handle(event: VoiceEvent) {
    if (['interrupted', 'speech-start'].includes(event.event)) this.interrupt();
    if (event.event === 'speaking') { this.interrupt(); this.utterance = event.utteranceId || ''; }
    if (event.event === 'audio' && event.audio && this.context && event.utteranceId === this.utterance) {
      const binary = atob(event.audio); const bytes = new Uint8Array(binary.length); for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const view = new DataView(bytes.buffer); const frames = Math.floor(bytes.length / 2);
      const buffer = this.context.createBuffer(1, frames, event.sampleRate || 24000); const channel = buffer.getChannelData(0);
      for (let i = 0; i < frames; i++) channel[i] = view.getInt16(i * 2, true) / 32768;
      const source = this.context.createBufferSource(); source.buffer = buffer; source.connect(this.context.destination);
      this.nextTime = Math.max(this.context.currentTime + 0.03, this.nextTime); source.start(this.nextTime); this.nextTime += buffer.duration;
      this.sources.add(source); source.onended = () => this.sources.delete(source);
    }
  }
  interrupt() { for (const source of this.sources) { try { source.stop(); } catch {} } this.sources.clear(); this.nextTime = 0; this.utterance = ''; }
  async stop() { if (this.stopped) return; this.stopped=true; this.send({ type: 'voice-stop' }); this.interrupt(); this.input?.disconnect(); this.fallback?.disconnect(); this.fallback=undefined; this.stream?.getTracks().forEach(track => track.stop()); if(this.context?.state!=='closed')await this.context?.close(); this.context = undefined; this.input = undefined; this.stream = undefined; this.onLevel(0); }
}
