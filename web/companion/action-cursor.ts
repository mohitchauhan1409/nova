// Cursor visibility follows real action lifetime; stale delays cannot rearm it.
export class ActionCursorLifetime {
  private generation = 0;
  private timer?: ReturnType<typeof setTimeout>;
  constructor(private visible: (show: boolean) => void) {}
  show() { clearTimeout(this.timer); this.visible(true); return ++this.generation; }
  settle(generation: number, hold: boolean) {
    if (generation !== this.generation || hold) return;
    this.timer = setTimeout(() => { if (generation === this.generation) this.visible(false); }, 850);
  }
  clear() { this.generation++; clearTimeout(this.timer); this.visible(false); }
}
