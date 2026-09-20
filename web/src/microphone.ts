// Browser permissions are the source of truth. Never cache an "allowed" flag:
// the user can revoke microphone access independently of Nova.
export type MicrophonePermission = PermissionState | 'unknown';
export async function microphonePermission(): Promise<MicrophonePermission> {
  try { return (await navigator.permissions.query({ name: 'microphone' as PermissionName })).state; }
  catch { return 'unknown'; }
}
export function microphoneError(error: unknown): { title: string; message: string; blocked: boolean } {
  const name = (error as { name?: string })?.name;
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') return { title: 'Microphone access is blocked', message: 'Allow microphone access for Nova in your browser. On Mac, also check System Settings → Privacy & Security → Microphone and allow your browser. Then try again.', blocked: true };
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return { title: 'No microphone found', message: 'Connect a microphone or choose an available input in your browser’s microphone settings, then try again.', blocked: false };
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') return { title: 'Your microphone could not start', message: 'Check that your microphone is connected and available. Close another app using it if necessary, then try again.', blocked: false };
  return { title: 'Microphone unavailable', message: 'Check your browser’s microphone settings and try again. You can keep using chat.', blocked: false };
}
