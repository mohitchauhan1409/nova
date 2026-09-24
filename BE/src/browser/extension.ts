import { randomUUID } from 'node:crypto';
import { realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import type { WebSocket } from 'ws';
import type { BrowserDriver } from './driver';
import type { Action, Snapshot, PreparedInput } from '../../../shared/types';
import { assertPublicUrl } from './security';
import { inputActionKinds, pacedActionTimeout, pacedInputCapability } from '../../../shared/paced-input';
import { config } from '../config';
export class ExtensionBrowser implements BrowserDriver {
  async focus(){await this.request('focus');}
  private pacedInput = false;
  private pending = new Map<string, { resolve(value: unknown): void; reject(reason: Error): void; timer: ReturnType<typeof setTimeout> }>();
  constructor(private socket: WebSocket, readonly tabId: number) {}
  private request(method: string, payload?: unknown, timeoutMs = 15000): Promise<unknown> {
    if (this.socket.readyState !== 1) return Promise.reject(new Error('The extension disconnected. Reconnect it before continuing.'));
    return new Promise((resolve, reject) => {
      const id = randomUUID();
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('The browser did not respond. Bring the attached tab to the foreground and retry.')); }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ type: 'driver', id, method, payload: { tabId: this.tabId, data: payload } }));
    });
  }
  receive(id: string, result: unknown, error?: string) { const request = this.pending.get(id); if (!request) return; clearTimeout(request.timer); this.pending.delete(id); error ? request.reject(new Error(error)) : request.resolve(result); }
  async snapshot(preparedInputs:PreparedInput[]=[]) { const snapshot = await this.request('snapshot',preparedInputs) as Snapshot; this.pacedInput = !!snapshot.capabilities?.includes(pacedInputCapability); return snapshot; }
  async execute(action: Action) {
    if (action.kind === 'navigate') await assertPublicUrl(action.url || '');
    if (action.kind === 'upload') {
      const requested=(action.value||'').trim();
      if(!config.uploadRoot)throw new Error('Local file upload is not configured for this Nova build.');
      if(!requested||requested!==path.basename(requested)||requested.length>180)throw new Error('Choose one approved local fixture by filename only.');
      const root=realpathSync(config.uploadRoot);const file=realpathSync(path.join(root,requested));
      if(file!==path.join(root,requested)||!file.startsWith(`${root}${path.sep}`)||!statSync(file).isFile())throw new Error('That filename is outside the approved local fixture directory.');
      action={...action,value:file};
    }
    return this.request('execute', action, this.pacedInput && inputActionKinds.has(action.kind) ? pacedActionTimeout(action.value || '') : 15000);
  }
  async screenshot() { return await this.request('screenshot') as string; }
  async close() { for (const request of this.pending.values()) { clearTimeout(request.timer); request.reject(new Error('Browser session ended.')); } this.pending.clear(); }
}
