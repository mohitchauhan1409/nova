export const maxWaitMs = 10_000;
export const boundedWaitCapability = 'bounded-processing-wait';
// Action.value is seconds. Invalid/absent values preserve the short UI-settle wait.
export function waitDurationMs(value:string|null):number {
  const seconds=value?.trim() && /^\d+(?:\.\d+)?$/.test(value.trim()) ? Number(value) : 0;
  return seconds&&Number.isFinite(seconds)?Math.min(maxWaitMs,Math.max(1,Math.round(seconds*1000))):600;
}
