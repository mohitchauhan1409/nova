import { WebSocket } from 'ws';
import { randomUUID } from 'node:crypto';
import { config, safeError, redactSecrets } from '../config';
import type { ServerEvent } from '../../../shared/types';

type VoiceEvent = Extract<ServerEvent, { type: 'voice' }>;
export class SarvamVoice {
  private stt?: WebSocket; private tts?: WebSocket;
  private keepalive?: ReturnType<typeof setInterval>;
  private acknowledgment?: AbortController;
  private audioQueue: string[] = [];
  private closed = false;
  constructor(private emit: (event: VoiceEvent) => void, private onTranscript: (text: string) => void, private onInterrupt: () => void) {}
  start() {
    if (!config.sarvamKey) throw new Error('Add SARVAM_API_KEY to .env and restart the backend.');
    const query = new URLSearchParams({ model: config.sttModel, language_code: 'en-IN', stream_type: 'fast', mode: 'transcribe', endpointing: 'vad', encoding: 'linear16', sample_rate: '16000', silence_duration_ms: '500', min_speech_duration_ms: '250' });
    this.stt = new WebSocket(`wss://api.sarvam.ai/speech-to-text-realtime/ws?${query}`, { headers: { 'api-subscription-key': config.sarvamKey }, handshakeTimeout: 10000 });
    this.stt.on('open', () => { for (const audio of this.audioQueue) this.audio(audio); this.audioQueue = []; });
    this.stt.on('message', raw => {
      if (this.closed) return;
      try {
        const event = JSON.parse(raw.toString());
        if (event.event === 'session.begin') this.emit({ type: 'voice', event: 'listening' });
        else if (event.event === 'vad.speech_start') { this.interrupt(); this.onInterrupt(); this.emit({ type: 'voice', event: 'speech-start' }); }
        else if (event.event === 'transcript.partial') this.emit({ type: 'voice', event: 'partial', text: event.text });
        else if (event.event === 'transcript.final' && typeof event.text === 'string' && event.text.trim()) { this.emit({ type: 'voice', event: 'transcript', text: event.text }); this.onTranscript(event.text); }
        else if (event.event === 'error') { this.emit({ type: 'voice', event: 'error', message: `Sarvam speech recognition: ${safeError(event.message || event.code)}` }); if (event.is_fatal) this.close(); }
      } catch { this.emit({ type: 'voice', event: 'error', message: 'Received an invalid speech recognition event.' }); }
    });
    this.stt.on('error', error => { if (!this.closed) this.emit({ type: 'voice', event: 'error', message: safeError(error) }); });
    this.stt.on('close', code => { if (!this.closed) { this.emit({ type: 'voice', event: 'error', message: `Speech recognition disconnected (${code}). Start voice again to reconnect.` }); this.close(); } });
    this.keepalive = setInterval(() => { if (this.stt?.readyState === WebSocket.OPEN) this.stt.send(JSON.stringify({ event: 'ping' })); }, 15000);
  }
  audio(audio: string) {
    if (this.closed) return;
    if (this.stt?.readyState === WebSocket.OPEN) { if (this.stt.bufferedAmount < 256000) this.stt.send(JSON.stringify({ event: 'audio_input', audio })); }
    else if (this.audioQueue.length < 20) this.audioQueue.push(audio);
  }
  // Progress comes from the grounded action planner, so it costs no extra LLM call
  // and cannot race a late generic acknowledgment against a final answer.
  progress(text:string) {
    if(this.tts && this.tts.readyState!==WebSocket.CLOSED)return;
    this.speak(text);
  }
  speak(text: string, cancelAcknowledgment = true) {
    if (this.closed) return;
    text = redactSecrets(text);
    if (cancelAcknowledgment) this.acknowledgment?.abort();
    this.stopTTS();
    const utteranceId = randomUUID();
    const ws = new WebSocket(`wss://api.sarvam.ai/text-to-speech/ws?model=${encodeURIComponent(config.ttsModel)}&send_completion_event=true`, { headers: { 'api-subscription-key': config.sarvamKey }, handshakeTimeout: 10000 });
    this.tts = ws;
    const timeout = setTimeout(() => { if (this.tts === ws) { this.emit({ type: 'voice', event: 'error', message: 'Speech synthesis timed out. The text response is still available.' }); this.stopTTS(); } }, 25000);
    ws.on('open', () => {
      if (this.closed || this.tts !== ws) { ws.close(); return; }
      ws.send(JSON.stringify({ type: 'config', data: { language_code: 'en-IN', speaker: config.speaker, speech_sample_rate: 24000, output_audio_codec: 'linear16', pace: 1.05, min_buffer_size: 30, max_chunk_length: 180 } }));
      // Speech uses the exact browser answer. Strip only display markup and long URLs.
      const spoken = text.replace(/\[([^\]]+)\]\(https?:[^)]+\)/g, '$1').replace(/https?:\/\/\S+/g, 'the linked page').replace(/[*#`]/g, '').slice(0, 2400);
      ws.send(JSON.stringify({ type: 'text', data: { text: spoken } })); ws.send(JSON.stringify({ type: 'flush' }));
      this.emit({ type: 'voice', event: 'speaking', text: spoken, utteranceId });
    });
    ws.on('message', raw => {
      if (this.tts !== ws) return;
      try {
        const event = JSON.parse(raw.toString());
        if (event.type === 'audio' && event.data?.audio) this.emit({ type: 'voice', event: 'audio', audio: event.data.audio, sampleRate: 24000, utteranceId });
        if (event.type === 'event' && event.data?.event_type === 'final') { clearTimeout(timeout); this.emit({ type: 'voice', event: 'speech-done', utteranceId }); ws.close(); }
        if (event.type === 'error') { clearTimeout(timeout); this.emit({ type: 'voice', event: 'error', message: `Sarvam speech synthesis: ${safeError(event.data?.message || 'provider error')}` }); ws.close(); }
      } catch { this.emit({ type: 'voice', event: 'error', message: 'Received an invalid speech synthesis event.' }); }
    });
    ws.on('error', error => { if (!this.closed && this.tts === ws) this.emit({ type: 'voice', event: 'error', message: safeError(error) }); });
    ws.on('close', () => clearTimeout(timeout));
  }
  private stopTTS() { const previous = this.tts; this.tts = undefined; if (previous?.readyState === WebSocket.CONNECTING) previous.terminate(); else previous?.close(); }
  interrupt() { this.acknowledgment?.abort(); this.stopTTS(); this.emit({ type: 'voice', event: 'interrupted' }); }
  close() { if (this.closed) return; this.closed = true; this.interrupt(); clearInterval(this.keepalive); if (this.stt?.readyState === WebSocket.CONNECTING) this.stt.terminate(); else this.stt?.close(); this.audioQueue = []; }
}
