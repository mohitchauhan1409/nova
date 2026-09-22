import {afterEach,describe,expect,it,vi} from 'vitest';
import {ActionCursorLifetime} from '../web/companion/action-cursor';
afterEach(()=>vi.useRealTimers());
describe('genuine action cursor lifetime',()=>{
  it('keeps a held text-action cursor visible beyond the old 850ms expiry until finish',async()=>{
    vi.useFakeTimers();const visible=vi.fn();const cursor=new ActionCursorLifetime(visible);
    cursor.settle(cursor.show(),true);await vi.advanceTimersByTimeAsync(60000);
    expect(visible.mock.calls).toEqual([[true]]);cursor.clear();expect(visible.mock.calls.at(-1)).toEqual([false]);
  });
  it('a stale action delay cannot hide a newer held cursor or rearm after cancel',async()=>{
    vi.useFakeTimers();const visible=vi.fn();const cursor=new ActionCursorLifetime(visible);
    const old=cursor.show();const current=cursor.show();cursor.settle(old,false);cursor.settle(current,true);
    await vi.advanceTimersByTimeAsync(1000);expect(visible).not.toHaveBeenCalledWith(false);
    cursor.clear();cursor.settle(current,false);visible.mockClear();await vi.runAllTimersAsync();expect(visible).not.toHaveBeenCalled();
  });
  it('retains normal short action auto-hide behavior',async()=>{
    vi.useFakeTimers();const visible=vi.fn();const cursor=new ActionCursorLifetime(visible);cursor.settle(cursor.show(),false);
    await vi.advanceTimersByTimeAsync(849);expect(visible).not.toHaveBeenCalledWith(false);
    await vi.advanceTimersByTimeAsync(1);expect(visible.mock.calls.at(-1)).toEqual([false]);
  });
});
