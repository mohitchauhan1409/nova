import type { Action, Snapshot, ServerEvent, PreparedInput } from '../../../shared/types';
export interface BrowserDriver {
  snapshot(preparedInputs?:PreparedInput[]): Promise<Snapshot>;
  execute(action: Action): Promise<unknown>;
  screenshot(): Promise<string>;
  close(): Promise<void>;
  companion?(event: ServerEvent): void;
  focus?(): Promise<void>;
}
