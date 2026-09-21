// Opt-in capture build. The normal product keeps its action cursor and records
// no click telemetry. No browser protection or website content is hidden here.
declare const __NOVA_RECORDING_MODE__: boolean;
declare const __NOVA_RECORDING_SHOW_ACTION_CURSOR__: boolean;
export const recordingMode = typeof __NOVA_RECORDING_MODE__ !== 'undefined' && __NOVA_RECORDING_MODE__;
// Cursor presentation is independent of click receipts and system-pointer capture.
export const hideActionCursor = recordingMode && !(typeof __NOVA_RECORDING_SHOW_ACTION_CURSOR__ !== 'undefined' && __NOVA_RECORDING_SHOW_ACTION_CURSOR__);
export type RecordingClick = { at:number; actor:'operator'|'nova'; button:'left'|'right'; target:string };
