import {afterEach, describe, expect, it, vi} from 'vitest';
import {characterPause, insertPacedText, pacedActionTimeout, pacedCharacters, maxPacedActionMs, settleEditorInput} from '../shared/paced-input';

afterEach(() => {vi.useRealTimers();vi.unstubAllGlobals();});
describe('recording input rhythm and bounds', () => {
  it('runs the full rhythm and punctuation pauses exactly 1.25x faster', () => {
    for (let index = 0; index < 10; index++) {
      expect(characterPause('a', index) * 1.25).toBe(150 + (index % 5) * 10);
      for (const punctuation of '.,!?;:\n') {
        expect(characterPause(punctuation, index) * 1.25).toBe(240 + (index % 5) * 10);
      }
    }
  });
  it('dispatches actual graphemes separately with pauses, including intact emoji and combining marks', async () => {
    vi.useFakeTimers(); vi.setSystemTime(0);
    const sent: {text:string; at:number}[] = [];
    const task = insertPacedText('A, 👨‍👩‍👧‍👦e\u0301', async text => {sent.push({text, at:Date.now()});}, async () => {}, 10000);
    await vi.runAllTimersAsync(); await task;
    expect(sent.map(item => item.text)).toEqual(['A', ',', ' ', '👨‍👩‍👧‍👦', 'e\u0301']);
    expect(sent.map(item => item.at)).toEqual([0,120,320,456,600]);
  });
  it('stops after the first ambiguous insertion failure, without retry or later text', async () => {
    vi.useFakeTimers(); const insert = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Lost acknowledgement'));
    const task = insertPacedText('abc', insert, async () => {}, Date.now()+10000);
    const failure = expect(task).rejects.toThrow('Lost acknowledgement');
    await vi.runAllTimersAsync(); await failure;
    expect(insert.mock.calls.map(call => call[0])).toEqual(['a','b']);
  });
  it('rechecks cancellation after pauses and stops at the deadline before another character', async () => {
    vi.useFakeTimers(); vi.setSystemTime(0); const insert = vi.fn().mockResolvedValue(undefined);
    const failure = expect(insertPacedText('abc', insert, async () => {}, 100)).rejects.toThrow('deadline');
    await vi.runAllTimersAsync(); await failure; expect(insert).toHaveBeenCalledTimes(1);
  });
  it('extends a real typing budget beyond 15 seconds and rejects oversized text before dispatch', () => {
    expect(pacedActionTimeout('x'.repeat(100))).toBeGreaterThan(30000);
    expect(pacedActionTimeout('.'.repeat(1000))).toBe(maxPacedActionMs);
    expect(() => pacedCharacters('x'.repeat(1001))).toThrow('limited');
  });
});


describe('bounded rich-editor settling',()=>{
  it('waits exactly two animation frames and cancels the timer',async()=>{
    vi.useFakeTimers();const frames:FrameRequestCallback[]=[];
    vi.stubGlobal('requestAnimationFrame',vi.fn(callback=>{frames.push(callback);return frames.length;}));vi.stubGlobal('cancelAnimationFrame',vi.fn());
    let complete=false;const task=settleEditorInput().then(()=>{complete=true;});
    frames[0](0);await Promise.resolve();expect(complete).toBe(false);
    frames[1](16);await task;expect(complete).toBe(true);expect(vi.getTimerCount()).toBe(0);
  });
  it('caps suspended animation frames at 80 ms',async()=>{
    vi.useFakeTimers();vi.stubGlobal('requestAnimationFrame',vi.fn(()=>7));const cancel=vi.fn();vi.stubGlobal('cancelAnimationFrame',cancel);
    let complete=false;const task=settleEditorInput().then(()=>{complete=true;});
    await vi.advanceTimersByTimeAsync(79);expect(complete).toBe(false);
    await vi.advanceTimersByTimeAsync(1);await task;expect(cancel).toHaveBeenCalledWith(7);
  });
});
