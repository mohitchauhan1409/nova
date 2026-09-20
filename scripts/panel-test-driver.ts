// CDP access is restricted to a disposable Chromium profile created by our
// integration tests. Playwright does not expose native side-panel pages in pages().
import type { CDPSession } from 'playwright';
export async function attachPanel(cdp: CDPSession, targetId: string) {
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: false });
  let sequence = 0;
  const pending = new Map<number, { resolve(value: any): void; reject(error: Error): void; timer: ReturnType<typeof setTimeout> }>();
  const receive = (event: { sessionId: string; message: string }) => {
    if (event.sessionId !== sessionId) return;
    const message = JSON.parse(event.message); const request = pending.get(message.id);
    if (!request) return; pending.delete(message.id); clearTimeout(request.timer);
    if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result);
  };
  cdp.on('Target.receivedMessageFromTarget', receive);
  const send = (method: string, params: object = {}): Promise<any> => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Panel test timed out: ${method}`)); }, 10000);
    pending.set(id, { resolve, reject, timer });
    void cdp.send('Target.sendMessageToTarget', { sessionId, message: JSON.stringify({ id, method, params }) }).catch(reject);
  });
  const evaluate = async <T = any>(expression: string): Promise<T> => {
    const reply = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (reply.exceptionDetails) throw new Error(reply.exceptionDetails.exception?.description || reply.exceptionDetails.text);
    return reply.result.value as T;
  };
  const waitFor = async (expression: string, timeout = 10000) => {
    const end = Date.now() + timeout;
    do { if (await evaluate<boolean>(expression)) return; await new Promise(resolve => setTimeout(resolve, 70)); } while (Date.now() < end);
    throw new Error(`Panel did not reach expected UI state: ${expression}`);
  };
  const click = async (selector: string) => {
    await waitFor(`!!document.querySelector(${JSON.stringify(selector)})`);
    const point = await evaluate<{ x: number; y: number }>(`(async()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const rect=el.getBoundingClientRect();const point={x:rect.x+rect.width/2,y:rect.y+rect.height/2};const hit=document.elementFromPoint(point.x,point.y);if(hit!==el&&!el.contains(hit))throw new Error('Test target is covered: '+${JSON.stringify(selector)});return point;})()`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
  };
  const fill = async (selector: string, text: string) => {
    await click(selector);
    await waitFor(`document.activeElement===document.querySelector(${JSON.stringify(selector)})`);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, modifiers: process.platform === 'darwin' ? 4 : 2 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, modifiers: process.platform === 'darwin' ? 4 : 2 });
    await send('Input.insertText', { text });
  };
  const screenshot = async () => Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64');
  return { evaluate, waitFor, click, fill, send, screenshot, disconnect: async () => { cdp.off('Target.receivedMessageFromTarget', receive); for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error('Panel test closed')); } pending.clear(); await cdp.send('Target.detachFromTarget', { sessionId }).catch(() => {}); } };
}
