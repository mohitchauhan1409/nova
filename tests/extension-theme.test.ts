import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '../shared/types';

function event() {
  const listeners: ((...args: any[]) => void)[] = [];
  return { removeListener:(listener:(...args:any[])=>void)=>{const index=listeners.indexOf(listener);if(index>=0)listeners.splice(index,1);}, addListener: (listener: (...args: any[]) => void) => listeners.push(listener), emit: (...args: any[]) => listeners.forEach(listener => listener(...args)) };
}

async function setup() {
  vi.resetModules(); vi.useFakeTimers();
  const onConnect = event();
  const attach = vi.fn(); const sendCommand = vi.fn();
  const tab = (id: number) => ({ id, url: `https://site${id}.test/`, title: 'Fixture', windowId: 1 });
  const chromeMock = {
    runtime: { id: 'extension-id', onConnect, onMessage: event() },
    storage: { local: { get: vi.fn().mockResolvedValue({ novaToken: 'test-token' }), set: vi.fn() } },
    sidePanel: { setOptions: vi.fn().mockResolvedValue(undefined), onClosed: event() },
    tabs: { get: vi.fn((id: number) => Promise.resolve(tab(id))), sendMessage: vi.fn().mockResolvedValue({}), onActivated: event(), onUpdated: event(), onRemoved: event() },
    permissions: { onRemoved: event(), contains: vi.fn().mockResolvedValue(true) },
    debugger: { attach, sendCommand, onDetach: event() },
    action: { onClicked: event() },
  };
  const sockets: FakeSocket[] = [];
  class FakeSocket {
    static CONNECTING = 0; static OPEN = 1;
    readyState = 0;
    onmessage?: (event: { data: string }) => void;
    onclose?:()=>void;
    send = vi.fn(); close = vi.fn();
    constructor() { sockets.push(this); }
    receive(message: unknown) { this.readyState = 1; this.onmessage?.({ data: JSON.stringify(message) }); }
  }
  vi.stubGlobal('chrome', chromeMock); vi.stubGlobal('WebSocket', FakeSocket);
  await import('../web/extension/background');
  const port = (name: 'nova-page' | 'nova-panel', id: number, frameId = 0) => {
    const channel = { name, sender: { id: 'extension-id', frameId, tab: tab(id), url: `chrome-extension://extension-id/panel.html?tabId=${id}` }, onMessage: event(), onDisconnect: event(), postMessage: vi.fn() };
    onConnect.emit(channel);
    return channel;
  };
  return { port, sockets, attach, sendCommand, chromeMock };
}
const session: Session = { id: 'session', tabId: 1, siteId: 'fixture', mode: 'extension', status: 'ready', url: 'https://site1.test/', title: 'Fixture', messages: [], traces: [], steps: 0, model: 'fixture', startedAt: 1 };
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('passive extension theme routing', () => {
  it('delivers the page scheme before backend readiness and decorates snapshot-free sessions without debugger input', async () => {
    const f = await setup();
    const page = f.port('nova-page', 1);
    page.onMessage.emit({ type: 'nova-page-connect', scheme: 'dark' });
    const panel = f.port('nova-panel', 1);
    panel.onMessage.emit({ type: 'nova-panel-connect' });
    expect(panel.postMessage).toHaveBeenCalledWith({ type: 'page-theme', scheme: 'dark' });
    await Promise.resolve();
    f.sockets[0].receive({ type: 'ready', role: 'extension' });
    f.sockets[0].receive({ type: 'session', session });
    expect(panel.postMessage).toHaveBeenCalledWith({ type: 'session', session: { ...session, pageColorScheme: 'dark' } });
    page.onMessage.emit({ type: 'nova-page-theme', scheme: 'light' });
    f.sockets[0].receive({ type: 'session', session: { ...session, lastSnapshot: { theme: { scheme: 'dark' } } } });
    expect(panel.postMessage.mock.calls.at(-1)?.[0].session.pageColorScheme).toBe('light');
    expect(f.attach).not.toHaveBeenCalled();
    expect(f.sendCommand).not.toHaveBeenCalled();
    expect(f.chromeMock.tabs.sendMessage).not.toHaveBeenCalled();
  });

  it('rejects invalid, subframe, panel, and replaced-document theme messages and clears the old tab theme', async () => {
    const f = await setup();
    const first = f.port('nova-page', 1);
    first.onMessage.emit({ type: 'nova-page-connect', scheme: 'dark' });
    const panel = f.port('nova-panel', 1);
    panel.onMessage.emit({ type: 'nova-panel-connect' });
    const replacement = f.port('nova-page', 1);
    replacement.onMessage.emit({ type: 'nova-page-connect', scheme: 'light' });
    panel.postMessage.mockClear();
    first.onMessage.emit({ type: 'nova-page-theme', scheme: 'dark' });
    panel.onMessage.emit({ type: 'nova-page-theme', scheme: 'dark' });
    replacement.onMessage.emit({ type: 'nova-page-theme', scheme: '<script>' });
    f.port('nova-page', 1, 3).onMessage.emit({ type: 'nova-page-connect', scheme: 'dark' });
    expect(panel.postMessage).not.toHaveBeenCalled();
    const other = f.port('nova-page', 2);
    other.onMessage.emit({ type: 'nova-page-connect' });
    const otherPanel = f.port('nova-panel', 2);
    otherPanel.onMessage.emit({ type: 'nova-panel-connect' });
    expect(otherPanel.postMessage).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'page-theme' }));
    panel.postMessage.mockClear();
    other.onMessage.emit({ type: 'nova-page-theme', scheme: 'dark' });
    expect(otherPanel.postMessage).toHaveBeenCalledWith({ type: 'page-theme', scheme: 'dark' });
    expect(panel.postMessage).not.toHaveBeenCalled();
    expect(f.attach).not.toHaveBeenCalled();
  });
});

describe('cancellation before trusted input dispatch',()=>{
  it.each(['stop','disconnect'])('does not enter text after %s while the tab is loading',async(interruption)=>{
    const f=await setup();const page=f.port('nova-page',1);page.onMessage.emit({type:'nova-page-connect',scheme:'dark'});
    const panel=f.port('nova-panel',1);panel.onMessage.emit({type:'nova-panel-connect'});await Promise.resolve();
    const socket=f.sockets[0];socket.receive({type:'ready',role:'extension'});socket.receive({type:'session',session:{...session,status:'running'}});
    f.chromeMock.tabs.get.mockResolvedValue({id:1,url:session.url,title:'Fixture',windowId:1,active:true,status:'loading'} as any);
    socket.receive({type:'driver',id:'delayed-input',method:'execute',payload:{tabId:1,data:{kind:'fill',ref:'field',value:'Must not type',url:null,x:null,y:null,risk:'change',summary:'Fill field'}}});
    await vi.advanceTimersByTimeAsync(0);
    if(interruption==='stop')panel.onMessage.emit({type:'nova-relay',data:{type:'stop',sessionId:session.id}});else socket.onclose?.();
    f.chromeMock.tabs.onUpdated.emit(1,{status:'complete'});await vi.advanceTimersByTimeAsync(0);
    expect(f.sendCommand).not.toHaveBeenCalled();expect(f.attach).not.toHaveBeenCalled();
    expect(f.chromeMock.tabs.sendMessage).not.toHaveBeenCalled();
    if(interruption==='stop')expect(socket.send.mock.calls.map(call=>JSON.parse(call[0]))).toContainEqual(expect.objectContaining({id:'delayed-input',error:expect.stringContaining('stopped')}));
  });
  it('rejects an old token when permission lookup finishes after Stop',async()=>{
    const f=await setup();const page=f.port('nova-page',1);page.onMessage.emit({type:'nova-page-connect'});
    const panel=f.port('nova-panel',1);panel.onMessage.emit({type:'nova-panel-connect'});await Promise.resolve();
    const socket=f.sockets[0];socket.receive({type:'ready',role:'extension'});socket.receive({type:'session',session:{...session,status:'running'}});
    let grant!:(value:boolean)=>void;f.chromeMock.permissions.contains.mockImplementation(()=>new Promise(resolve=>{grant=resolve;}));
    socket.receive({type:'driver',id:'permission-input',method:'execute',payload:{tabId:1,data:{kind:'fill',ref:'field',value:'Must not type',url:null,x:null,y:null,risk:'change',summary:'Fill field'}}});
    await vi.advanceTimersByTimeAsync(0);panel.onMessage.emit({type:'nova-relay',data:{type:'stop',sessionId:session.id}});grant(true);await vi.advanceTimersByTimeAsync(0);
    expect(f.sendCommand).not.toHaveBeenCalled();expect(f.attach).not.toHaveBeenCalled();
  });
});
