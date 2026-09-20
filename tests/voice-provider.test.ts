import type { EventEmitter } from 'node:events';
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('../BE/src/config', () => ({ config: { sarvamKey: 'test-placeholder', sttModel: 'test', ttsModel: 'test', speaker: 'test' }, redactSecrets: (text:string)=>text.replace(/sk[-_][\w-]{10,}/g,'[redacted]'), safeError: (error: unknown) => error instanceof Error ? error.message : String(error) }));
vi.mock('ws', async () => {
  const { EventEmitter } = await import('node:events');
  class Socket extends EventEmitter {
    static CONNECTING = 0; static OPEN = 1; static instances: Socket[] = [];
    readyState = 0; bufferedAmount = 0;
    constructor() { super(); Socket.instances.push(this); }
    send = vi.fn(); close = vi.fn(() => this.emit('close', 1000)); terminate = vi.fn(() => this.emit('close', 1000));
  }
  return { WebSocket: Socket };
});
import { WebSocket } from 'ws';
import { SarvamVoice } from '../BE/src/providers/sarvam';
const sockets = () => (WebSocket as unknown as {instances: EventEmitter[]}).instances;
afterEach(() => { sockets().length = 0; vi.unstubAllGlobals(); });
describe('voice provider ownership', () => {
  it('speaks grounded progress without another model call and never cuts off active speech',()=>{
    const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
    const voice=new SarvamVoice(vi.fn(),vi.fn(),vi.fn());const speak=vi.spyOn(voice,'speak');
    voice.progress('I’m opening the workflow.');expect(speak).toHaveBeenCalledTimes(1);
    voice.progress('I’m checking the connections.');expect(speak).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();voice.close();
  });
  it('ignores errors and transcripts delivered after a voice conversation is closed', () => {
    const events = vi.fn(); const transcript = vi.fn(); const interrupt = vi.fn();
    const voice = new SarvamVoice(events, transcript, interrupt);
    voice.start(); voice.speak('Fixture greeting'); voice.close(); events.mockClear();
    sockets()[0].emit('error', new Error('Cancelled connection'));
    sockets()[0].emit('message', Buffer.from(JSON.stringify({event:'transcript.final',text:'Old request'})));
    sockets()[1].emit('error', new Error('Cancelled speech'));
    sockets()[1].emit('open');
    expect(events).not.toHaveBeenCalled(); expect(transcript).not.toHaveBeenCalled();
  });
  it('ignores a superseded speech socket without hiding an active socket error', () => {
    const events = vi.fn(); const voice = new SarvamVoice(events, vi.fn(), vi.fn());
    voice.speak('First response'); voice.speak('Replacement response');
    sockets()[0].emit('error', new Error('Cancelled first response'));
    expect(events).not.toHaveBeenCalled();
    sockets()[1].emit('error', new Error('Active connection failed'));
    expect(events).toHaveBeenCalledWith(expect.objectContaining({event:'error',message:'Active connection failed'}));
    voice.close();
  });
});
