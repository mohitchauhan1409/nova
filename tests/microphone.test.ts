import { afterEach, describe, expect, it, vi } from 'vitest';
import { microphoneError, microphonePermission } from '../web/src/microphone';
afterEach(() => vi.unstubAllGlobals());
describe('browser-owned microphone permission', () => {
  it('reads current permission on each attempt so revocation overrides an earlier grant', async () => {
    const query = vi.fn().mockResolvedValueOnce({state:'granted'}).mockResolvedValueOnce({state:'denied'}).mockResolvedValueOnce({state:'prompt'});
    vi.stubGlobal('navigator', {permissions:{query}});
    expect(await microphonePermission()).toBe('granted');
    expect(await microphonePermission()).toBe('denied');
    expect(await microphonePermission()).toBe('prompt');
    expect(query).toHaveBeenCalledTimes(3);
    expect(query).toHaveBeenLastCalledWith({name:'microphone'});
  });
  it('never treats unsupported permission queries as granted access', async () => {
    vi.stubGlobal('navigator', {permissions:{query:vi.fn().mockRejectedValue(new TypeError('Unsupported permission'))}});
    expect(await microphonePermission()).toBe('unknown');
    vi.stubGlobal('navigator', {});
    expect(await microphonePermission()).toBe('unknown');
  });
  it('distinguishes permission denial from missing and busy microphones', () => {
    const denied = microphoneError({name:'NotAllowedError'});
    expect(denied.blocked).toBe(true); expect(denied.message).toContain('System Settings');
    expect(microphoneError({name:'NotFoundError'})).toMatchObject({blocked:false,title:'No microphone found'});
    expect(microphoneError({name:'NotReadableError'})).toMatchObject({blocked:false,title:'Your microphone could not start'});
    expect(microphoneError(null).blocked).toBe(false);
  });
});
