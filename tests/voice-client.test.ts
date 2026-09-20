import { afterEach, describe, expect, it, vi } from 'vitest';
import { VoiceClient } from '../web/src/voice';

afterEach(() => vi.unstubAllGlobals());
describe('voice capture cancellation', () => {
  it('releases a late microphone grant and never starts voice after cancellation', async () => {
    let grant!: (stream: MediaStream) => void;
    const pending = new Promise<MediaStream>(resolve => { grant = resolve; });
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: () => pending } });
    const track = { stop: vi.fn() };
    const send = vi.fn(); const level = vi.fn();
    const voice = new VoiceClient(send, level);
    const starting = voice.start('test-session');
    await voice.stop();
    grant({ getTracks: () => [track] } as unknown as MediaStream);
    await starting;
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(send.mock.calls.map(([message]) => message.type)).toEqual(['voice-stop']);
    expect(level).toHaveBeenLastCalledWith(0);
    await voice.stop();
    expect(send).toHaveBeenCalledTimes(1);
  });
});
